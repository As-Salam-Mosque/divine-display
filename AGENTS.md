# Copilot Instructions

## Project Overview

**Divine Display** is a mosque prayer times display screen built with **React 19 + TypeScript + Vite**, designed for large-format 16:9 displays (TVs/monitors). It supports dark/light theming, bilingual (EN/FR) i18n, and a critical-signal state for Adhan/Iqamah alerts.

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # Type-check + Vite build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build
npm test          # Run Vitest test suite
```

## Architecture

### Configuration entry point

**`mosque.config.ts`** (repo root) is the primary file a mosque administrator edits. It exports a `MosqueConfig` object containing coordinates, calculation method, iqamah offsets, ad slots, promo configuration, and announcement strings. All runtime data flows from this file.

### Data flow

```
mosque.config.ts
  └─ useMosqueConfig()        — loads config (local fallback or remote via VITE_MOSQUE_CONFIG_URL)
  └─ usePrayerTimes(config)   — fetches AlAdhan API, caches in localStorage (lazy initializer)
       └─ derives activePrayerIndex / nextPrayerIndex / statusMessage every second
  └─ useClock(language)       — 1s interval, locale-aware date/time strings
  └─ usePromoTimer(options)   — weighted-random promo rotation lifecycle
```

`SettingsContext` (`src/context/SettingsContext.tsx`) holds user-adjustable preferences (`language`, `timeFormat`, `showSponsors`, `theme`, `mosque` info) persisted to `localStorage` under the key `"divine-display-settings"`.

### Component tree

```
App
  SettingsProvider
    Display
      ClockPanel           — mosque branding, hijri date, live countdown, settings gear
        CriticalSignalPanel — full-screen alert during Adhan/Iqamah signal window
      PromoRail            — weighted-random sponsor promo overlay (uses usePromoTimer)
      PrayerTable          — renders PrayerCards in a responsive grid
        PrayerCard         — active/inactive state, Shuruq special case
      AdRail               — conditional on settings.showSponsors (aside landmark)
      AnnouncementTicker   — marquee footer (hidden on mobile)
      SettingsPanel        — modal overlay with focus trap
```

### Layout

CSS grid with dynamic column template:

- **Left stage** (`minmax(0,1fr)`): ClockPanel (top ~65%) + PrayerTable (bottom ~35%)
- **Right ad rail** (`--adrail-width: 20vw`): stacked AdSlots — conditionally rendered when `showSponsors` is true and no critical signal is active
- **Footer**: full-width marquee ticker, hidden on mobile

### Prayer timing logic (`usePrayerTimes`)

- Times fetched from `https://api.aladhan.com/v1/timings/{date}` using coordinates and `calculationMethod` from config.
- Cached data is read in a **lazy `useState` initializer** to avoid loading flashes.
- Iqamah = Adhan + `iqamahOffsets[prayerName]` minutes.
- `activePrayerIndex`: normally the _next_ prayer; switches to the _current_ prayer while the window between Adhan and Iqamah is open.
- **Critical signal**: 60-second window after Adhan/Iqamah time triggers `adhan-now` or `iqamah-now` status type and full-screen alert.
- **Shuruq** is a special case: `adhan` and `iqamah` are `null`; only `time` is set.

## Project Structure

```
src/
├── utils/            — Pure utility functions (no React dependencies)
│   ├── cn.ts         — Classname joiner (filters falsy values)
│   └── time.ts       — Time formatting (formatDisplayTime, parseTime, addMinutes, formatRemaining)
├── hooks/            — Custom React hooks
│   ├── useClock.ts
│   ├── useDominantColor.ts
│   ├── useFocusTrap.ts   — Focus trap for modal accessibility
│   ├── useMosqueConfig.ts
│   ├── usePrayerTimes.ts
│   └── usePromoTimer.ts  — Promo rotation lifecycle (extracted from PromoRail)
├── components/       — UI components
├── context/          — React context providers
├── translations/     — i18n locale files
├── types/            — TypeScript type definitions
└── __tests__/        — Vitest test files
```

## Code Patterns & Best Practices

### Classname composition

Use `cn()` from `src/utils/cn.ts` for conditional class joining:

