# Copilot Instructions

## Project Overview

**Divine Display** is a mosque prayer times display screen built with **React 19 + TypeScript + Vite**, designed for large-format 16:9 displays (TVs/monitors). There is no test suite.

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # Type-check + Vite build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

### Configuration entry point

**`mosque.config.ts`** (repo root) is the primary file a mosque administrator edits. It exports a `MosqueConfig` object containing coordinates, calculation method, iqamah offsets, ad slots, and announcement strings. All runtime data flows from this file.

### Data flow

```
mosque.config.ts
  └─ usePrayerTimes(config)   — fetches AlAdhan API, caches in localStorage (one entry per day)
       └─ derives activePrayerIndex / nextPrayerIndex / statusMessage every second
  └─ useClock(language)       — 1s interval, locale-aware date/time strings
```

`SettingsContext` (`src/context/SettingsContext.tsx`) holds user-adjustable preferences (`language`, `timeFormat`, `showSponsors`, `mosque` info) persisted to `localStorage` under the key `"divine-display-settings"`.

### Component tree

```
App
  SettingsProvider
    Display
      ClockPanel       — hijri date, live countdown status message, settings gear
      PrayerTable      — renders 6 PrayerCards
        PrayerCard     — active/inactive state, Shuruq special case
      AdRail           — conditional on settings.showSponsors
      AnnouncementTicker — marquee footer (hidden on mobile)
      SettingsPanel    — modal overlay
```

### Layout

12-column CSS grid:
- **Left stage** (`col-span-9`): ClockPanel (top) + PrayerTable (bottom)
- **Right ad rail** (`col-span-3`): stacked AdSlots — hidden when `showSponsors` is false (stage expands to `col-span-12`)
- **Footer**: full-width marquee ticker, hidden on mobile

### Prayer timing logic (`usePrayerTimes`)

- Times fetched from `https://api.aladhan.com/v1/timings/{date}` using coordinates and `calculationMethod` from config.
- Iqamah = Adhan + `iqamahOffsets[prayerName]` minutes.
- `activePrayerIndex`: normally the *next* prayer; switches to the *current* prayer while the window between Adhan and Iqamah is open (i.e., the Iqamah countdown is live).
- **Shuruq** is a special case: `adhan` and `iqamah` are `null`; only `time` is set. `PrayerCard` renders a single time row instead of the Adhan/Iqamah split layout.

## Design System

All tokens are defined in **`tailwind.config.ts`** (source of truth). `references/DESIGN.md` mirrors them. Keep both in sync when adding tokens.

**Colors** follow Material Design 3 naming:
- `primary` (`#e9c176`) — gold; active prayer, clock, emphasis
- `surface-panel` (`#111A35`) — card/panel background
- `background-deep` (`#060A1A`) — page background

**Typography** — dual-font strategy:
- `font-clock-display` / `font-headline-lg` / `font-headline-md` → **Playfair Display** (serif)
- `font-body-md` / `font-body-lg` / `font-label-caps` / `font-tabular-nums` → **Montserrat** (sans-serif)

Always use `font-tabular-nums` for Adhan/Iqamah time values to keep columns aligned.

**Spacing tokens** (non-standard Tailwind values): `p-panel-padding`, `p-margin-page`, `gap-gutter-grid`, `gap-stage-gap`.

**Custom CSS classes** (defined in `src/index.css`):
- `.ghost-border` — 1px semi-transparent gold border; used on all inactive cards/panels
- `.active-glow` — inset gold box-shadow + solid `#c5a059` border; used on active prayer card and clock panel

## Prayer Card States

- **Inactive:** `bg-surface-panel ghost-border rounded-xl`
- **Active/Next:** `bg-primary/10 border-2 border-primary rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]` — includes a pulsing dot (`w-3 h-3 bg-primary rounded-full`) and all text in `text-primary`
- **Shuruq:** single TIME row (no Adhan/Iqamah split)

## Icons

Uses **Material Symbols Outlined** via Google Fonts. Render as `<span className="material-symbols-outlined">icon_name</span>`. Icon names are text content, not imports. Use `font-variation-settings: 'FILL' 1` for the filled style.

## i18n

Languages: `"en"` and `"fr"`. Translation objects live in `src/translations/{en,fr}.ts` and are re-exported from `src/i18n.ts`. Status message strings are functions: `statusIqamah(name, remaining)` and `statusNext(name, remaining)`. Add keys to both locale files when extending.

## Footer Marquee

Defined via `@keyframes marquee` (translateX 100% → −100%, 20 s linear infinite), applied with Tailwind arbitrary value `animate-[marquee_20s_linear_infinite]`.
