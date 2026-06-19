# Selected Work Performance Proof Design

## Goal

Replace the hardcoded metric grid only for the seven Selected Works projects that already provide a `proofImage`, while keeping metrics unchanged for every other project.

## Interaction

Each proof-backed card shows its real dashboard screenshot in a compact, readable preview. The preview is a native `details` disclosure: clicking or keyboard-activating it expands a larger inline copy with a clear close label. The expanded area allows horizontal scrolling when the screenshot's natural width is wider than the card, preserving small dashboard text instead of shrinking it until it is unreadable.

## Accessibility And Layout

- Use native `details` and `summary` semantics for keyboard support and exposed expanded state.
- Include descriptive alt text based on the project title.
- Retain intrinsic image dimensions to prevent layout shift.
- Give interactive previews visible hover and focus states.
- Keep non-proof project markup and metric styling unchanged.
- Keep the interaction usable at desktop and mobile widths.

## Verification

Add a source-level regression test for the conditional rendering contract, run the full test suite and production build, then inspect the Selected Works section in a browser at desktop and mobile sizes.
