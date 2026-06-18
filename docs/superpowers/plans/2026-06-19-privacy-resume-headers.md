# Privacy, Resume, and Headers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate GA4 behind explicit consent, add the approved compact privacy bar, publish a reduced resume, and modernize security headers.

**Architecture:** Keep consent state and analytics startup in small testable modules, render a lightweight accessible React bar, and generate the public PDF with a render-and-inspect workflow.

**Tech Stack:** React 18, react-ga4, localStorage, Vercel headers, ReportLab/PDF tools, Node test runner.

---

### Task 1: Add pure consent persistence

**Files:**
- Create: `src/privacy/analytics-consent.js`
- Create: `tests/analytics-consent.test.mjs`

- [ ] Write failing tests for missing, granted, denied, invalid, storage-read failure, storage-write failure, and reopening preferences.
- [ ] Run `node --test tests/analytics-consent.test.mjs` and verify RED.
- [ ] Implement:

```js
export const ANALYTICS_CONSENT_KEY = "portfolio:analytics-consent:v1";
export function readAnalyticsConsent(storage) {}
export function writeAnalyticsConsent(storage, value) {}
export function clearAnalyticsConsent(storage) {}
```

Unknown/error states return `null`, which means analytics disabled and bar visible.
- [ ] Re-run the focused tests and require GREEN.

### Task 2: Gate GA4 initialization

**Files:**
- Create: `src/privacy/analytics.js`
- Modify: `src/main.jsx`
- Test: `tests/analytics-consent.test.mjs`

- [ ] Add failing tests proving GA4 initializes once only when consent is `granted` and a measurement ID exists.
- [ ] Implement `initializeAnalytics({ consent, measurementId, analytics })` with no side effects for other states.
- [ ] Remove unconditional startup from `main.jsx`; initialize from the consent state path.
- [ ] Re-run the focused tests and require GREEN.

### Task 3: Build the approved compact consent bar

**Files:**
- Create: `src/components/PrivacyConsent.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `tests/security-hardening.test.mjs`

- [ ] Add failing source/style contracts for the labelled region, Decline, Allow analytics, privacy notice, footer reopen control, 44-pixel targets, and responsive bottom-bar layout.
- [ ] Run `npm test` and verify RED.
- [ ] Implement option A with equal actions, keyboard focus, no focus trap, and a concise disclosure of GA4/hCaptcha/Upstash/Make/Gmail/Sheets.
- [ ] Re-run `npm test` and require GREEN.

### Task 4: Modernize Vercel headers

**Files:**
- Modify: `vercel.json`
- Modify: `tests/security-hardening.test.mjs`

- [ ] Add failing assertions that `X-XSS-Protection` is absent and COOP/CORP values match the approved design.
- [ ] Run the focused test and verify RED.
- [ ] Remove the legacy header and add:

```text
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Resource-Policy: same-origin
```

- [ ] Re-run the focused test and require GREEN.

### Task 5: Generate the public-safe resume

**Files:**
- Modify: `public/JohnMichael_Bonganay_Resume.pdf`
- Create: `tests/resume-content.test.mjs`

- [ ] Use the PDF skill to extract and inspect the existing resume without exposing its private text in logs.
- [ ] Add failing content checks for removed phone/location/infrastructure details and retained professional sections.
- [ ] Generate a polished replacement at the same public path using `Philippines · Remote`, professional email, LinkedIn, experience, skills, results, and relevant education.
- [ ] Render every page to PNG and inspect clipping, hierarchy, spacing, and link presentation.
- [ ] Run the content test and require GREEN.

### Task 6: Complete privacy and deployment documentation

**Files:**
- Modify: `SECURITY_ENV_SETUP.md`
- Modify: `.env.example`

- [ ] Document consent behavior and manual provider-dashboard checks without claiming legal compliance.
- [ ] Run `npm test`, `npm run build`, `npm audit --json`, `git diff --check`, blueprint validation, and PDF render verification.

