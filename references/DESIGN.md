---
name: Noor Majesty
themes:
  dark:
    primary: "#e9c176"
    primary-rgb: "233, 193, 118"
    background-deep: "#060a1a"
    surface-panel: "#111a35"
    surface: "#0b1220"
    surface-container: "#081028"
    surface-container-low: "#071022"
    on-surface: "#ffffff"
    on-surface-variant: "#dfe6ff"
    text-muted: "rgba(255,255,255,0.6)"
    outline-variant: "rgba(233,193,118,0.08)"
    ghost-border-color: "rgba(233,193,118,0.2)"
  light:
    primary: "#b87a00"
    primary-rgb: "184, 122, 0"
    background-deep: "#d5dce4"
    surface-panel: "#ebeff4"
    surface: "#f5f7fa"
    surface-container: "#edf1f5"
    surface-container-low: "#f3f6f9"
    on-surface: "#0f1724"
    on-surface-variant: "#1f2b3d"
    text-muted: "rgba(15,23,36,0.82)"
    outline-variant: "rgba(15,23,36,0.3)"
    ghost-border-color: "rgba(15,23,36,0.34)"
colors:
  surface: "#16130e"
  surface-container-low: "#1e1b16"
  surface-container: "#231f1a"
  on-surface: "#e9e1d8"
  on-surface-variant: "#d1c5b4"
  outline-variant: "#4e4639"
  primary: "#e9c176"
  background-deep: "#060A1A"
  surface-panel: "#111A35"
  text-muted: "#8E9BB1"
typography:
  # All font utility classes (font-clock-display, font-headline-*, font-body-*, etc.)
  # resolve to Inter at runtime via CSS variable override in index.css.
  # The semantic font class names are preserved for structural meaning.
  font-family: Inter
  clock-display:

  headline-lg:
    fontFamily: Inter
    fontSize: "clamp(1.5rem, 2.2vw, 3rem)"
    fontWeight: "600"
    lineHeight: "clamp(1.75rem, 2.8vw, 3.5rem)"
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Inter
    fontSize: "clamp(1.25rem, 1.6vw, 2rem)"
    fontWeight: "600"
    lineHeight: "clamp(1.5rem, 2.2vw, 2.5rem)"
  body-lg:
    fontFamily: Inter
    fontSize: "clamp(1rem, 1.6vw, 1.5rem)"
    fontWeight: "500"
    lineHeight: "clamp(1.25rem, 2vw, 2rem)"
  body-md:
    fontFamily: Inter
    fontSize: "clamp(0.875rem, 1.2vw, 1.125rem)"
    fontWeight: "400"
    lineHeight: "clamp(1rem, 1.6vw, 1.5rem)"
  label-caps:
    fontFamily: Inter
    fontSize: "clamp(0.75rem, 1vw, 0.875rem)"
    fontWeight: "700"
    lineHeight: "1.25rem"
    letterSpacing: 0.15em
  tabular-nums:
    fontFamily: Inter
    fontSize: "clamp(1rem, 1.2vw, 1.25rem)"
    fontWeight: "600"
    lineHeight: "1.5rem"

rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  # All spacing tokens use fluid clamp() values for viewport-responsive scaling
  base: "clamp(0.5rem, 0.8vw, 0.75rem)"
  margin-page: "clamp(1rem, 3vw, 4rem)"
  gutter-grid: "clamp(0.5rem, 1.5vw, 2rem)"
  panel-padding: "clamp(1rem, 2vw, 2.5rem)"
  stage-gap: "clamp(1.5rem, 4vw, 6rem)"
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
  tv: 1920px
---

## Brand & Style

The design system is crafted for sacred spaces, prioritizing tranquility, reverence, and absolute legibility. It centers on a **Corporate / Modern** framework infused with **Minimalist** discipline, ensuring that functional data (prayer times) feels like a natural extension of the mosque's architecture.

The personality is authoritative yet welcoming. The UI avoids unnecessary ornamentation, relying instead on high-contrast typography and a structured grid to create a sense of order and calm. The emotional response should be one of spiritual focus, where the "now" (current time) is the anchor, and the "next" (upcoming prayer) is clearly illuminated.

