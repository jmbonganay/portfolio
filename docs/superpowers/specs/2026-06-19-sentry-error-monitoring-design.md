# Privacy-First Sentry Error Monitoring Design

## Goal

Integrate Sentry error monitoring across the React browser application and the
`/api/automation-lead` Vercel function. Capture errors in Vercel Preview and
Production, upload source maps for readable stack traces, and prevent lead data,
credentials, or default personally identifiable information from reaching Sentry.

## Scope

The integration includes browser exceptions, React rendering failures, unexpected
API exceptions, safe operational tags, and Vite source-map uploads. It does not
include performance tracing, session replay, profiling, structured logs, user
feedback, or automatic user identification.

Sentry is operational monitoring rather than analytics. It is enabled in Preview
and Production independently of the optional GA4 consent choice, but the privacy
notice must disclose it as an essential error-monitoring provider.

## Architecture

### Browser SDK

Create a focused browser module that conditionally calls `Sentry.init()` only
when all of the following are true:

- `VITE_SENTRY_DSN` is present.
- The deployment environment resolves to `preview` or `production`.
- The application is not running in an ordinary local development session.

The SDK configuration must set `sendDefaultPii: false`, disable tracing and
replay, and use event and breadcrumb sanitizers. No form state, user identity,
email, captcha token, webhook URL, request body, or environment object may be
attached to an event.

The React 18 root will be wrapped in `Sentry.ErrorBoundary`. Its fallback will
provide a concise message and reload action without rendering exception text,
component stacks, event identifiers, or other diagnostics to the visitor.

### Server SDK

Install and use `@sentry/node` through a small server-side reporter module. It
will initialize only when `SENTRY_DSN` is present and the Vercel environment is
Preview or Production. The server DSN remains server-only even though a DSN is
not an authentication secret.

The API handler will report unexpected exceptions and operational failures that
indicate unavailable infrastructure. Expected validation errors, honeypot
submissions, invalid captcha challenges, same-origin rejections, and rate-limit
responses are normal control flow and must not create Sentry issues.

Captured API events may include only fixed tags such as `service`, `stage`,
`submission_type`, and HTTP status class. They must not include the request,
validated payload, client IP, user agent, headers, provider response bodies, or
environment variables. Reporting and bounded flushing are best-effort and must
never change the API response or keep a request open indefinitely.

## Privacy Filtering

Shared sanitizer behavior will:

- Remove query strings and fragments from captured URLs.
- Remove `user`, request data, cookies, authorization values, and headers.
- Remove extras and contexts whose keys imply passwords, secrets, tokens, API
  keys, captcha data, email, messages, payloads, or request bodies.
- Drop console breadcrumbs and sanitize navigation and HTTP breadcrumb URLs.
- Limit breadcrumb count and event string length.

The implementation will retain stack frames, error type, safe error message,
release metadata, environment, and fixed operational tags so reports remain
useful.

## Environments And Releases

Use Vercel deployment metadata to label browser and server events as `preview`
or `production`. Local development remains disabled by default. Release identity
will use Vercel's Git commit SHA when available so browser events and uploaded
source maps share the same release.

`VITE_SENTRY_DSN` is browser-visible. The following variables are server-only:

- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`

The source-map plugin runs only when its three upload variables are present.
Missing upload configuration must not fail ordinary local builds.

## Source Maps

Use the official Sentry Vite plugin. Production builds generate source maps,
inject debug identifiers, upload artifacts when configured, and delete generated
`.map` files after upload so source maps are not publicly deployed. Preview and
Production builds use the same mechanism and environment-specific event labels.

## Error Handling

Sentry transport or initialization errors are non-blocking. A Sentry failure
must never prevent React rendering, form submission, or the API's safe response
mapping. API reporting uses a short flush timeout only after capture.

## Testing

Automated coverage will verify:

- Browser and server initialization are disabled locally or without DSNs.
- Preview and Production resolve to distinct environment labels.
- Event and breadcrumb sanitizers remove sensitive fields and URL query strings.
- The React root contains a safe Sentry error boundary.
- Tracing, replay, logs, profiling, default PII, and user feedback remain disabled.
- API failures are reported with fixed tags and without request or lead data.
- Expected validation, captcha challenge, and rate-limit responses are not
  reported.
- The Vite source-map plugin is conditional and deletes maps after upload.
- Local builds succeed without Sentry upload credentials.

Manual verification will use temporary development-only browser and API test
errors. One Preview deployment must confirm that both events arrive in Sentry
with readable source-mapped stack traces and no submitted personal data.

## Documentation

Update `.env.example`, `SECURITY_ENV_SETUP.md`, and the privacy notice with the
required variables, dashboard setup steps, safe testing procedure, retention
review, and secret-handling rules. Documentation must not claim legal compliance.
