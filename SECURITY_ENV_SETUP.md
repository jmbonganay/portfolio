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


## Local development fallback fix

This project includes safe frontend fallback values for Web3Forms, hCaptcha, and GA4 so the contact form will not display “hCaptcha site key is missing” during local testing. These values are public identifiers, not private backend secrets.

For production, Vercel Environment Variables are still preferred because they let you change keys without editing source code. Add these in Vercel under **Settings > Environment Variables**:

```env
VITE_WEB3FORMS_ACCESS_KEY=b07a88a1-7a8b-4307-a080-e13b3c51f57c
VITE_HCAPTCHA_SITE_KEY=50b2fe65-b00b-4b9e-ad62-3ba471098be2
VITE_GA4_MEASUREMENT_ID=G-LS3188BW9V
```

After editing environment variables in Vercel, redeploy the project. For local `.env.local` changes, restart `npm run dev`.
