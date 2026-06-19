# Hire Confidence Mobile Footer Design

## Goal

Prevent the call-to-action footer in the "Why clients hire me" section from squeezing its copy into a narrow column on mobile.

## Design

Keep the existing desktop two-column layout. At `720px` and below, replace it with one full-width column so the label and supporting sentence appear above the two existing full-width buttons. Preserve the current content, button order, colors, and interaction behavior.

## Verification

Add a CSS regression test for the mobile column override, run the complete test suite and production build, and inspect the section at 375px and desktop widths for overflow and readable line wrapping.
