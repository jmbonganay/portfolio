# Contact Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the portfolio Contact section into an accessible, project-first conversion split while preserving the existing Web3Forms, hCaptcha, validation, and automation handoff behavior.

**Architecture:** Keep the existing form state and submission pipeline in `src/App.jsx`. Move approved presentation copy and option arrays into a small data module, add a tested pure helper for invalid-field focus order, refactor only the Contact JSX, and add a final scoped CSS layer that overrides the older contact styles without affecting other sections.

**Tech Stack:** React 18, Vite 7, Lucide React, hCaptcha, Web3Forms, Node built-in test runner.

---

### Task 1: Add testable Contact content and accessibility contracts

**Files:**
- Create: `tests/contact-section.test.mjs`
- Create: `src/data/contact.js`
- Modify: `package.json`

- [ ] **Step 1: Add the failing content and helper tests**

```js
// tests/contact-section.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  contactCopy,
  contactProjectTypes,
  contactTrustSignals,
  getFirstInvalidContactField,
} from "../src/data/contact.js";

test("contact content prioritizes project inquiries", () => {
  assert.equal(contactCopy.eyebrow, "Start a conversation");
  assert.equal(contactCopy.headline, "Tell me what you need to launch.");
  assert.equal(contactCopy.submitLabel, "Send project details");
  assert.deepEqual(contactProjectTypes, [
    "Landing page",
    "Website or store",
    "Automation",
    "Remote role",
  ]);
});

test("contact trust signals stay concise", () => {
  assert.deepEqual(contactTrustSignals, [
    "Usually replies within 24 hours",
    "Design, build, QA, and handoff support",
    "Remote ready with US, UK, and AU overlap",
  ]);
});

test("invalid contact fields follow visual form order", () => {
  assert.equal(getFirstInvalidContactField({ email: "Invalid" }), "email");
  assert.equal(
    getFirstInvalidContactField({ message: "Too short", name: "Required" }),
    "name",
  );
  assert.equal(getFirstInvalidContactField({}), null);
});
```

- [ ] **Step 2: Add the Node test script**

```json
"scripts": {
  "dev": "vite --host 127.0.0.1",
  "test": "node --test tests/contact-section.test.mjs",
  "build": "vite build",
  "preview": "vite preview --host 127.0.0.1"
}
```

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/contact.js`.

- [ ] **Step 4: Add the minimal data module and focus-order helper**

```js
// src/data/contact.js
export const contactCopy = {
  eyebrow: "Start a conversation",
  headline: "Tell me what you need to launch.",
  introduction:
    "A short overview of the goal, platform, and timeline is enough. I will review it personally and reply with the clearest next step.",
  formEyebrow: "Project inquiry",
  formTitle: "Send the project details",
  formHelper: "Required fields only. No long questionnaire.",
  messageLabel: "Project details",
  messageHint: "Share the goal, platform, timeline, or anything useful.",
  submitLabel: "Send project details",
  fallback: "Security check unavailable? Email me directly instead.",
};

export const contactProjectTypes = [
  "Landing page",
  "Website or store",
  "Automation",
  "Remote role",
];

export const contactTrustSignals = [
  "Usually replies within 24 hours",
  "Design, build, QA, and handoff support",
  "Remote ready with US, UK, and AU overlap",
];

