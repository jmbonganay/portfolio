const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const IP_RATE_LIMIT_MAX_REQUESTS = 5;
const USER_RATE_LIMIT_MAX_REQUESTS = 3;
const WEBHOOK_TIMEOUT_MS = 8_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SUBMISSION_TYPES = new Set(["ai_scoper", "contact_form"]);
const BASE_ALLOWED_FIELDS = new Set([
  "botcheck",
  "email",
  "message",
  "name",
  "projectIdea",
  "projectType",
  "submissionType",
]);
const REQUIRED_FIELDS_BY_SUBMISSION_TYPE = {
  ai_scoper: ["name", "email", "projectIdea", "submissionType"],
  contact_form: ["name", "email", "message", "projectIdea", "projectType", "submissionType"],
};
const rateLimitStores = {
  ip: new Map(),
  user: new Map(),
};

function getHeader(request, name) {
  if (typeof request.headers?.get === "function") {
    return request.headers.get(name);
  }

  return request.headers[name] || request.headers[name.toLowerCase()];
}

function parsePayload(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getBodyByteLength(body) {
  if (!body) {
    return 0;
  }

  if (typeof body === "string") {
    return Buffer.byteLength(body, "utf8");
  }

  try {
    return Buffer.byteLength(JSON.stringify(body), "utf8");
  } catch {
    return MAX_BODY_BYTES + 1;
  }
}

function isSameOriginRequest(request) {
  const origin = getHeader(request, "origin");
  const host = getHeader(request, "host");

  if (!origin || !host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function getClientIp(request) {
  const forwardedFor = getHeader(request, "x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return getHeader(request, "x-real-ip") || request.socket?.remoteAddress || "unknown";
}

function checkRateLimit(store, key, maxRequests) {
  const now = Date.now();

  for (const [storedKey, currentWindow] of store.entries()) {
    if (currentWindow.resetAt <= now) {
      store.delete(storedKey);
    }
  }

  const currentWindow = store.get(key);

  if (!currentWindow || currentWindow.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false };
  }

  currentWindow.count += 1;

  if (currentWindow.count <= maxRequests) {
    return { limited: false };
  }

  return {
    limited: true,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((currentWindow.resetAt - now) / 1000),
    ),
  };
}

function applyRateLimits(request, payload) {
  const ipLimit = checkRateLimit(
    rateLimitStores.ip,
    getClientIp(request),
    IP_RATE_LIMIT_MAX_REQUESTS,
  );

  if (ipLimit.limited) {
    return ipLimit;
  }

  return checkRateLimit(
    rateLimitStores.user,
    `${payload.submissionType}:${payload.email}`,
    USER_RATE_LIMIT_MAX_REQUESTS,
  );
}

function isAllowedWebhookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "make.com" || url.hostname.endsWith(".make.com"));
  } catch {
    return false;
  }
}

function validateStringField(payload, fieldName, options = {}) {
  const {
    maxLength = 1200,
    minLength = 0,
    pattern = null,
    required = false,
  } = options;
  const value = payload[fieldName];

  if (value === undefined || value === null) {
    if (required) {
      return { ok: false };
    }

    return { ok: true, value: "" };
  }

  if (typeof value !== "string") {
    return { ok: false };
  }

  const cleanedValue = value.trim();

  if (required && !cleanedValue) {
    return { ok: false };
  }

  if (cleanedValue.length < minLength || cleanedValue.length > maxLength) {
    return { ok: false };
  }

  if (pattern && !pattern.test(cleanedValue)) {
    return { ok: false };
  }

  return { ok: true, value: cleanedValue };
}

