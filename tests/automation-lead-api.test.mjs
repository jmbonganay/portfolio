import test from "node:test";
import assert from "node:assert/strict";
import { createAutomationLeadHandler } from "../api/automation-lead.js";

const validPayload = {
  name: "Jane Client",
  email: "jane@example.com",
  message: "I need a conversion-focused landing page for a new campaign.",
  projectIdea: "I need a conversion-focused landing page for a new campaign.",
  projectType: "Landing page",
  submissionType: "contact_form",
  captchaToken: "captcha-token",
};

function createRequest(overrides = {}) {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "portfolio.test",
      origin: "https://portfolio.test",
      "user-agent": "Test Agent",
    },
    body: validPayload,
    socket: { remoteAddress: "203.0.113.10" },
    ...overrides,
  };
}

function createResponse() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return {
        json: (body) => {
          this.body = body;
          return this;
        },
      };
    },
  };
}

function createHandler(overrides = {}) {
  return createAutomationLeadHandler({
    env: {
      MAKE_WEBHOOK_SECRET: "make-secret",
      MAKE_WEBHOOK_URL: "https://hook.us2.make.com/test-hook",
    },
    fetchImpl: async () => ({ ok: true }),
    rateLimits: {
      checkEmail: async () => ({ success: true }),
      checkIp: async () => ({ success: true }),
    },
    verifyCaptcha: async () => ({ success: true }),
    ...overrides,
  });
}

async function run(handler, request = createRequest()) {
  const response = createResponse();
  await handler(request, response);
  return response;
}

test("rejects unsupported HTTP, origin, media type, and payloads", async () => {
  assert.equal((await run(createHandler(), createRequest({ method: "GET" }))).statusCode, 405);
  assert.equal(
    (await run(createHandler(), createRequest({ headers: { ...createRequest().headers, origin: "https://evil.test" } }))).statusCode,
    403,
  );
  assert.equal(
    (await run(createHandler(), createRequest({ headers: { ...createRequest().headers, "content-type": "text/plain" } }))).statusCode,
    415,
  );
  assert.equal((await run(createHandler(), createRequest({ body: {} }))).statusCode, 400);
  assert.equal(
    (await run(createHandler(), createRequest({ headers: { ...createRequest().headers, "content-length": "12001" } }))).statusCode,
    413,
  );
});

test("returns neutral success for honeypot submissions", async () => {
  const response = await run(createHandler(), createRequest({ body: { botcheck: "filled" } }));

  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.body, { ok: true });
});

test("maps hCaptcha and Upstash failures safely", async () => {
  assert.equal(
    (await run(createHandler({ verifyCaptcha: async () => ({ success: false, reason: "challenge" }) }))).statusCode,
    403,
  );
  assert.equal(
    (await run(createHandler({ verifyCaptcha: async () => ({ success: false, reason: "provider" }) }))).statusCode,
    502,
  );
  assert.equal(
    (await run(createHandler({ rateLimits: { checkIp: async () => ({ success: false, unavailable: true }) } }))).statusCode,
    503,
  );
  const limited = await run(createHandler({
    rateLimits: {
      checkIp: async () => ({ success: false, limited: true, retryAfterSeconds: 45 }),
    },
  }));
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers["Retry-After"], "45");
});

test("requires Make configuration and maps provider rejection", async () => {
  assert.equal((await run(createHandler({ env: {} }))).statusCode, 503);
  assert.equal(
    (await run(createHandler({ fetchImpl: async () => ({ ok: false }) }))).statusCode,
    502,
  );
});

test("forwards only normalized lead fields with Make API-key authentication", async () => {
  let makeRequest;
  const response = await run(createHandler({
    fetchImpl: async (url, options) => {
      makeRequest = { url, options };
      return { ok: true };
    },
  }));
  const forwarded = JSON.parse(makeRequest.options.body);

  assert.equal(response.statusCode, 202);
  assert.equal(makeRequest.options.headers["x-make-apikey"], "make-secret");
  assert.equal(forwarded.email, "jane@example.com");
  assert.equal(forwarded.captchaToken, undefined);
  assert.equal(forwarded.makeWebhookSecret, undefined);
  assert.deepEqual(Object.keys(forwarded).sort(), [
    "email",
    "forwardedAt",
    "message",
    "name",
    "projectIdea",
    "projectType",
    "submissionType",
  ]);
});

test("does not report expected request, challenge, or rate-limit outcomes", async () => {
  const reports = [];
  const reportError = async (context) => reports.push(context);

  await run(createHandler({ reportError }), createRequest({ method: "GET" }));
  await run(createHandler({ reportError }), createRequest({ body: {} }));
  await run(
    createHandler({
      reportError,
      verifyCaptcha: async () => ({ success: false, reason: "challenge" }),
    }),
  );
  await run(
    createHandler({
      reportError,
      rateLimits: {
        checkIp: async () => ({
          success: false,
          limited: true,
          retryAfterSeconds: 30,
        }),
      },
    }),
  );

  assert.deepEqual(reports, []);
});

test("reports operational failures using fixed metadata only", async () => {
  const cases = [
    {
      expectedStatus: 503,
      overrides: {
        rateLimits: {
          checkIp: async () => ({ success: false, unavailable: true }),
        },
      },
      stage: "upstash",
    },
    {
      expectedStatus: 502,
      overrides: {
        verifyCaptcha: async () => ({ success: false, reason: "provider" }),
      },
      stage: "hcaptcha",
    },
    {
      expectedStatus: 503,
      overrides: {
        verifyCaptcha: async () => ({ success: false, reason: "configuration" }),
      },
      stage: "hcaptcha",
    },
    {
      expectedStatus: 503,
      overrides: { env: {} },
      stage: "make_configuration",
    },
    {
      expectedStatus: 502,
      overrides: { fetchImpl: async () => ({ ok: false }) },
      stage: "make_response",
    },
    {
      expectedStatus: 502,
      overrides: {
        fetchImpl: async () => {
          throw new Error("network failed for private webhook URL");
        },
      },
      stage: "make_network",
    },
  ];

  for (const failureCase of cases) {
    const reports = [];
    const response = await run(
      createHandler({
        ...failureCase.overrides,
        reportError: async (context) => reports.push(context),
      }),
    );

    assert.equal(response.statusCode, failureCase.expectedStatus);
    assert.equal(reports.length, 1);
    assert.deepEqual(Object.keys(reports[0]).sort(), [
      "error",
      "stage",
      "submissionType",
    ]);
    assert.equal(reports[0].stage, failureCase.stage);
    assert.equal(reports[0].submissionType, "contact_form");
    assert.ok(reports[0].error instanceof Error);
    assert.doesNotMatch(
      JSON.stringify(reports[0]),
      /jane@|Jane Client|captcha-token|make-secret|test-hook|conversion-focused/i,
    );
  }
});

test("reports unexpected handler exceptions and returns a safe response", async () => {
  const reports = [];
  const response = await run(
    createHandler({
      rateLimits: {
        checkIp: async () => {
          throw new Error("unexpected private provider failure");
        },
      },
      reportError: async (context) => reports.push(context),
    }),
  );

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: "Unable to process request" });
  assert.equal(reports.length, 1);
  assert.equal(reports[0].stage, "handler");
  assert.equal(reports[0].submissionType, "contact_form");
  assert.equal(reports[0].error.message, "Unexpected automation lead failure");
});
