import test from "node:test";
import assert from "node:assert/strict";
import {
  createRateLimitService,
  createUpstashRateLimitService,
} from "../api/security/rate-limit.js";

test("uses submission-scoped IP and email identifiers", async () => {
  const calls = [];
  const limiter = {
    limit: async (identifier, request) => {
      calls.push({ identifier, request });
      return { success: true, remaining: 2, reset: Date.now() + 60_000 };
    },
  };
  const service = createRateLimitService({ emailLimiter: limiter, ipLimiter: limiter });

  await service.checkIp({ ip: "203.0.113.10", submissionType: "contact_form", userAgent: "Test" });
  await service.checkEmail({ email: "jane@example.com", submissionType: "ai_scoper" });

  assert.equal(calls[0].identifier, "contact_form:203.0.113.10");
  assert.equal(calls[0].request.ip, "203.0.113.10");
  assert.equal(calls[1].identifier, "ai_scoper:jane@example.com");
});

test("maps blocked limits to retry metadata", async () => {
  const service = createRateLimitService({
    emailLimiter: { limit: async () => ({ success: false, reset: Date.now() + 30_000 }) },
    ipLimiter: { limit: async () => ({ success: false, reset: Date.now() + 30_000 }) },
  });

  const result = await service.checkIp({ ip: "203.0.113.10", submissionType: "contact_form" });

  assert.equal(result.success, false);
  assert.equal(result.limited, true);
  assert.ok(result.retryAfterSeconds >= 1);
});

test("fails closed when Upstash times out or throws", async () => {
  const timeoutService = createRateLimitService({
    emailLimiter: { limit: async () => ({ success: true, reason: "timeout" }) },
    ipLimiter: { limit: async () => ({ success: true, reason: "timeout" }) },
  });
  const errorService = createRateLimitService({
    emailLimiter: { limit: async () => { throw new Error("offline"); } },
    ipLimiter: { limit: async () => { throw new Error("offline"); } },
  });

  assert.deepEqual(
    await timeoutService.checkEmail({ email: "jane@example.com", submissionType: "contact_form" }),
    { success: false, unavailable: true },
  );
  assert.deepEqual(
    await errorService.checkIp({ ip: "203.0.113.10", submissionType: "contact_form" }),
    { success: false, unavailable: true },
  );
});

test("reports unavailable when Upstash configuration is missing", async () => {
  const service = createUpstashRateLimitService({});

  assert.deepEqual(
    await service.checkIp({ ip: "203.0.113.10", submissionType: "contact_form" }),
    { success: false, unavailable: true },
  );
});
