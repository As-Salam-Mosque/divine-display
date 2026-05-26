PR Review Checklist — Responsivity & Accessibility

This file contains manual steps and automated checks to run before merging `feat/responsivity`.

- Run local lint & format
  - `npm run lint` — fix any reported issues; run `--fix` where appropriate.

- Visual smoke tests (recommended viewports)
  - 375x812 (mobile)
  - 768x1024 (tablet)
  - 1366x768 (desktop)
  - 1920x1080 (TV target)

- Lighthouse (desktop + mobile)
  - From Chrome DevTools: Audits → run Lighthouse (Mobile and Desktop) or use CLI:
    - `npx lighthouse http://localhost:5175 --view --preset=mobile`
    - `npx lighthouse http://localhost:5175 --view --preset=desktop`
  - Focus on: Performance (CLS), Accessibility, and Best Practices.

- axe-core accessibility scan
  - Install `axe-core` or use the browser extension to scan the running app.
  - CLI example (using Pa11y with axe):
    - `npx pa11y http://localhost:5175 --standard WCAG2AA`

- Keyboard & Focus checks
  - Keyboard-only navigation: open `Settings` modal, tab through controls, ensure focus is visible and returned to trigger on close.
  - Verify `:focus-visible` styles (`.focus-ring`) are present and not suppressed.

- Reduced-motion verification
  - Set OS `prefers-reduced-motion: reduce` and confirm marquee, pulses, and long transitions are disabled.

- Image/CLS checks
  - Verify promo/ad images reserve space before load (no layout shifts on load).
  - Confirm `loading="lazy"` applied to non-critical images.

- Visual acceptance
  - Clock scales smoothly across breakpoints — check large TVs and small phones.
  - Prayer table flows to multiple rows without overflow.

- CI/lint notes
  - Ensure PR passes repository CI checks and ESLint rules.

If all checks pass, merge the PR.