The system supports both **dark** and **light** themes. The dark theme remains the primary experience (deep navy + gold), while the light theme inverts to a high-contrast slate-grey + amber palette suitable for well-lit environments.

## Colors

Colors are resolved at runtime via CSS custom properties (`--primary`, `--background-deep`, `--surface-panel`, etc.) so that both themes share the same component markup. The Tailwind `colors` palette in the YAML above provides the static token set; the `themes` section documents the actual runtime values per theme.

- **Primary (Gold / Amber):** Essential highlights, active prayer states, the clock, and all interactive affordances. Dark theme: `#e9c176`. Light theme: `#b87a00`.
- **Background Deep:** The outermost page background. Dark: `#060A1A`. Light: `#d5dce4`.
- **Surface Panel:** Card and panel fills. Dark: `#111A35`. Light: `#ebeff4`.
- **Ghost Border:** 1px semi-transparent primary border on inactive panels — defined by `--ghost-border-color`. Creates architectural depth without visual noise.
- **Text Muted:** Secondary label color — 60% white in dark, ~82% black in light.

The palette is designed so the primary color guides the eye to the most critical information first, regardless of theme.

## Typography

All text is rendered in **Inter** — a single geometric sans-serif family optimized for screen legibility across all sizes and weights. The semantic class names (`font-clock-display`, `font-headline-md`, `font-body-md`, etc.) are mapped to Inter via CSS variable override in `index.css`.

**Font scales are fluid**, using `clamp()` values to scale continuously from mobile to 4K TV without breakpoint jumps. See the `typography` section of the YAML for exact ranges.



**Arabic Prayer Names:** rendered with `lang="ar"` on the containing element. Arabic text is displayed in the browser's default Arabic fallback (system Naskh) and hidden below 40% viewport height to avoid crowding on small displays.

**Tabular numerals:** `font-tabular-nums` enables `font-feature-settings: "tnum" 1, "lnum" 1` to keep time columns aligned across rows regardless of digit width.

## Layout & Spacing

All spacing tokens use **fluid `clamp()` values** that scale proportionally with the viewport — no hard breakpoint jumps.

The main layout is a **CSS grid with two columns** on `lg`+:

```
[ Left Stage: minmax(0, 1fr) ] [ Ad Rail: --adrail-width ]
```

`--adrail-width` is `20vw` when sponsors are enabled and there is no critical signal, or `0px` otherwise (the rail collapses without reflow).

### Left Stage breakdown

The left stage is a flex column split into two height regions:

- **Top ~65% — ClockPanel:** Contains mosque branding, live clock, Hijri date, countdown status, and optional PromoRail overlay.
- **Bottom ~35% — PrayerTable:** Horizontal row of 6 PrayerCards.

### Critical Signal Mode

When `statusType` is `"adhan-now"` or `"iqamah-now"`, the entire layout switches to an **immersive alert state**:

- The ClockPanel fills its container with a full-height announcement showing the prayer signal and status message at headline scale.
- The ad rail is hidden (width collapses to `0px`).
- The panel gains a 2px `border-primary` border and a `0 0 45px rgba(primary, 0.6)` outer glow.
- An `role="alert"` + `aria-live="assertive"` region ensures screen readers announce the prayer call immediately.

### Breakpoints

| Token | Width   | Notes                                         |
|-------|---------|-----------------------------------------------|
| `sm`  | 640px   | Prayer card switches to compact row layout    |
| `md`  | 768px   | Prayer card switches to vertical column layout; ticker visible |
| `lg`  | 1024px  | Ad rail appears; layout locks to `h-screen`   |
| `xl`  | 1280px  | Larger padding and font steps                 |
| `tv`  | 1920px  | Full-scale token values; maximum panel padding |

- **Mobile/Tablet (< `lg`):** Single-column layout; ad rail hidden; prayer cards in compact horizontal layout; footer ticker hidden below `md`.
- **Desktop (`lg`+):** Two-column grid, full PromoRail cycling, ticker visible.
- **TV (`tv`):** All tokens at maximum size; ad rail and ticker fully visible.

## Elevation & Depth

