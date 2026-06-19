import assert from "node:assert/strict";
import test from "node:test";

import { createSentryReporter } from "../api/monitoring/sentry.js";
import { sanitizeSentryEvent } from "../monitoring/sanitize.js";

function createFakeSentry({ captureError, flushError } = {}) {
  const calls = { capture: [], flush: [], init: [] };
  return {
    calls,
    init(options) {
      calls.init.push(options);
    },
    captureException(error, context) {
      if (captureError) throw captureError;
      calls.capture.push({ context, error });
    },
    async flush(timeout) {
      if (flushError) throw flushError;
      calls.flush.push(timeout);
      return true;
    },
  };
}

test("stays disabled locally or without the server DSN", async () => {
  const sentry = createFakeSentry();
  const localReporter = createSentryReporter({
    env: { SENTRY_DSN: "https://public@example.invalid/1" },
    sentry,
  });
  const missingDsnReporter = createSentryReporter({
    env: { VERCEL_ENV: "preview" },
    sentry,
  });

  assert.equal(
    await localReporter({ error: new Error("test"), stage: "handler" }),
    false,
  );
  assert.equal(
    await missingDsnReporter({ error: new Error("test"), stage: "handler" }),
    false,
  );
  assert.deepEqual(sentry.calls.init, []);
});

test("initializes error-only server monitoring and captures fixed safe tags", async () => {
  const sentry = createFakeSentry();
  const reporter = createSentryReporter({
    env: {
      SENTRY_DSN: "https://public@example.invalid/1",
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "commit-a",
    },
    sentry,
  });
  const error = new Error("Make provider unavailable");

  assert.equal(
    await reporter({
      error,
      stage: "make_network",
      submissionType: "contact_form",
      request: { body: { email: "private@example.com" } },
    }),
    true,
  );
  assert.equal(sentry.calls.init.length, 1);
  assert.deepEqual(sentry.calls.init[0], {
    dsn: "https://public@example.invalid/1",
    environment: "production",
    release: "commit-a",
    sampleRate: 1,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 30,
    maxValueLength: 500,
    beforeSend: sanitizeSentryEvent,
  });
  assert.deepEqual(sentry.calls.capture, [
    {
      error,
      context: {
        tags: {
          service: "automation-lead",
          stage: "make_network",
          submission_type: "contact_form",
        },
      },
    },
  ]);
  assert.deepEqual(sentry.calls.flush, [300]);
});

test("swallows capture and flush failures", async () => {
  const captureFailure = createFakeSentry({ captureError: new Error("capture") });
  const captureReporter = createSentryReporter({
    env: { SENTRY_DSN: "dsn", VERCEL_ENV: "preview" },
    sentry: captureFailure,
  });
  assert.equal(
    await captureReporter({ error: new Error("test"), stage: "handler" }),
    false,
  );

  const flushFailure = createFakeSentry({ flushError: new Error("flush") });
  const flushReporter = createSentryReporter({
    env: { SENTRY_DSN: "dsn", VERCEL_ENV: "preview" },
    sentry: flushFailure,
  });
  assert.equal(
    await flushReporter({ error: new Error("test"), stage: "handler" }),
    false,
  );
});
