import assert from "node:assert/strict";
import test from "node:test";

import {
  initializeBrowserSentry,
  resolveSentryEnvironment,
} from "../src/monitoring/sentry-browser.js";
import {
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
} from "../monitoring/sanitize.js";

test("accepts only Preview and Production deployment environments", () => {
  assert.equal(resolveSentryEnvironment("preview"), "preview");
  assert.equal(resolveSentryEnvironment("PRODUCTION"), "production");
  assert.equal(resolveSentryEnvironment("development"), "");
  assert.equal(resolveSentryEnvironment("local"), "");
  assert.equal(resolveSentryEnvironment(""), "");
});

test("stays disabled without a DSN or allowed deployment environment", () => {
  const calls = [];
  const sentry = { init(options) { calls.push(options); } };

  assert.equal(
    initializeBrowserSentry({
      dsn: "",
      environment: "production",
      release: "commit-a",
      sentry,
    }),
    false,
  );
  assert.equal(
    initializeBrowserSentry({
      dsn: "https://public@example.invalid/1",
      environment: "development",
      release: "commit-a",
      sentry,
    }),
    false,
  );
  assert.deepEqual(calls, []);
});

test("initializes errors-only monitoring once with privacy-safe options", () => {
  const calls = [];
  const sentry = { init(options) { calls.push(options); } };
  const configuration = {
    dsn: "https://public@example.invalid/1",
    environment: "preview",
    release: "commit-a",
    sentry,
  };

  assert.equal(initializeBrowserSentry(configuration), true);
  assert.equal(initializeBrowserSentry(configuration), false);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    dsn: configuration.dsn,
    environment: "preview",
    release: "commit-a",
    sampleRate: 1,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    maxBreadcrumbs: 30,
    maxValueLength: 500,
    beforeSend: sanitizeSentryEvent,
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
  });
  assert.equal("integrations" in calls[0], false);
  assert.equal("replaysSessionSampleRate" in calls[0], false);
  assert.equal("replaysOnErrorSampleRate" in calls[0], false);
  assert.equal("enableLogs" in calls[0], false);
  assert.equal("profilesSampleRate" in calls[0], false);
});

test("fails open when Sentry initialization throws", () => {
  const sentry = { init() { throw new Error("transport setup failed"); } };
  assert.equal(
    initializeBrowserSentry({
      dsn: "https://public@example.invalid/1",
      environment: "production",
      release: "commit-b",
      sentry,
    }),
    false,
  );
});
