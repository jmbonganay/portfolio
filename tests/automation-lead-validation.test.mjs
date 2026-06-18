import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_BODY_BYTES,
  getBodyByteLength,
  parsePayload,
  validatePayload,
} from "../api/security/validation.js";

const contactPayload = {
  name: "  Jane Client  ",
  email: "  JANE@EXAMPLE.COM ",
  message: "I need a conversion-focused landing page for a new campaign.",
  projectIdea: "I need a conversion-focused landing page for a new campaign.",
  projectType: "Landing page",
  submissionType: "contact_form",
  captchaToken: "captcha-token",
};

test("validates and normalizes a contact submission", () => {
  const result = validatePayload(contactPayload);

  assert.equal(result.ok, true);
  assert.equal(result.payload.name, "Jane Client");
  assert.equal(result.payload.email, "jane@example.com");
  assert.equal(result.payload.captchaToken, "captcha-token");
});

test("validates an AI scoper submission", () => {
  const result = validatePayload({
    name: "Jane Client",
    email: "jane@example.com",
    projectIdea: "Build a secure scheduling product for distributed teams.",
    submissionType: "ai_scoper",
    captchaToken: "captcha-token",
  });

  assert.equal(result.ok, true);
  assert.equal(result.payload.message, "Build a secure scheduling product for distributed teams.");
  assert.equal(result.payload.projectType, "Not selected");
});

test("rejects unexpected fields and control characters", () => {
  assert.equal(validatePayload({ ...contactPayload, admin: true }).status, 400);
  assert.equal(validatePayload({ ...contactPayload, name: "Jane\nBcc: victim@example.com" }).status, 400);
});

test("requires a captcha token and submission-specific content", () => {
  assert.equal(validatePayload({ ...contactPayload, captchaToken: "" }).status, 400);
  assert.equal(validatePayload({ ...contactPayload, message: "short", projectIdea: "short" }).status, 400);
  assert.equal(
    validatePayload({ ...contactPayload, submissionType: "ai_scoper", projectIdea: "" }).status,
    400,
  );
});

test("returns a neutral honeypot result", () => {
  const result = validatePayload({ ...contactPayload, botcheck: "filled" });

  assert.equal(result.ok, false);
  assert.equal(result.honeypot, true);
  assert.equal(result.status, 202);
});

test("parses JSON safely and measures request bytes", () => {
  assert.deepEqual(parsePayload('{"name":"Jane"}'), { name: "Jane" });
  assert.equal(parsePayload("not-json"), null);
  assert.equal(getBodyByteLength("hello"), 5);
  assert.equal(getBodyByteLength({ value: "hello" }), 17);
  assert.equal(MAX_BODY_BYTES, 12_000);
});