**Tonal layers** rather than heavy shadows:

- **Background:** `--background-deep` (deepest layer — page fill).
- **Panels/Cards:** `--surface-panel` with `.ghost-border` (1px `--ghost-border-color` + optional panel-separation inset shadow in light mode). Defines space without visual noise.
- **Active / Next Prayer:** `.active-glow` — `inset 0 0 20px rgba(primary, activeGlowAlpha)` + solid `border-primary`. In dark theme, active cards additionally use `.dark-active`, which replaces the fill with `--background-deep` and applies a `0 0 45px rgba(primary, 0.6)` outer glow, mirroring the critical signal appearance.
- **Ad Rail:** Sits at the same `--surface-panel` depth as panels but is visually separated by the grid gap.
- **Clock Panel:** Always uses `.active-glow` in normal mode (gold inset glow + ghost border), signaling that it is the permanent focus anchor.

## Shapes

**Soft (0.25rem default)**. Rounded corners prevent the interface from feeling sharp.

- **Prayer Cards / Ad Slots / Clock Panel:** `rounded-xl` (0.75rem).
- **Status Pills:** Pill-shaped (`rounded-full`) for urgency indicators.
- **Settings Button:** `rounded-full` floating gear icon.

## Components

### Clock Panel

The dominant component. Displays mosque branding (mosque icon + name + city), the live time in `font-clock-display`, Hijri date + Gregorian date, and the countdown status pill. A decorative mosque silhouette SVG is rendered at 10% opacity behind the content. In critical signal mode the entire panel is replaced by a full-height immersive alert (pulsing campaign icon + message text).

### PromoRail

An overlay that slides in from the right edge of the ClockPanel on a configurable timer cycle. Shows a weighted-random sponsor image from `sponsors`, with the background tinted to the image's edge colour so the frame blends into the artwork (extracted via `useDominantColor`). Automatically suppressed in critical signal mode or when `showSponsors` is false. Controlled by `PromoRail.tsx` and coordinated with `ClockPanel` via an `onActiveChange` callback.

### Prayer Table

A horizontal row of six `PrayerCard` components. Cards use **CSS container queries** to switch between two layouts:

- **Compact (< 768px):** Horizontal row — prayer name on the left, divider, Adhan/Iqamah times to the right.
- **Normal (≥ 768px):** Vertical column — prayer name on top, horizontal divider, time cells below.

Each card shows Prayer Name (Latin caps) and Arabic name below it, separated from time cells by a primary-tinted divider. **Shuruq** is a special case: only a single TIME row is shown (no Adhan/Iqamah split).

### Prayer Card States

| State      | Appearance |
|------------|------------|
| **Inactive** | `bg-surface-panel ghost-border rounded-xl` |
| **Active / Next** | `ghost-border active-glow` + in dark theme: `.dark-active` (`bg-background-deep`, 2px `border-primary`, outer glow `0 0 45px rgba(primary, 0.6)`) |

### Ad Rail

Visible only at `lg`+ breakpoint. A vertical flex column labelled "COMMUNITY SPONSORS" in `font-label-caps`. Each slot renders a sponsor image (with a background blended from the image's edge colour) or a placeholder (storefront icon + "Available" label). Rail width is `20vw`; collapses to `0px` when sponsors are hidden or during critical signal mode.

### Announcements Ticker

Full-width footer strip, hidden below `md`. Announces labelled as `masjidAnnouncements`. Items scroll right-to-left via `@keyframes marquee` (60s linear loop) with `prefers-reduced-motion` disabling the animation. Announcement text before ` — ` is bolded in `text-on-surface`; the rest renders in `text-muted`. Strip height scales from `3rem` (mobile) to `5rem` (TV).

### Status Indicators

The `.status-pill` helper class provides a gold-tinted background, border, and outer glow for the status chip in ClockPanel. In critical signal mode the status message replaces the pill entirely and is rendered at headline scale with `role="alert"`.

### Settings Button

A floating gear icon (`material-symbols-outlined: settings`) anchored to the top-right of ClockPanel. Uses `rounded-full` with `focus-visible` ring and hover/focus state that highlights in primary gold.
