import { verifyHCaptcha } from "./security/hcaptcha.js";
import { createUpstashRateLimitService } from "./security/rate-limit.js";
import {
  MAX_BODY_BYTES,
  getBodyByteLength,
  parsePayload,
  validatePayload,
} from "./security/validation.js";

const MAKE_TIMEOUT_MS = 8_000;

function getHeader(request, name) {
  if (typeof request.headers?.get === "function") {
    return request.headers.get(name);
  }

  return request.headers?.[name] || request.headers?.[name.toLowerCase()] || "";
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
  return (
    forwardedFor.split(",")[0]?.trim() ||
    getHeader(request, "x-real-ip") ||
    request.socket?.remoteAddress ||
    "unknown"
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

function sendLimitResponse(response, result) {
  response.setHeader("Retry-After", String(result.retryAfterSeconds));
  return response.status(429).json({
    error: "Too many requests",
    retryAfter: result.retryAfterSeconds,
  });
}

export function createAutomationLeadHandler({
  env = process.env,
  fetchImpl = fetch,
  rateLimits,
  verifyCaptcha = verifyHCaptcha,
} = {}) {
  return async function automationLeadHandler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return response.status(405).json({ error: "Method not allowed" });
    }

    response.setHeader("Cache-Control", "no-store");

    if (!isSameOriginRequest(request)) {
      return response.status(403).json({ error: "Forbidden" });
    }

    const contentType = getHeader(request, "content-type");
    if (!contentType.includes("application/json")) {
      return response.status(415).json({ error: "Unsupported media type" });
    }

    const contentLength = Number.parseInt(getHeader(request, "content-length") || "0", 10);
    if (contentLength > MAX_BODY_BYTES || getBodyByteLength(request.body) > MAX_BODY_BYTES) {
      return response.status(413).json({ error: "Request too large" });
    }

    const validation = validatePayload(parsePayload(request.body));
    if (!validation.ok) {
      if (validation.honeypot) {
        return response.status(202).json({ ok: true });
      }
      return response.status(validation.status || 400).json({ error: "Invalid request" });
    }

    const clientIp = getClientIp(request);
    const limiter = rateLimits || createUpstashRateLimitService(env);
    const ipLimit = await limiter.checkIp({
      ip: clientIp,
      submissionType: validation.payload.submissionType,
      userAgent: getHeader(request, "user-agent"),
    });

    if (ipLimit.unavailable) {
      return response.status(503).json({ error: "Security service unavailable" });
    }
    if (ipLimit.limited) {
      return sendLimitResponse(response, ipLimit);
    }

    const captcha = await verifyCaptcha({
      remoteIp: clientIp,
      secret: env.HCAPTCHA_SECRET_KEY,
      siteKey: env.VITE_HCAPTCHA_SITE_KEY,
      token: validation.payload.captchaToken,
    });

    if (!captcha.success) {
      if (captcha.reason === "challenge") {
        return response.status(403).json({ error: "Security verification failed" });
      }
      if (captcha.reason === "configuration") {
        return response.status(503).json({ error: "Security service unavailable" });
      }
      return response.status(502).json({ error: "Security verification unavailable" });
    }

    const emailLimit = await limiter.checkEmail({
      email: validation.payload.email,
      submissionType: validation.payload.submissionType,
    });

    if (emailLimit.unavailable) {
      return response.status(503).json({ error: "Security service unavailable" });
    }
    if (emailLimit.limited) {
      return sendLimitResponse(response, emailLimit);
    }

    const webhookUrl = env.MAKE_WEBHOOK_URL;
    const webhookSecret = env.MAKE_WEBHOOK_SECRET;
    if (!webhookSecret || !isAllowedWebhookUrl(webhookUrl)) {
      return response.status(503).json({ error: "Automation endpoint is not configured" });
    }

    const forwardedPayload = {
      email: validation.payload.email,
      forwardedAt: new Date().toISOString(),
      message: validation.payload.message,
      name: validation.payload.name,
      projectIdea: validation.payload.projectIdea,
      projectType: validation.payload.projectType,
      submissionType: validation.payload.submissionType,
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAKE_TIMEOUT_MS);

    try {
      const makeResponse = await fetchImpl(webhookUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": webhookSecret,
        },
        body: JSON.stringify(forwardedPayload),
      });

      if (!makeResponse.ok) {
        return response.status(502).json({ error: "Automation handoff failed" });
      }
    } catch {
      return response.status(502).json({ error: "Automation handoff failed" });
    } finally {
      clearTimeout(timeoutId);
    }

    return response.status(202).json({ ok: true });
  };
}

export default createAutomationLeadHandler();
