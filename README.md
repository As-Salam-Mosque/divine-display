# Divine Display

A large-format mosque prayer times display built with React 19, TypeScript, and Vite. Designed for 16:9 screens (TVs / monitors), the app shows the current time, Hijri date, live prayer countdowns (Adhan → Iqamah logic), a responsive prayer table, an announcement marquee, and an optional sponsor ad rail.

This README provides a short overview. Developer-facing technical details (development, build, linting, testing, architecture) are in `CONTRIBUTING.md`.

## Key ideas

- Configuration-first: `mosque.config.ts` is the single source of runtime configuration (coordinates, calculation method, iqamah offsets, ad slots, announcements, mosque metadata).
- Local caching: prayer times are fetched from the AlAdhan API and cached in `localStorage` (one entry per day).
- Large-screen UI: layout optimized for 16:9; left stage shows clock and prayer table, right rail shows ads (hidden when `showSponsors` is `false`).

## Quick links

- Configuration: `mosque.config.ts`
- Settings context / persistence: `src/context/SettingsContext.tsx`
- Prayer timings hook: `src/hooks/usePrayerTimes.ts`
- Translations: `src/translations/en.ts`, `src/translations/fr.ts` (re-exported from `src/i18n.ts`)

## Installation

1. Node.js 18+ is recommended.
2. Install dependencies:

```bash
npm ci   # use in CI
# or
npm install
```

For developer instructions (start dev server, build, lint, testing tips, architecture, and contribution workflow) see `CONTRIBUTING.md`.

## License

This repository does not include a license file by default. Add a `LICENSE` file if you intend to open source the project.
