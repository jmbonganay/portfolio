# Security Environment Setup

Both portfolio forms submit to a same-origin Vercel function. The function validates input, applies durable Upstash limits, verifies hCaptcha, and then calls an API-key-protected Make webhook.

## Required Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```env
VITE_HCAPTCHA_SITE_KEY=your_actual_hcaptcha_site_key
VITE_GA4_MEASUREMENT_ID=your_actual_ga4_measurement_id
HCAPTCHA_SECRET_KEY=your_actual_hcaptcha_secret
UPSTASH_REDIS_REST_URL=your_actual_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_actual_upstash_rest_token
MAKE_WEBHOOK_URL=your_actual_make_webhook_url
MAKE_WEBHOOK_SECRET=your_make_webhook_api_key
```

Only `VITE_HCAPTCHA_SITE_KEY` and `VITE_GA4_MEASUREMENT_ID` are browser-visible. The hCaptcha secret, Upstash credentials, Make webhook URL, and Make API key are server-only and must never use the `VITE_` prefix.

## Local development

Copy `.env.example` to `.env.local` and paste your values locally. `.env.local` is ignored by git.

```bash
cp .env.example .env.local
```

Values with the `VITE_` prefix are visible in the browser bundle. Never place server secrets in a `VITE_` variable.


## Production values

The forms remain disabled until the public hCaptcha site key is configured. The server fails closed when the hCaptcha secret, Upstash credentials, Make URL, or Make API key is absent. GA4 stays disabled when its measurement ID is missing or analytics consent has not been granted.

Add these in Vercel under **Settings > Environment Variables**:

```env
VITE_HCAPTCHA_SITE_KEY=your_actual_hcaptcha_site_key
VITE_GA4_MEASUREMENT_ID=your_actual_ga4_measurement_id
HCAPTCHA_SECRET_KEY=your_actual_hcaptcha_secret
UPSTASH_REDIS_REST_URL=your_actual_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_actual_upstash_rest_token
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-id
MAKE_WEBHOOK_SECRET=your_make_webhook_api_key
```

After editing environment variables in Vercel, redeploy the project. For local `.env.local` changes, restart `npm run dev`.

The `/api/automation-lead` function enforces same-origin JSON requests, size and field limits, server-side hCaptcha verification, durable IP/email throttling, and HTTPS Make.com webhook URLs. Make must use the same API key through its Custom Webhook authentication setting; the function sends it as `x-make-apikey`.

## Privacy and consent behavior

GA4 does not initialize until a visitor selects **Allow analytics**. Declining or
leaving the choice unanswered keeps analytics disabled. The selection is stored
locally under `portfolio:analytics-consent:v1`, and the footer's **Privacy
preferences** control lets visitors change it later. Changing a grant to a
decline prevents future analytics calls in that browser; data already sent to a
provider is governed by that provider's retention controls.

hCaptcha is treated as an essential abuse-prevention service. Upstash runs only
on the server for throttling. Make, Gmail, and Google Sheets process form data
only after the same-origin gateway accepts a verified submission.

This implementation is a technical privacy control, not a claim of legal
compliance. Review the privacy and retention settings in the GA4, hCaptcha,
Upstash, Make, and Google dashboards for the regions where the site operates.

## Deployment checks

- Confirm GA4 DebugView remains empty before consent and receives a page view
  only after **Allow analytics** is selected.
- Confirm declining analytics persists after reload and the footer control can
  reopen the choices.
- Confirm hCaptcha hostnames include every Production and Preview domain used by
  the portfolio.
- Review Upstash retention/analytics settings and Make execution-log retention.
- Restrict Make and Google connections to the minimum team members and scopes
  required by the workflow.
- Rotate the Make webhook API key, hCaptcha secret, and Upstash token after any
  suspected disclosure, then redeploy Vercel.
