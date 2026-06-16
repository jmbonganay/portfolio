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


## Local development fallback fix

This project includes safe frontend fallback values for Web3Forms, hCaptcha, and GA4 so the contact form will not display “hCaptcha site key is missing” during local testing. These values are public identifiers, not private backend secrets.

For production, Vercel Environment Variables are still preferred because they let you change keys without editing source code. Add these in Vercel under **Settings > Environment Variables**:

```env
VITE_WEB3FORMS_ACCESS_KEY=b07a88a1-7a8b-4307-a080-e13b3c51f57c
VITE_HCAPTCHA_SITE_KEY=50b2fe65-b00b-4b9e-ad62-3ba471098be2
VITE_GA4_MEASUREMENT_ID=G-LS3188BW9V
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-id
MAKE_WEBHOOK_SECRET=optional-shared-secret-for-make-validation
```

After editing environment variables in Vercel, redeploy the project. For local `.env.local` changes, restart `npm run dev`.