function validatePayload(payload) {
  if (!isPlainObject(payload)) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  const unexpectedField = Object.keys(payload).find(
    (fieldName) => !BASE_ALLOWED_FIELDS.has(fieldName),
  );

  if (unexpectedField) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  const botcheck = validateStringField(payload, "botcheck", {
    maxLength: 20,
  });

  if (!botcheck.ok) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  if (botcheck.value) {
    return { ok: false, status: 202, error: null };
  }

  const submissionType = validateStringField(payload, "submissionType", {
    maxLength: 80,
    required: true,
  });

  if (
    !submissionType.ok ||
    !ALLOWED_SUBMISSION_TYPES.has(submissionType.value)
  ) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  const requiredFields =
    REQUIRED_FIELDS_BY_SUBMISSION_TYPE[submissionType.value] || [];
  const missingRequiredField = requiredFields.find(
    (fieldName) => payload[fieldName] === undefined || payload[fieldName] === null,
  );

  if (missingRequiredField) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  const name = validateStringField(payload, "name", {
    maxLength: 160,
    required: true,
  });
  const email = validateStringField(payload, "email", {
    maxLength: 240,
    pattern: EMAIL_PATTERN,
    required: true,
  });
  const projectIdea = validateStringField(payload, "projectIdea", {
    maxLength: 3000,
    minLength: 20,
    required: true,
  });
  const message = validateStringField(payload, "message", {
    maxLength: 3000,
    minLength: submissionType.value === "contact_form" ? 20 : 0,
    required: submissionType.value === "contact_form",
  });
  const projectType = validateStringField(payload, "projectType", {
    maxLength: 160,
    required: submissionType.value === "contact_form",
  });

  if (
    !name.ok ||
    !email.ok ||
    !projectIdea.ok ||
    !message.ok ||
    !projectType.ok
  ) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  return {
    ok: true,
    payload: {
      name: name.value,
      email: email.value.toLowerCase(),
      message: message.value || projectIdea.value,
      projectIdea: projectIdea.value,
      projectType: projectType.value || "Not selected",
      submissionType: submissionType.value,
    },
  };
}

function sendRateLimitResponse(response, result) {
  response.setHeader("Retry-After", String(result.retryAfterSeconds));
  return response.status(429).json({
    error: "Too many requests",
    retryAfter: result.retryAfterSeconds,
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  response.setHeader("Cache-Control", "no-store");

  if (!isSameOriginRequest(request)) {
    return response.status(403).json({ error: "Forbidden" });
  }

  const contentType = getHeader(request, "content-type") || "";
  if (!contentType.includes("application/json")) {
    return response.status(415).json({ error: "Unsupported media type" });
  }

  const contentLength = Number.parseInt(getHeader(request, "content-length") || "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return response.status(413).json({ error: "Request too large" });
  }

  if (getBodyByteLength(request.body) > MAX_BODY_BYTES) {
    return response.status(413).json({ error: "Request too large" });
  }

  const payload = parsePayload(request.body);
  const validation = validatePayload(payload);

  if (!validation.ok) {
    if (validation.status === 202) {
      return response.status(202).json({ ok: true });
    }

    return response.status(validation.status).json({ error: validation.error });
  }

  const rateLimit = applyRateLimits(request, validation.payload);

  if (rateLimit.limited) {
    return sendRateLimitResponse(response, rateLimit);
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return response.status(503).json({ error: "Automation endpoint is not configured" });
  }

  if (!isAllowedWebhookUrl(webhookUrl)) {
    return response.status(503).json({ error: "Automation endpoint is not configured" });
  }

  const forwardedPayload = {
    name: validation.payload.name,
    email: validation.payload.email,
    message: validation.payload.message,
    projectIdea: validation.payload.projectIdea,
    projectType: validation.payload.projectType,
    submissionType: validation.payload.submissionType,
    forwardedAt: new Date().toISOString(),
  };

  const timeout = new AbortController();
  const timeoutId = setTimeout(() => timeout.abort(), WEBHOOK_TIMEOUT_MS);

  let makeResponse;

  try {
    makeResponse = await fetch(webhookUrl, {
      method: "POST",
      signal: timeout.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Portfolio-Source": "vercel-api",
        ...(process.env.MAKE_WEBHOOK_SECRET
          ? { "X-Portfolio-Secret": process.env.MAKE_WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify(forwardedPayload),
    });
  } catch {
    clearTimeout(timeoutId);
    return response.status(502).json({ error: "Automation handoff failed" });
  }

  clearTimeout(timeoutId);

  if (!makeResponse.ok) {
    return response.status(502).json({ error: "Automation handoff failed" });
  }

  return response.status(202).json({ ok: true });
}
