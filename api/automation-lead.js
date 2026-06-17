const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const WEBHOOK_TIMEOUT_MS = 8_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SUBMISSION_TYPES = new Set(["ai_scoper", "contact_form"]);
const rateLimitStore = new Map();

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

function cleanText(value, maxLength = 1200) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function getClientIp(request) {
  const forwardedFor = getHeader(request, "x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return getHeader(request, "x-real-ip") || request.socket?.remoteAddress || "unknown";
}

function isRateLimited(clientIp) {
  const now = Date.now();
  const currentWindow = rateLimitStore.get(clientIp);

  if (!currentWindow || currentWindow.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  currentWindow.count += 1;
  return currentWindow.count > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedWebhookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "make.com" || url.hostname.endsWith(".make.com"));
  } catch {
    return false;
  }
}

function validatePayload(payload) {
  const cleanedPayload = {
    name: cleanText(payload.name, 160),
    email: cleanText(payload.email, 240).toLowerCase(),
    message: cleanText(payload.message ?? payload.projectIdea, 3000),
    projectIdea: cleanText(payload.projectIdea ?? payload.message, 3000),
    projectType: cleanText(payload.projectType || "Not selected", 160),
    submissionType: cleanText(payload.submissionType || "ai_scoper", 80),
    botcheck: cleanText(payload.botcheck, 20),
  };

  if (cleanedPayload.botcheck) {
    return { ok: false, status: 202, error: null };
  }

  if (!cleanedPayload.name || cleanedPayload.name.length > 160) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  if (!EMAIL_PATTERN.test(cleanedPayload.email)) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  if (cleanedPayload.projectIdea.length < 20) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  if (!ALLOWED_SUBMISSION_TYPES.has(cleanedPayload.submissionType)) {
    return { ok: false, status: 400, error: "Invalid request" };
  }

  return { ok: true, payload: cleanedPayload };
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

  if (isRateLimited(getClientIp(request))) {
    return response.status(429).json({ error: "Too many requests" });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return response.status(503).json({ error: "Automation endpoint is not configured" });
  }

  if (!isAllowedWebhookUrl(webhookUrl)) {
    return response.status(503).json({ error: "Automation endpoint is not configured" });
  }

  const payload = parsePayload(request.body);
  const validation = validatePayload(payload);

  if (!validation.ok) {
    if (validation.status === 202) {
      return response.status(202).json({ ok: true });
    }

    return response.status(validation.status).json({ error: validation.error });
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
