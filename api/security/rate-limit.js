import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const unavailableResult = { success: false, unavailable: true };

function mapLimitResult(result) {
  if (result?.reason === "timeout") {
    return unavailableResult;
  }

  if (result?.success) {
    return { success: true };
  }

  const reset = Number(result?.reset) || Date.now() + 1_000;
  return {
    success: false,
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1_000)),
  };
}

export function createRateLimitService({ emailLimiter, ipLimiter }) {
  async function run(limiter, identifier, request) {
    try {
      return mapLimitResult(await limiter.limit(identifier, request));
    } catch {
      return unavailableResult;
    }
  }

  return {
    checkEmail({ email, submissionType }) {
      return run(emailLimiter, `${submissionType}:${email}`);
    },
    checkIp({ ip, submissionType, userAgent }) {
      return run(ipLimiter, `${submissionType}:${ip}`, { ip, userAgent });
    },
  };
}

export function createUpstashRateLimitService(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return {
      checkEmail: async () => unavailableResult,
      checkIp: async () => unavailableResult,
    };
  }

  const redis = new Redis({ url, token });
  return createRateLimitService({
    emailLimiter: new Ratelimit({
      redis,
      analytics: true,
      limiter: Ratelimit.slidingWindow(3, "10 m"),
      prefix: "portfolio:lead:email",
      timeout: 1_000,
    }),
    ipLimiter: new Ratelimit({
      redis,
      analytics: true,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "portfolio:lead:ip",
      timeout: 1_000,
    }),
  });
}
