import { verifyHCaptcha } from "./security/hcaptcha.js";
import { createUpstashRateLimitService } from "./security/rate-limit.js";
import { reportServerError } from "./monitoring/sentry.js";
import {
  MAX_BODY_BYTES,
  getBodyByteLength,
  parsePayload,
  validatePayload,
} from "./security/validation.js";

const MAKE_TIMEOUT_MS = 8_000;
const OPERATIONAL_ERRORS = {
  handler: "Unexpected automation lead failure",
  hcaptcha: "hCaptcha service unavailable",
  make_configuration: "Make webhook configuration unavailable",
  make_network: "Make webhook network failure",
  make_response: "Make webhook rejected request",
  upstash: "Rate limit service unavailable",
};

async function safelyReport(reportError, stage, submissionType) {
  try {
    await reportError({
      error: new Error(OPERATIONAL_ERRORS[stage]),
      stage,
      submissionType: submissionType || "unknown",
    });
  } catch {
    // Monitoring must never change the form response.
  }
}

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

async function processAutomationLead(
  { env, fetchImpl, rateLimits, reportError, verifyCaptcha },
  request,
  response,
  onSubmissionType,
) {
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
    const submissionType = validation.payload.submissionType;
    onSubmissionType(submissionType);

    const clientIp = getClientIp(request);
    const limiter = rateLimits || createUpstashRateLimitService(env);
    const ipLimit = await limiter.checkIp({
      ip: clientIp,
      submissionType: validation.payload.submissionType,
      userAgent: getHeader(request, "user-agent"),
    });

    if (ipLimit.unavailable) {
      await safelyReport(reportError, "upstash", submissionType);
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
        await safelyReport(reportError, "hcaptcha", submissionType);
        return response.status(503).json({ error: "Security service unavailable" });
      }
      await safelyReport(reportError, "hcaptcha", submissionType);
      return response.status(502).json({ error: "Security verification unavailable" });
    }

    const emailLimit = await limiter.checkEmail({
      email: validation.payload.email,
      submissionType: validation.payload.submissionType,
    });

    if (emailLimit.unavailable) {
      await safelyReport(reportError, "upstash", submissionType);
      return response.status(503).json({ error: "Security service unavailable" });
    }
    if (emailLimit.limited) {
      return sendLimitResponse(response, emailLimit);
    }

    const webhookUrl = env.MAKE_WEBHOOK_URL;
    const webhookSecret = env.MAKE_WEBHOOK_SECRET;
    if (!webhookSecret || !isAllowedWebhookUrl(webhookUrl)) {
      await safelyReport(reportError, "make_configuration", submissionType);
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
        await safelyReport(reportError, "make_response", submissionType);
        return response.status(502).json({ error: "Automation handoff failed" });
      }
    } catch {
      await safelyReport(reportError, "make_network", submissionType);
      return response.status(502).json({ error: "Automation handoff failed" });
    } finally {
      clearTimeout(timeoutId);
    }

    return response.status(202).json({ ok: true });
}

export function createAutomationLeadHandler({
  env = process.env,
  fetchImpl = fetch,
  rateLimits,
  reportError = reportServerError,
  verifyCaptcha = verifyHCaptcha,
} = {}) {
  const dependencies = {
    env,
    fetchImpl,
    rateLimits,
    reportError,
    verifyCaptcha,
  };

  return async function automationLeadHandler(request, response) {
    let submissionType = "unknown";

    try {
      return await processAutomationLead(
        dependencies,
        request,
        response,
        (value) => {
          submissionType = value;
        },
      );
    } catch {
      await safelyReport(reportError, "handler", submissionType);
      if (!response.headersSent && !response.writableEnded) {
        return response.status(500).json({ error: "Unable to process request" });
      }
      return undefined;
    }
  };
}

export default createAutomationLeadHandler();
