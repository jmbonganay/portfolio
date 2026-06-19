import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
  stripUrlDetails,
} from "../monitoring/sanitize.js";

test("strips query strings and fragments from absolute and relative URLs", () => {
  assert.equal(
    stripUrlDetails("https://portfolio.test/contact?email=person@example.com#form"),
    "https://portfolio.test/contact",
  );
  assert.equal(stripUrlDetails("/contact?token=secret#form"), "/contact");
  assert.equal(stripUrlDetails("plain text"), "plain text");
});

test("removes user and request data while retaining useful error frames", () => {
  const event = {
    message: "Submission failed for person@example.com",
    user: { email: "person@example.com", ip_address: "203.0.113.10" },
    request: {
      url: "https://portfolio.test/api/automation-lead?token=private",
      headers: { authorization: "Bearer private" },
      cookies: { session: "private" },
      data: { message: "private lead message" },
    },
    extra: {
      safeCounter: 2,
      captchaToken: "private-captcha",
      request: { body: "private request" },
      responseBody: "private response",
      nested: {
        email: "person@example.com",
        status: "provider unavailable",
      },
    },
    contexts: {
      runtime: { name: "browser", version: "1" },
      formPayload: { projectIdea: "private idea" },
    },
    exception: {
      values: [
        {
          type: "Error",
          value: "Failed for person@example.com",
          stacktrace: {
            frames: [
              {
                filename: "https://portfolio.test/assets/app.js?build=private",
                function: "submitLead",
                lineno: 42,
              },
            ],
          },
        },
      ],
    },
  };

  const sanitized = sanitizeSentryEvent(event);

  assert.equal(sanitized.user, undefined);
  assert.deepEqual(sanitized.request, {
    url: "https://portfolio.test/api/automation-lead",
  });
  assert.equal(sanitized.message, "Submission failed for [redacted-email]");
  assert.deepEqual(sanitized.extra, {
    safeCounter: 2,
    nested: { status: "provider unavailable" },
  });
  assert.deepEqual(sanitized.contexts, {
    runtime: { name: "browser", version: "1" },
  });
  assert.equal(
    sanitized.exception.values[0].value,
    "Failed for [redacted-email]",
  );
  assert.deepEqual(sanitized.exception.values[0].stacktrace.frames[0], {
    filename: "https://portfolio.test/assets/app.js",
    function: "submitLead",
    lineno: 42,
  });
  assert.equal(event.user.email, "person@example.com");
});

test("drops console breadcrumbs and sanitizes navigation and HTTP data", () => {
  assert.equal(
    sanitizeSentryBreadcrumb({
      category: "console",
      message: "Lead person@example.com failed",
    }),
    null,
  );

  assert.deepEqual(
    sanitizeSentryBreadcrumb({
      category: "navigation",
      data: {
        from: "/?email=person@example.com",
        to: "/contact?token=private#form",
      },
    }),
    {
      category: "navigation",
      data: { from: "/", to: "/contact" },
    },
  );

  assert.deepEqual(
    sanitizeSentryBreadcrumb({
      category: "fetch",
      data: {
        method: "POST",
        status_code: 502,
        url: "https://portfolio.test/api/automation-lead?token=private",
        request_body: "private payload",
        authorization: "Bearer private",
      },
    }),
    {
      category: "fetch",
      data: {
        method: "POST",
        status_code: 502,
        url: "https://portfolio.test/api/automation-lead",
      },
    },
  );
});