```tsx
import { cn } from "../utils/cn";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "large" ? "text-lg" : "text-sm",
)} />
```

Never use manual string concatenation (`+`) or template literals for conditional classes.

### Time formatting

All time display logic uses shared utilities from `src/utils/time.ts`:

```tsx
import { formatDisplayTime } from "../utils/time";

const { time, ampm } = formatDisplayTime("14:30", settings.timeFormat);
```

Never define local `formatDisplayTime`, `parseTime`, or `addMinutes` — always import from utils.

### Hook extraction

When a component's `useEffect` exceeds ~20 lines or manages multiple timers, extract it into a custom hook:
- `usePromoTimer` — manages promo rotation lifecycle
- `useFocusTrap` — traps Tab/Shift+Tab in modals
- `useDominantColor` — extracts dominant color from loaded images

### State initialization from cache

Prefer **lazy `useState` initializers** over reading localStorage in `useEffect`:

```tsx
// ✅ Good — no loading flash, no lint warnings
const [state, setState] = useState(() => {
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : defaultValue;
});

// ❌ Bad — causes extra render, lint warnings about setState in effects
useEffect(() => {
  const cached = localStorage.getItem(key);
  if (cached) setState(JSON.parse(cached));
}, []);
```

### Component guidelines

- Keep components focused: one concern per file.
- Extract sub-components when JSX is duplicated (e.g., `TimeCellContent`).
- Prefer named exports over default exports (except `App`).
- Never use `dangerouslySetInnerHTML` — render safe React elements instead.
- Use `aria-hidden="true"` on decorative icons and dividers.

## Tailwind CSS v4 Setup

This project uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. Key differences from v3:

- **No `postcss.config.js` needed** — the Vite plugin handles everything.
- **`@import "tailwindcss"`** in `src/index.css` (not `@tailwind` directives).
- **`tailwind.config.ts`** still exists for extended tokens (screens, colors, spacing, fonts) — this is a legacy compatibility path. Custom theme tokens also live in CSS variables in `src/index.css`.
- Use modern Tailwind v4 shorthand when available:
  - `w-(--custom-var)` not `w-[var(--custom-var)]`
  - `duration-2000` not `duration-[2000ms]`
  - `z-100` not `z-[100]`


## Design System

### Theming

The app supports dark and light themes via CSS custom properties and the `.dark`/`.light` class on the root wrapper. All color values reference CSS variables (`var(--primary)`, `var(--surface-panel)`, etc.) defined in `src/index.css`.

**Colors** follow Material Design 3 naming:

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--primary` | `#e9c176` (gold) | `#b87a00` | Active prayer, clock, emphasis |
| `--surface-panel` | `#111A35` | `#ebeff4` | Card/panel background |
| `--background-deep` | `#060A1A` | `#d5dce4` | Page background |
| `--on-surface` | `#ffffff` | `#0f1724` | Primary text |
| `--text-muted` | `rgba(255,255,255,0.6)` | `rgba(15,23,36,0.82)` | Secondary text |

### Typography — dual-font strategy

- `font-clock-display` / `font-headline-lg` / `font-headline-md` → **Inter** (sans-serif)
- `font-body-md` / `font-body-lg` / `font-label-caps` / `font-tabular-nums` → **Inter** (sans-serif)

Always use `font-tabular-nums` for Adhan/Iqamah time values to keep columns aligned.

### Spacing tokens

Non-standard Tailwind values: `p-panel-padding`, `p-margin-page`, `gap-gutter-grid`, `gap-stage-gap`. These use `clamp()` for fluid scaling between mobile and TV sizes.

### Custom CSS classes (defined in `src/index.css`)

| Class | Purpose |
|-------|---------|
| `.ghost-border` | 1px semi-transparent border; used on inactive cards/panels |
| `.active-glow` | Inset gold box-shadow + primary border; active prayer card and clock panel |
| `.status-pill` | Rounded status message container with glow |
| `.focus-ring` | Visible focus indicator (`outline: 2px solid var(--primary)`) |
| `.prayer-card` | Container-query-aware card layout (row on mobile, column on desktop) |

## Prayer Card States

