# Contributing & Developer Guide

This document contains developer-facing instructions for running, building, linting, testing, and extending Divine Display. It also explains the runtime data flow, configuration, and debugging tips.

## Development

Start the development server with HMR and open the local address printed by Vite:

```bash
npm run dev
# then open http://localhost:5173 (or the URL Vite prints)
```

## Build & preview

Type-check and build production assets, then preview the production build locally:

```bash
npm run build
npm run preview
```

## Linting

Run the project's ESLint configuration:

```bash
npm run lint
```

The repository includes a suggested type-checked ESLint configuration. See `./.eslintrc` or `eslint.config.js` for details.

## Configuration (single entry point)

Edit `mosque.config.ts` to adjust runtime behavior. The exported `MosqueConfig` controls:

- `coordinates` (latitude, longitude)
- `calculationMethod` for AlAdhan
- `iqamahOffsets` (minutes per prayer)
- `adSlots` (images / links for the ad rail)
- `announcements` for the marquee
- `mosque` metadata (name, city)

## Runtime data flow

- `usePrayerTimes(config)`
  - Fetches `https://api.aladhan.com/v1/timings/{date}` using values from `mosque.config.ts`.
  - Caches the day's timings to `localStorage` (one entry per date).
  - Derives `activePrayerIndex` and `nextPrayerIndex` and computes a status string every second.
  - Handles the special `Shuruq` case where `adhan` and `iqamah` are `null`.

- `useClock(language)`
  - Generates locale-aware date and time strings on a 1s interval, including Hijri date rendering.

## Settings & persistence

`SettingsContext` (`src/context/SettingsContext.tsx`) persists user preferences to `localStorage` under the key `divine-display-settings`. The settings include:

- `language` (`en` or `fr`)
- `timeFormat` (12/24)
- `showSponsors` (boolean)
- Optional overrides for `mosque` metadata

## Component overview

- `App` — top-level application wrapper; provides `SettingsProvider`.
- `Display` — main screen layout (left stage + right ad rail + footer marquee).
- `ClockPanel` — large time, Hijri date, status message, settings gear.
- `PrayerTable` — renders six `PrayerCard` components.
- `PrayerCard` — single prayer UI; supports active/next/inactive states and the `Shuruq` special presentation.
- `AdRail` — stacked ad slots; hidden when `showSponsors` is `false`.
- `AnnouncementTicker` — footer marquee (see CSS animation `@keyframes marquee`).
- `SettingsPanel` — modal overlay to update settings.

## Design system & styling

- Tokens are defined in `tailwind.config.ts` and mirrored in `references/DESIGN.md`.
- Colors follow Material Design 3 naming (primary = `#e9c176`).
- Typography: Playfair Display for clock/headlines; Montserrat for body and tabular numeric times.
- Custom classes in `src/index.css`:
  - `.ghost-border` — 1px semi-transparent gold border for inactive panels.
  - `.active-glow` — inset gold box-shadow for the active prayer card and clock panel.

## Prayer card states

- Inactive: `bg-surface-panel ghost-border rounded-xl`
- Active/Next: `bg-primary/10 border-2 border-primary rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]` (includes pulsing dot and `text-primary`)
- `Shuruq`: renders a single time row (no Adhan/Iqamah split)

## Icons

Uses Material Symbols Outlined via Google Fonts. Render icons as:

```html
<span class="material-symbols-outlined">icon_name</span>
```

Use `font-variation-settings: 'FILL' 1` for the filled style when needed.

## i18n

- Supported languages: `en`, `fr`.
- Translation objects: `src/translations/en.ts`, `src/translations/fr.ts` (re-exported from `src/i18n.ts`).
- Status message functions: `statusIqamah(name, remaining)` and `statusNext(name, remaining)` — update both locale files when adding keys.

## How times are calculated

- The app calls the AlAdhan timings endpoint with the configured `calculationMethod` and coordinates.
- Iqamah is computed as `iqamah = adhan + iqamahOffsets[prayerName]`.
- The active prayer is normally the next prayer; it switches to the current prayer during the Adhan→Iqamah window (the Iqamah countdown is live).

## Testing & manual verification

There is no formal unit test suite. To verify behavior locally:

1. Start the dev server: `npm run dev`.
2. Open the app and confirm the clock updates every second and the Hijri date displays.
3. Modify `mosque.config.ts` to different coordinates and confirm prayer times change accordingly.
4. Toggle `showSponsors` in Settings and confirm the ad rail collapses/expands.
5. To exercise Iqamah transitions, set `iqamahOffsets` to short values (1–2 minutes) and reload.
6. Inspect `localStorage` for `divine-display-settings` and the prayer times cache entry for today.

## Debugging tips

- If times are incorrect, verify `mosque.config.ts` coordinates and `calculationMethod`.
- Inspect network requests to `https://api.aladhan.com/v1/timings/{date}` in browser DevTools.
- Clear the prayer times cache in `localStorage` if stale data is present.

## Extending the app

- Add languages by adding files under `src/translations` and updating `src/i18n.ts`.
- Add design tokens in `tailwind.config.ts` and mirror them in `references/DESIGN.md`.
- Add ad slot images via the `adSlots` property in `mosque.config.ts`.

## Contribution process

- Fork the repository and create a branch for your work.
- Keep UI and token changes consistent with `references/DESIGN.md` and `tailwind.config.ts`.
- Run `npm run lint` before submitting a PR.

## License

Add a `LICENSE` file if you intend to open source the project.

## Contact / source

- For configuration changes, edit `mosque.config.ts`.
- For development changes, edit components under `src/` and run `npm run dev` to iterate with HMR.

Thank you for contributing to Divine Display.
