# Selected Work Performance Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the seven real performance screenshots instead of hardcoded metric tiles and let visitors enlarge them inline.

**Architecture:** Add one reusable `ProjectPerformanceProof` disclosure in `App.jsx`. Both Selected Works card variants conditionally render it when `project.proofImage` exists and otherwise preserve their existing metric grids; shared responsive styles live in `styles.css`.

**Tech Stack:** React 18, native HTML `details`/`summary`, CSS, Node test runner, Vite.

---

### Task 1: Lock In Conditional Proof Rendering

**Files:**
- Create: `tests/selected-work-performance-proof.test.mjs`
- Modify: `src/App.jsx`

- [ ] Write a failing source-level test that requires the reusable disclosure and proof-versus-metrics conditional in both card variants.
- [ ] Run `node --test tests/selected-work-performance-proof.test.mjs` and confirm it fails because the disclosure is missing.
- [ ] Add `ProjectPerformanceProof` and use it from `FeaturedProjectCard` and `ProjectCard`.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Style The Expandable Screenshots

**Files:**
- Modify: `src/styles.css`
- Test: `tests/selected-work-performance-proof.test.mjs`

- [ ] Extend the failing test to require preview, expanded viewport, focus, and mobile selectors.
- [ ] Run the focused test and confirm the new CSS assertions fail.
- [ ] Add compact preview, expanded horizontal viewport, interaction feedback, and responsive CSS.
- [ ] Re-run the focused test and confirm it passes.

### Task 3: Verify The Result

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/styles.css`
- Verify: `src/data/projects.js`

- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `npm run build` and confirm the production bundle builds.
- [ ] Start the local app and inspect proof-backed and non-proof cards at desktop and mobile widths.
- [ ] Confirm a proof preview expands and collapses with mouse and keyboard, and confirm a non-proof project retains its metric grid.
