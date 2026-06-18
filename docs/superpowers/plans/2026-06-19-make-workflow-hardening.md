# Make Workflow Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate an importable hardened Make blueprint with mutually exclusive routes, bounded AI instructions, fixed routing, and no embedded credentials.

**Architecture:** Transform the supplied blueprint with a deterministic Node script rather than hand-editing 200 KB of JSON. Validate the generated graph and sensitive mappings with automated tests.

**Tech Stack:** Make blueprint JSON, Node.js, Node test runner.

---

### Task 1: Add a safe blueprint transformer

**Files:**
- Create: `scripts/harden-make-blueprint.mjs`
- Create: `tests/make-blueprint.test.mjs`
- Read: `/Users/johnmichaelbonganay/Downloads/Asynchronous Inbound CRM Triage Engine.blueprint.json`

- [ ] Write failing tests that import `transformBlueprint` and require the expanded webhook schema, contact/AI filters, safe Gemini boundary, bounded generation, unique user-field mappings, and absence of credentials/webhook URLs.
- [ ] Run `node --test tests/make-blueprint.test.mjs` and verify RED.
- [ ] Implement:

```js
export function transformBlueprint(source) {}
export function validateBlueprint(blueprint) {}
```

Clone parsed input, update only known module IDs, normalize route filters, update Gemini mappings, and throw if expected modules are absent.
- [ ] Re-run the focused test and require GREEN.

### Task 2: Make contact routes mutually exclusive

**Files:**
- Modify: `scripts/harden-make-blueprint.mjs`
- Test: `tests/make-blueprint.test.mjs`

- [ ] Add failing assertions that recruiter/project/general filters all require `contact_form` and exclude overlapping categories.
- [ ] Run the focused test and verify RED.
- [ ] Update route filters so one contact submission reaches exactly one acknowledgment path.
- [ ] Ensure visitor recipients remain `{{1.email}}` and owner notification recipients are fixed portfolio configuration, never model output.
- [ ] Re-run the focused test and require GREEN.

### Task 3: Harden Gemini and document generation

**Files:**
- Modify: `scripts/harden-make-blueprint.mjs`
- Test: `tests/make-blueprint.test.mjs`

- [ ] Add failing assertions for an explicit untrusted-input delimiter, instruction-override refusal, exact four-section contract, low temperature, output-token bound, safe document name, and attachment provenance.
- [ ] Run the focused test and verify RED.
- [ ] Replace the Gemini prompt and generation configuration while preserving Gemini 2.5 Flash and the current Docs/Drive/Gmail chain.
- [ ] Re-run the focused test and require GREEN.

### Task 4: Generate and inspect the hardened blueprint

**Files:**
- Create: `automation/asynchronous-inbound-crm-triage-engine.hardened.blueprint.json`
- Create: `automation/IMPORT_CHECKLIST.md`

- [ ] Run:

```bash
node scripts/harden-make-blueprint.mjs \
  "/Users/johnmichaelbonganay/Downloads/Asynchronous Inbound CRM Triage Engine.blueprint.json" \
  automation/asynchronous-inbound-crm-triage-engine.hardened.blueprint.json
```

- [ ] Parse the output again and run the complete blueprint test.
- [ ] Write the exact import/reconnection checklist for secured webhook, Sheets, Gmail, Gemini, Docs template, and Drive.
- [ ] Run a credential-pattern scan over `automation/` and require no matches.

