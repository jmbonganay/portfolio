# Security Environment Setup

This project reads public frontend identifiers from Vite environment variables instead of hardcoding them directly in React files.

## Required Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```env
VITE_WEB3FORMS_ACCESS_KEY=your_actual_web3forms_access_key
VITE_HCAPTCHA_SITE_KEY=your_actual_hcaptcha_site_key
VITE_GA4_MEASUREMENT_ID=your_actual_ga4_measurement_id
```

## Local development

Copy `.env.example` to `.env.local` and paste your values locally. `.env.local` is ignored by git.

```bash
cp .env.example .env.local
```

The `VITE_` prefix is required because this is a Vite frontend app. Values with `VITE_` are still visible in the browser bundle, so do not place private server-only secrets here.
