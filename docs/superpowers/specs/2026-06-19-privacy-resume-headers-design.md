# Privacy, Public Resume, and Headers Design

**Status:** Approved

## Goal

Prevent analytics from running before consent, disclose essential service processing, reduce personal information in the public resume, and modernize response headers without breaking hCaptcha or the portfolio UI.

## Analytics Consent

GA4 is disabled by default. On a visitor's first visit, a compact bottom bar presents equally accessible **Decline** and **Allow analytics** actions. The approved visual is option A from the companion review.

The choice is stored under a versioned local key with one of two values:

```text
granted
denied
```

GA4 initializes and sends the first page view only after `granted`. Declining performs no GA initialization or network request. A footer **Privacy choices** control clears the current presentation state and reopens the bar. Essential hCaptcha, Upstash, Make, Gmail, and Google Sheets processing remains available because it is required to submit a requested form action.

## Privacy Notice

A concise accessible notice explains:

- GA4 is optional and consent-controlled.
- hCaptcha provides abuse prevention.
- Upstash stores short-lived rate-limit counters keyed by minimized identifiers.
- Make processes verified form payloads.
- Gmail sends requested responses and Google Sheets records the inquiry.
- Visitors may use direct email instead of the forms.

The notice does not claim legal compliance or set retention periods that have not been configured in provider dashboards.

## Public Resume

Create a replacement public PDF using the existing resume as content input while removing:

- phone number
- exact city or street-level location
- home internet details
- power backup details
- computer specifications
- workspace descriptions

Use `Philippines · Remote` as the public location. Retain professional email, LinkedIn, experience, skills, selected results, and relevant education or certifications. Preserve the detailed original outside `public/` for private applications. The replacement must be text-extractable, visually reviewed page by page, and use the existing public filename so website links continue working.

## Security Headers

Remove:

```text
X-XSS-Protection
```

Add:

```text
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Resource-Policy: same-origin
```

Preserve HSTS, `nosniff`, frame denial, referrer policy, permissions policy, and the current CSP allow-lists required by hCaptcha and GA4. Do not add COEP because it can block required third-party frames. Keep inline-style support because the present React UI uses inline animation variables; removing it is outside this implementation's safe scope.

## Components

- `src/privacy/analytics-consent.js`: pure consent state parsing and persistence.
- `src/components/PrivacyConsent.jsx`: compact bar, notice, focus behavior, and actions.
- `src/main.jsx`: consent-gated GA4 initialization.
- `src/App.jsx`: footer privacy control and disclosure entry point.
- `src/styles.css`: responsive consent-bar styles matching the approved dark teal system.
- `vercel.json`: header updates.
- `public/JohnMichael_Bonganay_Resume.pdf`: public-safe replacement.

## Accessibility

The consent bar uses a labelled region, visible keyboard focus, 44-pixel minimum controls, no focus trap, and no preselected choice. The privacy notice is keyboard operable, labelled, and dismissible. Consent remains understandable without color or motion.

## Test Coverage

Tests verify that unknown or missing consent does not initialize GA4, granted consent initializes once, denied consent remains off, preferences can reopen, and storage failures fall back to analytics disabled. Header tests verify removal and additions. PDF checks verify removed sensitive phrases are absent, required professional sections remain, and every page renders without clipping.

## Manual Dashboard Review

Before production handoff, review GA4 retention, Google Signals, consent settings, and internal-traffic exclusions. Confirm hCaptcha hostname restrictions, Upstash analytics visibility, Make execution retention, Gmail sender identity, and Google Sheets access permissions.

