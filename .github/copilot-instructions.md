# Copilot Instructions

## Project Overview

**Divine Display** is a single-file mosque prayer times display screen (`code.html`) designed for large-format 16:9 displays (TVs/monitors) in mosques. It is a static HTML prototype — there is no build system, bundler, package manager, or test suite.

## Architecture

The entire UI lives in `code.html`:
- **Tailwind CSS** is loaded via CDN (`https://cdn.tailwindcss.com?plugins=forms,container-queries`)
- The Tailwind theme is configured inline in `<script id="tailwind-config">` — this is the source of truth for design tokens in code
- **`DESIGN.md`** is the human-readable design spec (YAML frontmatter + prose). When adding new tokens or components, keep `DESIGN.md` and the Tailwind config in sync

## Layout Structure

The page uses a **12-column CSS grid**:
- **Left stage (col-span-9):** Clock panel (top) + Prayer Table (bottom)
- **Right ad rail (col-span-3):** Stacked sponsor/ad slots
- **Footer:** Full-width marquee announcement ticker

On mobile/tablet the ad rail drops below the prayer table; the clock scales to 50%.

## Design System

All colors, typography, and spacing come from the design tokens defined in both `DESIGN.md` and the inline Tailwind config.

**Colors** follow Material Design 3 naming (`surface`, `on-surface`, `primary`, `secondary`, `surface-panel`, etc.):
- `primary` (#e9c176) — gold, used for active prayer state, clock, and emphasis
- `surface-panel` (#111A35) — card/panel background
- `background-deep` (#060A1A) — deepest background layer

**Typography** uses a dual-font strategy:
- `font-clock-display` / `font-headline-lg` / `font-headline-md` → **Playfair Display** (serif, for clock and prayer headers)
- `font-body-md` / `font-body-lg` / `font-label-caps` / `font-tabular-nums` → **Montserrat** (sans-serif, for data and labels)

Use `font-tabular-nums` for Adhan/Iqamah times to ensure column alignment.

**Spacing tokens** (not standard Tailwind values): `p-panel-padding`, `p-margin-page`, `gap-gutter-grid`, `gap-stage-gap`.

## Custom CSS Classes

Defined in a `<style>` block in `<head>`:
- `.ghost-border` — 1px border at `rgba(197, 160, 89, 0.2)`, used on all inactive cards/panels
- `.active-glow` — inset gold box-shadow + solid `#c5a059` border, used on the current/next prayer card and the clock panel

## Prayer Card States

- **Default (inactive):** `bg-surface-panel ghost-border rounded-xl`
- **Active/Next prayer:** `bg-primary/10 border-2 border-primary rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]` with a pulsing dot indicator (`w-3 h-3 bg-primary rounded-full shadow-[0_0_5px_#c5a059]`) and all text in `text-primary`
- **Shuruq** (sunrise, no Iqamah): displays a single TIME row, not Adhan/Iqamah split

## Icons

Uses **Material Symbols Outlined** (`<span class="material-symbols-outlined">icon_name</span>`). Icon name goes as text content. Variable font settings: `font-variation-settings: 'FILL' 1` for filled style.

## Footer Marquee

Animation defined via `@keyframes marquee` (translateX 100% → -100%, 20s linear infinite) applied with Tailwind's arbitrary `animate-[marquee_20s_linear_infinite]`.

## Arabic Text

Arabic prayer name translations are displayed in `font-body-md text-sm text-text-muted` (or `text-primary/80` when active). Use a Naskh-style typeface if adding dedicated Arabic font support.
