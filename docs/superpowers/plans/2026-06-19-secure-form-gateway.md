# Secure Form Gateway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct Web3Forms and unauthenticated Make submissions with one hCaptcha-verified, Upstash-limited server endpoint.

**Architecture:** Extract validation, hCaptcha, and rate limiting into focused server modules. Build the handler from injected services for deterministic tests, while production defaults use hCaptcha, Upstash, and the authenticated Make webhook.

**Tech Stack:** Node/Vercel Functions, React 18, hCaptcha, `@upstash/redis`, `@upstash/ratelimit`, Node test runner.

---

### Task 1: Install server security dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Run `npm install @upstash/redis @upstash/ratelimit`.
- [ ] Run `npm audit --json` and require zero known vulnerabilities.

### Task 2: Extract strict payload validation

**Files:**
- Create: `api/security/validation.js`
- Create: `tests/automation-lead-validation.test.mjs`

- [ ] Write failing tests for contact, AI, unexpected fields, control characters, honeypot, missing CAPTCHA, and the 12 KB limit.
- [ ] Run `node --test tests/automation-lead-validation.test.mjs` and verify imports fail.
- [ ] Implement exports:

```js
export const MAX_BODY_BYTES = 12_000;
export function getBodyByteLength(body) {}
export function parsePayload(body) {}
export function validatePayload(payload) {}
```

`validatePayload` returns `{ ok, status, payload, honeypot }`, normalizes email to lowercase, and includes `captchaToken` only in the internal validated result.
- [ ] Re-run the focused test and require all cases to pass.

### Task 3: Add server-side hCaptcha verification

**Files:**
- Create: `api/security/hcaptcha.js`
- Create: `tests/hcaptcha.test.mjs`

- [ ] Write failing tests using an injected `fetchImpl` for success, rejection, missing configuration, malformed response, and timeout.
- [ ] Run `node --test tests/hcaptcha.test.mjs` and verify RED.
- [ ] Implement:

```js
export async function verifyHCaptcha({
  token,
  remoteIp,
  secret = process.env.HCAPTCHA_SECRET_KEY,
  siteKey = process.env.VITE_HCAPTCHA_SITE_KEY,
  fetchImpl = fetch,
  timeoutMs = 5_000,
}) {}
```

Use `URLSearchParams`, `application/x-www-form-urlencoded`, `AbortController`, and return only `{ success, reason }`.
- [ ] Re-run the focused test and require GREEN.

### Task 4: Replace memory throttling with Upstash

**Files:**
- Create: `api/security/rate-limit.js`
- Create: `tests/rate-limit.test.mjs`

- [ ] Write failing tests for IP/email identifiers, blocked responses, timeout fail-closed behavior, and missing configuration.
- [ ] Run `node --test tests/rate-limit.test.mjs` and verify RED.
- [ ] Implement production limiters with `Redis.fromEnv()` and:

```js
Ratelimit.slidingWindow(5, "10 m")
Ratelimit.slidingWindow(3, "10 m")
```

Use prefixes `portfolio:lead:ip` and `portfolio:lead:email`. Treat `reason === "timeout"` as unavailable.
- [ ] Re-run the focused test and require GREEN.

### Task 5: Refactor the API orchestration

**Files:**
- Modify: `api/automation-lead.js`
- Create: `tests/automation-lead-api.test.mjs`

- [ ] Write failing handler tests for `405`, `403`, `415`, `413`, `400`, neutral honeypot `202`, CAPTCHA `403`, limiter `429`, configuration `503`, provider `502`, and accepted `202`.
- [ ] Assert the Make request uses `x-make-apikey`, excludes CAPTCHA/secrets, and contains only normalized lead fields.
- [ ] Run `node --test tests/automation-lead-api.test.mjs` and verify RED.
- [ ] Export:

```js
export function createAutomationLeadHandler({
  verifyCaptcha,
  applyRateLimits,
  fetchImpl = fetch,
  env = process.env,
} = {}) {}

export default createAutomationLeadHandler();
```

Invoke IP limit, hCaptcha, email limit, and Make in the approved order. Make credentials are mandatory.
- [ ] Re-run the focused API tests and require GREEN.

### Task 6: Route both React forms through the gateway

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/AutomationModal.jsx`
- Modify: `tests/security-hardening.test.mjs`

- [ ] Add failing source contracts proving no Web3Forms URL/access key remains, both payloads contain `captchaToken`, and both render hCaptcha.
- [ ] Run `npm test` and verify RED.
- [ ] Remove Web3Forms fetch/form-data handling from Contact.
- [ ] Add hCaptcha state/ref/callbacks to AI Proposal using `VITE_HCAPTCHA_SITE_KEY`.
- [ ] Send JSON to `/api/automation-lead`, reset tokens after every terminal response, and map `403`, `429`, `502`, and `503` to safe messages.
- [ ] Re-run `npm test` and require GREEN.

### Task 7: Align configuration and documentation

**Files:**
- Modify: `.env.example`
- Modify: `SECURITY_ENV_SETUP.md`
- Modify: `vercel.json` only if API duration/configuration is required

- [ ] Remove `VITE_WEB3FORMS_ACCESS_KEY`.
- [ ] Document `HCAPTCHA_SECRET_KEY`, Upstash REST variables, mandatory Make variables, and the verified data flow without real values.
- [ ] Run `npm test`, `npm run build`, `npm audit --json`, and `git diff --check`.