- **Inactive:** `bg-surface-panel ghost-border rounded-xl`
- **Active/Next:** `active-glow dark-active` with `aria-current="true"` — text in `text-primary`
- **Shuruq:** single TIME row (no Adhan/Iqamah split)

## Accessibility (WCAG 2.2 AA)

This project follows WCAG 2.2 AA guidelines. Key requirements:

### Landmarks & Structure
- `<main>` wraps the primary content grid.
- `<aside aria-label="...">` for AdRail and PromoRail.
- `<footer aria-label="...">` for the announcement ticker.
- Skip link as first focusable element: `<a href="#prayer-times">Skip to prayer times</a>`.
- Heading hierarchy: single `<h1>` (mosque name), `<h2>` for sections.

### Focus Management
- **Settings modal** uses `useFocusTrap` to trap Tab/Shift+Tab within the dialog.
- Focus is saved before opening and restored to the trigger on close.
- Escape key dismisses the modal.
- All interactive elements have visible `:focus-visible` styles via `.focus-ring`.

### ARIA Patterns
- Timer display: `role="timer"` with `aria-label` for the composed time string.
- Status messages: `role="status"` with `aria-live="polite"` and `aria-atomic="true"`.
- Critical alerts: `role="alert"` with `aria-live="assertive"`.
- Settings pill groups: `role="radiogroup"` with `role="radio"` + `aria-checked` on each option.
- Toggle switches: `role="switch"` with `aria-checked`.
- `lang="ar"` on Arabic text spans.
- `lang` attribute on root wrapper matches active language setting.

### Motion & Animation
- All animations respect `prefers-reduced-motion: reduce` (defined in CSS).
- Use `motion-safe:animate-pulse` for conditional pulse animations.

### Icons
- Decorative icons: `aria-hidden="true"`.
- Icon-only buttons: require `aria-label`.

### Do NOT
- Use `dangerouslySetInnerHTML` (XSS risk, no ARIA control).
- Place `aria-hidden="true"` on focusable elements.
- Use `tabindex` values greater than 0.
- Remove focus outlines without providing a `:focus-visible` replacement.
- Use color alone to convey information.

## Icons

Uses **Material Symbols Outlined** via Google Fonts. Render as:

```tsx
<span className="material-symbols-outlined" aria-hidden="true">icon_name</span>
```

Icon names are text content, not imports. Use class `filled` for filled style.

## i18n

Languages: `"en"` and `"fr"`. Translation objects live in `src/translations/{en,fr}.ts` and are re-exported from `src/i18n.ts`.

```tsx
import { useT } from "../i18n";
const t = useT(settings.language);
```

Status message strings are functions: `statusIqamah(name, remaining)` and `statusNext(name, remaining)`. Add keys to **both** locale files when extending.

## Footer Marquee

Defined via `@keyframes marquee` in `src/index.css`, applied with utility class `.animate-marquee`. The `AnnouncementTicker` component duplicates items for seamless looping and renders each announcement as a safe React component (no `innerHTML`).

## Testing

Tests use **Vitest** + **@testing-library/react**. Run with `npm test` (watch mode) or `npm test -- --run` (single pass).

- Test files live in `src/__tests__/`.
- Setup file: `src/test/setup.ts`.
- Environment: jsdom.

## Adding New Features — Checklist

1. **Types** — Define new interfaces/types in `src/types/index.ts`.
2. **Translations** — Add keys to both `src/translations/en.ts` and `src/translations/fr.ts`.
3. **Utilities** — Pure logic goes in `src/utils/`. No React dependencies.
4. **Hooks** — Stateful/effect logic goes in `src/hooks/`. Keep hooks focused.
5. **Components** — Use `cn()` for classnames, provide ARIA attributes, respect landmarks.
6. **Accessibility** — Add `aria-label`, `role`, `aria-live` as appropriate. Test with keyboard.
7. **Motion** — Gate non-essential animations behind `motion-safe:` or `prefers-reduced-motion`.
8. **Theme** — Use CSS variables, not hardcoded colors. Test both dark and light.
9. **Responsive** — Test at 320px (mobile), 768px (tablet), and 1920px (TV).
10. **Validate** — Run `npm run build && npm test -- --run && npm run lint`.
