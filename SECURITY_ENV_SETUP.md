# Security Environment Setup

This project reads public frontend identifiers from Vite environment variables instead of hardcoding them directly in React files.

## Required Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```env
VITE_WEB3FORMS_ACCESS_KEY=your_actual_web3forms_access_key
VITE_HCAPTCHA_SITE_KEY=your_actual_hcaptcha_site_key
VITE_GA4_MEASUREMENT_ID=your_actual_ga4_measurement_id
MAKE_WEBHOOK_URL=your_actual_make_webhook_url
MAKE_WEBHOOK_SECRET=optional_shared_secret_for_make_validation
```

`MAKE_WEBHOOK_URL` and `MAKE_WEBHOOK_SECRET` are server-only values used by the `/api/automation-lead` Vercel function. Do not prefix them with `VITE_`; they should not be exposed in the browser bundle.

## Local development

Copy `.env.example` to `.env.local` and paste your values locally. `.env.local` is ignored by git.

```bash
cp .env.example .env.local
```

The `VITE_` prefix is required because this is a Vite frontend app. Values with `VITE_` are still visible in the browser bundle, so do not place private server-only secrets here.


## Production values

Web3Forms and hCaptcha use public browser identifiers, so the app includes working fallbacks to keep the form available when environment variables are temporarily missing. Production environment variables are still preferred because they allow rotation without a code change. GA4 remains env-only and stays disabled when its variable is missing.

Add these in Vercel under **Settings > Environment Variables**:

```env
VITE_WEB3FORMS_ACCESS_KEY=your_actual_web3forms_access_key
VITE_HCAPTCHA_SITE_KEY=your_actual_hcaptcha_site_key
VITE_GA4_MEASUREMENT_ID=your_actual_ga4_measurement_id
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-id
MAKE_WEBHOOK_SECRET=optional-shared-secret-for-make-validation
```

After editing environment variables in Vercel, redeploy the project. For local `.env.local` changes, restart `npm run dev`.

The `/api/automation-lead` function also enforces same-origin JSON requests, size limits, basic input validation, simple IP-based throttling, and HTTPS Make.com webhook URLs only. These controls reduce spam and accidental webhook misconfiguration, but they are not a replacement for provider-side abuse controls in Web3Forms, hCaptcha, Make.com, and Vercel.
