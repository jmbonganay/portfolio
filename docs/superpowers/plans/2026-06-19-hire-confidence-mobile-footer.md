# Hire Confidence Mobile Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore readable mobile copy and full-width CTA buttons in the Hire Confidence footer.

**Architecture:** Preserve the existing React markup and desktop grid. Add one mobile grid override in the existing `max-width: 720px` media query, protected by a focused source-level regression test.

**Tech Stack:** React 18, CSS, Node test runner, Vite.

---

### Task 1: Correct The Mobile Grid

**Files:**
- Create: `tests/hire-confidence-mobile.test.mjs`
- Modify: `src/styles.css:13678`

- [ ] Write a failing test requiring `.hire-confidence-footer` to use `grid-template-columns: 1fr` inside the mobile breakpoint.
- [ ] Run `node --test tests/hire-confidence-mobile.test.mjs` and confirm it fails because the override is absent.
- [ ] Add `grid-template-columns: 1fr` to the existing mobile footer rule.
- [ ] Re-run the focused test and confirm it passes.
- [ ] Run `npm test`, `npm run build`, and inspect the section at 375px and desktop width.
