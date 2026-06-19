# Privacy-First Sentry Error Monitoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-filtered Sentry error monitoring to the React application and Vercel form API, with safe Preview/Production labels and private source-map uploads.

**Architecture:** Pure sanitizer and initialization adapters keep Sentry behavior testable without network calls. The browser entry wraps React in a safe error boundary, the API injects a best-effort server reporter, and the Vite plugin uploads hidden source maps only when all server-only build credentials exist.

**Tech Stack:** React 18, Vite 8, `@sentry/react`, `@sentry/node`, `@sentry/vite-plugin`, Vercel Functions, Node test runner.

---

### Task 1: Install the server and build SDK packages

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Run `npm install @sentry/node` and require a compatible major with `@sentry/react`.
- [ ] Run `npm install --save-dev @sentry/vite-plugin`.
- [ ] Run `npm audit --json` and require zero high or critical vulnerabilities.

### Task 2: Build shared event and breadcrumb sanitizers

**Files:**
- Create: `monitoring/sanitize.js`
- Create: `tests/sentry-sanitize.test.mjs`

- [ ] Write failing tests for `stripUrlDetails`, `sanitizeSentryEvent`, and `sanitizeSentryBreadcrumb` using email addresses, query strings, fragments, authorization headers, cookies, form payload keys, captcha tokens, webhook URLs, nested extras, navigation breadcrumbs, HTTP breadcrumbs, and console breadcrumbs. Require console breadcrumbs to return `null` and stack frames to remain available.
- [ ] Run `node --test tests/sentry-sanitize.test.mjs`; expect failure because the module does not exist.
- [ ] Implement these exact public contracts:

```js
export function stripUrlDetails(value) {}
export function sanitizeSentryEvent(event) {}
export function sanitizeSentryBreadcrumb(breadcrumb) {}
```

`sanitizeSentryEvent` removes `user`, request headers/cookies/data, and sensitive extra/context keys; redacts email-shaped strings; strips URL queries/fragments; retains exception type, sanitized exception value, and stack frames; and sanitizes retained breadcrumbs. `sanitizeSentryBreadcrumb` drops `console` breadcrumbs and sanitizes navigation/HTTP URLs without preserving request bodies.

- [ ] Re-run `node --test tests/sentry-sanitize.test.mjs`; require all tests to pass.

### Task 3: Add browser initialization and a safe React fallback

**Files:**
- Create: `src/monitoring/sentry-browser.js`
- Create: `src/components/AppErrorFallback.jsx`
- Modify: `src/main.jsx`
- Create: `tests/sentry-browser.test.mjs`
- Modify: `tests/security-hardening.test.mjs`

- [ ] Write failing tests requiring `resolveSentryEnvironment` to return only `preview` or `production`, and `initializeBrowserSentry` to initialize once only when an allowed environment and DSN exist. Assert `sendDefaultPii: false`, `tracesSampleRate: 0`, `sampleRate: 1`, `maxBreadcrumbs: 30`, and the shared sanitizer hooks. Assert no replay, tracing, feedback, profiling, logs, or console-capture integration is configured.
- [ ] Run `node --test tests/sentry-browser.test.mjs tests/security-hardening.test.mjs`; expect missing-module/source-contract failures.
- [ ] Implement:

```js
export function resolveSentryEnvironment(value) {}
export function initializeBrowserSentry({ dsn, environment, release, sentry }) {}
```

Return `false` rather than throwing when disabled, misconfigured, or already initialized.

- [ ] Create a labelled alert fallback with a generic message and `Reload page` button calling `window.location.reload()`. Never render the exception, component stack, or event ID.
- [ ] Initialize before rendering with `VITE_SENTRY_DSN`, build-injected `VITE_SENTRY_ENVIRONMENT`, and `VITE_SENTRY_RELEASE`, then wrap `<App />` in `<Sentry.ErrorBoundary fallback={<AppErrorFallback />}>` inside `React.StrictMode`.
- [ ] Re-run the focused tests and require GREEN.

### Task 4: Add a privacy-safe server reporter

**Files:**
- Create: `api/monitoring/sentry.js`
- Create: `tests/sentry-server.test.mjs`

- [ ] Write failing tests with a fake SDK. Require the reporter to remain disabled locally or without `SENTRY_DSN`, initialize once in Preview/Production, use `sendDefaultPii: false` and `sanitizeSentryEvent`, capture fixed safe tags only, call `flush(300)`, and swallow capture/flush errors.
- [ ] Run `node --test tests/sentry-server.test.mjs`; expect a missing-module failure.
- [ ] Implement:

```js
export function createSentryReporter({ env, sentry }) {}
export const reportServerError = createSentryReporter({
  env: process.env,
  sentry: Sentry,
});
```

The returned reporter accepts only `{ error, stage, submissionType }` and constructs the fixed tags `service`, `stage`, and `submission_type`. It must never accept a request or payload.

- [ ] Re-run `node --test tests/sentry-server.test.mjs`; require all tests to pass.

### Task 5: Instrument the form API without changing responses

**Files:**
- Modify: `api/automation-lead.js`
- Modify: `tests/automation-lead-api.test.mjs`

- [ ] Add failing tests that inject a `reportError` spy. Require no report for method, origin, media type, validation, honeypot, captcha challenge, or rate-limit rejection. Require one safe report for Upstash unavailability, hCaptcha provider/configuration failure, missing Make configuration, Make rejection/network error, and unexpected thrown exceptions. Reporter arguments must contain no request, headers, email, name, message, captcha token, webhook URL, or environment object.
- [ ] Run `node --test tests/automation-lead-api.test.mjs`; expect reporter assertions to fail.
- [ ] Import `reportServerError`, add `reportError = reportServerError` to the handler factory, and use a helper that swallows reporter failures. Use only the fixed stages `upstash`, `hcaptcha`, `make_configuration`, `make_response`, `make_network`, and `handler`. Preserve existing HTTP statuses and public messages.
- [ ] Run `node --test tests/automation-lead-api.test.mjs tests/security-hardening.test.mjs`; require all tests to pass.

### Task 6: Configure private source-map uploads

**Files:**
- Modify: `vite.config.js`
- Create: `tests/sentry-vite-config.test.mjs`

- [ ] Write failing source contracts requiring an import of `sentryVitePlugin`, conditional activation only when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` all exist, safe injection of only `VITE_SENTRY_ENVIRONMENT` and `VITE_SENTRY_RELEASE`, hidden source maps when configured, `./dist/**/*.map` deletion after upload, and no auth token in `define`.
- [ ] Run `node --test tests/sentry-vite-config.test.mjs`; expect failure.
- [ ] Derive the public environment from `VERCEL_ENV` and release from `VERCEL_GIT_COMMIT_SHA`. Add this plugin only after React and the local API plugin:

```js
sentryVitePlugin({
  authToken: env.SENTRY_AUTH_TOKEN,
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  telemetry: false,
  sourcemaps: {
    filesToDeleteAfterUpload: ["./dist/**/*.map"],
  },
})
```

Set `build.sourcemap` to `"hidden"` only when upload credentials are complete; otherwise keep `false` so ordinary local builds emit no maps.

- [ ] Run `node --test tests/sentry-vite-config.test.mjs` and `npm run build`; require tests and credential-free build to pass.

### Task 7: Update environment and privacy documentation

**Files:**
- Modify: `.env.example`
- Modify: `SECURITY_ENV_SETUP.md`
- Modify: `src/components/PrivacyConsent.jsx`
- Modify: `tests/security-hardening.test.mjs`

- [ ] Add failing contracts distinguishing browser-visible `VITE_SENTRY_DSN` from server-only `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`. Require the privacy notice to disclose essential Sentry error monitoring and state that default PII, replay, and form contents are disabled.
- [ ] Run `node --test tests/security-hardening.test.mjs`; expect failure.
- [ ] Document Vercel Preview/Production variable scopes, minimum CI/source-map token permissions, why the token must never use `VITE_`, using the same DSN value for browser and server variables, redeployment, and Source Maps/Issues verification. Never place real values in tracked files.
- [ ] Add one concise privacy-notice sentence explaining Sentry receives filtered technical errors in Preview/Production while replay, default PII, and submitted form contents are disabled.
- [ ] Re-run the security test and require GREEN.

### Task 8: Complete verification

**Files:**
- Verify all modified files

- [ ] Run `npm test`; require zero failures.
- [ ] Run `npm run build` without upload credentials; require success and no public `.map` files in `dist/`.
- [ ] Run `npm audit --json`; require zero high/critical vulnerabilities.
- [ ] Run `git diff --check`; require no whitespace errors.
- [ ] Scan tracked/generated files for `sntrys_`, real DSN values, and accidental `SENTRY_AUTH_TOKEN` assignments while excluding `.env.local`, `.git`, `node_modules`, and `dist`; require no real credentials.
- [ ] After the user configures Vercel variables, deploy Preview and trigger one temporary browser exception and one temporary API exception. Remove both triggers, then confirm the issues use `preview`, show readable source-mapped frames, and contain no email, name, message, token, IP, request body, or webhook URL.
