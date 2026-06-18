import test from "node:test";
import assert from "node:assert/strict";
import { verifyHCaptcha } from "../api/security/hcaptcha.js";

const configuration = {
  remoteIp: "203.0.113.10",
  secret: "test-secret",
  siteKey: "test-site-key",
  token: "test-token",
};

test("verifies hCaptcha with a form-encoded POST", async () => {
  let request;
  const result = await verifyHCaptcha({
    ...configuration,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ success: true, hostname: "example.com" }) };
    },
  });

  assert.equal(result.success, true);
  assert.equal(request.url, "https://api.hcaptcha.com/siteverify");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.equal(request.options.body.get("secret"), "test-secret");
  assert.equal(request.options.body.get("response"), "test-token");
  assert.equal(request.options.body.get("remoteip"), "203.0.113.10");
  assert.equal(request.options.body.get("sitekey"), "test-site-key");
});

test("fails closed when hCaptcha configuration is missing", async () => {
  const result = await verifyHCaptcha({
    token: "test-token",
    secret: "",
    siteKey: "",
    fetchImpl: async () => assert.fail("fetch should not run"),
  });

  assert.deepEqual(result, { success: false, reason: "configuration" });
});

test("maps rejected challenges without exposing provider details", async () => {
  const result = await verifyHCaptcha({
    ...configuration,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
    }),
  });

  assert.deepEqual(result, { success: false, reason: "challenge" });
});

test("fails closed on provider errors and timeouts", async () => {
  const provider = await verifyHCaptcha({
    ...configuration,
    fetchImpl: async () => ({ ok: false, json: async () => ({}) }),
  });
  const timeout = await verifyHCaptcha({
    ...configuration,
    fetchImpl: async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    },
  });

  assert.deepEqual(provider, { success: false, reason: "provider" });
  assert.deepEqual(timeout, { success: false, reason: "provider" });
});