export function getFirstInvalidContactField(errors) {
  return ["name", "email", "message"].find((field) => errors[field]) ?? null;
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run: `npm test`

Expected: 3 tests pass.

### Task 2: Refactor Contact markup without changing submission behavior

**Files:**
- Modify: `src/App.jsx:24-31`
- Modify: `src/App.jsx:867-877`
- Modify: `src/App.jsx:2390-2650`
- Modify: `src/App.jsx:3204-3550`
- Test: `tests/contact-section.test.mjs`

- [ ] **Step 1: Add a failing source contract test for the approved structure**

```js
import { readFile } from "node:fs/promises";

test("contact markup uses the approved project-first structure", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(source, /className="contact-primary-fields"/);
  assert.match(source, /className="contact-security-row"/);
  assert.match(source, /className="contact-email-actions"/);
  assert.match(source, /contactCopy\.headline/);
  assert.match(source, /contactCopy\.submitLabel/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because the new contact class names and imported copy are absent.

- [ ] **Step 3: Import the approved data and remove the local Contact arrays**

```js
import {
  contactCopy,
  contactProjectTypes,
  contactTrustSignals,
  getFirstInvalidContactField,
} from "./data/contact";
```

Delete the old `contactProjectTypes` and `contactTrustSignals` constants from `src/App.jsx`.

- [ ] **Step 4: Focus the first invalid required field after a rejected submit**

Add a form ref near the existing Contact refs:

```js
const contactFormRef = useRef(null);
```

Attach it to the existing form:

```jsx
<form
  ref={contactFormRef}
  className={
    contactSucceeded
      ? "contact-form contact-form--success"
      : "contact-form"
  }
  noValidate
  onSubmit={handleContactSubmit}
>
```

Immediately after detecting validation errors in `handleContactSubmit`:

```js
if (Object.keys(nextErrors).length > 0) {
  const firstInvalidField = getFirstInvalidContactField(nextErrors);
  window.requestAnimationFrame(() => {
    contactFormRef.current
      ?.querySelector(`[name="${firstInvalidField}"]`)
      ?.focus();
  });
  setContactStatus({
    type: "error",
    message: "Please complete the required fields before sending.",
  });
  return;
}
```

- [ ] **Step 5: Replace only the Contact presentation markup**

Make these exact structural edits while keeping the current hidden bot field, hCaptcha callbacks, Web3Forms values, automation endpoint request, success state, error state, and disabled state logic unchanged:

```jsx
<div className="contact-card contact-card--project-first">
```

Use `contactCopy.eyebrow`, `contactCopy.headline`, and `contactCopy.introduction` for the left-side heading content. Replace the availability card with a semantic list that maps `contactTrustSignals` into `.contact-trust-list` items.

Replace the current copy-only email card with sibling actions so nested interactive elements are avoided:

```jsx
<div className="contact-email-card">
  <a href={`mailto:${profile.email}`}>
    <Mail size={18} aria-hidden="true" />
    <span>
      <small>Email John</small>
      <strong>{profile.email}</strong>
    </span>
  </a>
  <button
    className={emailCopied ? "contact-copy-action is-copied" : "contact-copy-action"}
    type="button"
    onClick={handleCopyEmail}
    aria-label={`Copy email address ${profile.email}`}
  >
    {emailCopied ? "Copied" : "Copy address"}
  </button>
</div>
```

Wrap the existing Name and Email `.form-field` blocks in `<div className="contact-primary-fields">`. Change the inquiry label to `What can I help with?`, the message label to `contactCopy.messageLabel`, and add this helper after the message label:

```jsx
<span className="form-field__hint" id="contact-message-hint">
  {contactCopy.messageHint}
</span>
```

Include `contact-message-hint` in the textarea's `aria-describedby` value whenever no validation error is present.

Use this exact form header structure:

```jsx
<div className="contact-form__top">
  <div>
    <div className="contact-form__eyebrow">
      <span className="status-dot" aria-hidden="true" />
      <p>{contactCopy.formEyebrow}</p>
    </div>
    <h3>{contactCopy.formTitle}</h3>
    <small>{contactCopy.formHelper}</small>
  </div>
  <span className="contact-duration">2 to 3 minutes</span>
</div>
```

Wrap the existing hCaptcha block and submit button in `<div className="contact-security-row">`. Set the normal submit label to `contactCopy.submitLabel`. Place this fallback beneath the security row:

```jsx
<p className="contact-reply-note">
  <CheckCircle2 size={16} aria-hidden="true" />
  {contactCopy.fallback}
</p>
```

- [ ] **Step 6: Run the tests and build**

Run: `npm test && npm run build`

Expected: all Contact tests pass and Vite builds successfully.

### Task 3: Add the approved responsive visual system

**Files:**
- Modify: `src/styles.css` after the current final footer block
- Test: `tests/contact-section.test.mjs`

- [ ] **Step 1: Add a failing CSS contract test**

```js
test("contact styles include desktop and mobile project-first layouts", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /CONTACT — PROJECT FIRST CONVERSION PASS/);
  assert.match(css, /\.contact-primary-fields/);
  assert.match(css, /\.contact-security-row/);
  assert.match(css, /@media \(max-width: 760px\)/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because the final scoped Contact CSS layer is absent.

- [ ] **Step 3: Add a final Contact CSS layer**

The layer must implement these exact layout rules:

```css
/* CONTACT — PROJECT FIRST CONVERSION PASS */
.contact-card--project-first {
  grid-template-columns: minmax(0, 0.78fr) minmax(430px, 1fr);
  gap: clamp(24px, 4vw, 54px);
  padding: clamp(20px, 3vw, 34px);
  border-radius: 28px;
}

.contact-primary-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.contact-security-row {
  display: grid;
  grid-template-columns: minmax(304px, auto) minmax(190px, 1fr);
  gap: 12px;
  align-items: center;
}

@media (max-width: 1080px) {
  .contact-card--project-first { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .contact-primary-fields,
  .contact-security-row { grid-template-columns: 1fr; }
  .project-type-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .contact-direct { grid-template-columns: 1fr; }
}
```

Also style persistent labels, direct email/copy actions, the three-item trust list, 44px minimum tap targets, teal focus rings, gold support accents, success/error states, no-hover behavior, and reduced-motion behavior. Scope every rule under `.contact-section` or a `.contact-*` class.

- [ ] **Step 4: Run the tests and build**

Run: `npm test && npm run build`

Expected: all tests pass and Vite builds successfully.

### Task 4: Verify Contact behavior and responsive presentation

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/styles.css`
- Verify: `.env.local` is not printed or modified

- [ ] **Step 1: Run automated verification**

Run: `npm test && npm run build && git diff --check`

Expected: tests pass, build succeeds, and no whitespace errors are reported.

- [ ] **Step 2: Run browser checks at 1440px, 768px, and 375px**

Verify:

- Desktop uses the approved 42/58 split.
- Name and email share one row only when space allows.
- Inquiry options are four columns on wide screens and 2 × 2 on mobile.
- Direct email and LinkedIn controls remain keyboard reachable.
- Copy feedback changes to `Copied` and returns after two seconds.
- hCaptcha appears immediately before submission and never overflows at 375px.
- Invalid submission focuses the first invalid field.
- Success and error announcements remain available to assistive technology.
- Existing Web3Forms and automation handoff code paths remain unchanged.

- [ ] **Step 3: Review the final diff**

Confirm no unrelated Hero, Selected Works, FAQ, Footer, API, or environment-variable code was changed during this pass.

---

**Execution note:** Commit steps are intentionally omitted because `src/App.jsx` and `src/styles.css` already contain approved uncommitted Footer work. Keep all existing user changes intact and do not create a mixed local commit unless the user explicitly requests one.
