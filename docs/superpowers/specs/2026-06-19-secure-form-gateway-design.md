# Secure Form Gateway Design

**Status:** Approved

## Goal

Route the portfolio Contact and AI Proposal forms through one server-controlled endpoint that verifies hCaptcha, enforces durable Upstash limits, validates every field, and invokes Make only after all defensive checks pass.

## Scope

- Replace browser-to-Web3Forms submission with `/api/automation-lead` for both forms.
- Add hCaptcha to the AI Proposal form and reuse the existing Contact widget.
- Verify every hCaptcha token once, on the server.
- Replace process-memory throttling with Upstash Redis.
- Require Make custom-webhook API-key authentication through `x-make-apikey`.
- Add automated API tests for rejection paths and provider failures.

Web3Forms will be removed from the runtime and environment documentation. Make/Gmail becomes the only email delivery path.

## Request Contract

The browser sends JSON with these allowed fields:

```json
{
  "name": "string, 1-160 characters",
  "email": "valid email, maximum 240 characters",
  "message": "contact text, 20-3000 characters",
  "projectIdea": "AI project text, 20-3000 characters",
  "projectType": "contact category, maximum 160 characters",
  "submissionType": "contact_form or ai_scoper",
  "captchaToken": "non-empty hCaptcha response",
  "botcheck": "optional honeypot"
}
```

`contact_form` requires `message` and `projectType`. `ai_scoper` requires `projectIdea`. Unexpected fields, control characters in identity fields, invalid types, and oversized payloads are rejected.

## Processing Order

1. Require `POST` and set `Cache-Control: no-store`.
2. Require matching request origin and host.
3. Require JSON and enforce the 12 KB body limit.
4. Parse, allow-list, trim, normalize, and validate the payload.
5. Return a neutral success for a filled honeypot without invoking providers.
6. Apply an Upstash IP limit.
7. Verify hCaptcha with a form-encoded `POST` to `https://api.hcaptcha.com/siteverify`, including `secret`, `response`, `remoteip`, and expected `sitekey`.
8. Apply an Upstash email/submission-type limit.
9. Forward only normalized fields to Make with the `x-make-apikey` header.
10. Return `202` only when Make accepts the webhook request.

Tokens are never sent to more than one verifier. The server does not log secrets, CAPTCHA tokens, Redis tokens, raw provider responses, or full lead content.

## Rate Limits

Use a regional Upstash database and `Ratelimit.slidingWindow` with distinct prefixes:

- IP: 5 validated attempts per 10 minutes, keyed by submission type and client IP.
- Email: 3 validated attempts per 10 minutes, keyed by submission type and normalized email.

The handler treats Upstash timeout or configuration failure as `503`; expensive Make or AI work does not fail open. A blocked response returns `429` and `Retry-After`.

## hCaptcha Verification

The verifier uses `HCAPTCHA_SECRET_KEY`, `VITE_HCAPTCHA_SITE_KEY`, client IP, and a five-second abort timeout. Missing configuration returns `503`. Missing or rejected tokens return `403`. Provider errors return `502` without exposing hCaptcha error details to the browser.

## Make Authentication

`MAKE_WEBHOOK_SECRET` is mandatory. It is sent only as the `x-make-apikey` request header supported by Make custom webhooks. It is not included in the JSON payload or blueprint. Missing `MAKE_WEBHOOK_URL` or `MAKE_WEBHOOK_SECRET` returns `503`.

## Client Behavior

- Both forms disable submission while a request is running.
- Both send `captchaToken` to the same-origin API.
- CAPTCHA is reset after rejected, expired, or completed submissions.
- `403`, `429`, `502`, and `503` receive specific but non-sensitive messages.
- Contact success means Make accepted the verified request; it no longer depends on Web3Forms.
- Analytics events fire only after a successful `202` and only when analytics consent is granted.

## Code Boundaries

- `api/automation-lead.js`: HTTP orchestration and response mapping.
- `api/security/hcaptcha.js`: hCaptcha verification and timeout behavior.
- `api/security/rate-limit.js`: Upstash clients, identifiers, and limit mapping.
- `api/security/validation.js`: pure request validation and normalization.
- `src/App.jsx`: Contact form token forwarding and Web3Forms removal.
- `src/components/AutomationModal.jsx`: AI Proposal hCaptcha widget and token forwarding.

The handler will be created from injected service functions so tests can exercise real orchestration with deterministic provider doubles without adding test-only production branches.

## Environment Variables

Server-only:

```text
HCAPTCHA_SECRET_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
MAKE_WEBHOOK_URL
MAKE_WEBHOOK_SECRET
```

Browser-visible:

```text
VITE_HCAPTCHA_SITE_KEY
```

`VITE_WEB3FORMS_ACCESS_KEY` is removed.

## Test Coverage

Automated tests will cover method, origin, media type, body size, malformed JSON, unexpected fields, honeypot behavior, missing CAPTCHA, failed CAPTCHA, provider timeout, IP throttling, email throttling, missing configuration, authenticated Make forwarding, Make failure, and accepted submissions. Tests will also prove secrets and CAPTCHA tokens are absent from forwarded payloads.

## Deployment Requirements

- Restrict the hCaptcha sitekey to production, preview, and approved local hostnames.
- Configure all server variables in Vercel Production, Preview, and Development scopes.
- Keep `.env.local` ignored.
- Rotate the hCaptcha secret after implementation because it was previously shared in conversation history.

