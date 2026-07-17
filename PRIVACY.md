# Privacy Policy

**Last Updated: July 16, 2026**

## About this document

Divine Display is open-source software (licensed under the [Mozilla Public License 2.0](LICENSE)): a prayer-time display screen (this repository, [`divine-display`](https://github.com/As-Salam-Mosque/divine-display)) paired with a configuration API (`divine-display-backend`) that mosques and Islamic centers self-host or subscribe to in order to manage their own display.

This Privacy Policy covers this specific hosted instance of Divine Display — the website you are currently on, where mosques can register for a display and businesses can become sponsors. If you deploy your own separate instance, update the identifying details throughout this document (and the placeholders still marked `[BRACKETED]`) to match your own deployment before publishing it.

Throughout this document, "we," "our," and "us" refer to **Divine Display**, and "the Service" refers to this website, the prayer-time display it produces, and its administration dashboard.

## Scope

The Service has two audiences with very different data footprints:

1. **Viewers** — people who look at the prayer-time display (e.g. on a screen in a mosque). Viewers do not log in, are not tracked, and are not asked to provide any personal data.
2. **Mosque administrators** — the person or team who registers an account with the backend API to configure a display (mosque details, sponsors, announcements, etc.).

This policy explains what data is collected from each audience, why, and how it is stored.

## Information We Collect

### From viewers of the display

We do not collect personal data from people who simply view the prayer-time display. The display shows publicly-relevant information (prayer times, mosque name, sponsor/ad content, announcements) and does not use tracking cookies, analytics scripts, or visitor identifiers.

The only data stored on the display device itself is kept in the browser's `localStorage` and never leaves the device:

- **Display preferences**: language (English/French), 12/24-hour time format, theme (dark/light), and whether the sponsor rail is shown.
- **Cached prayer times**: the most recent response from the prayer-time calculation API, cached to avoid a loading flash and reduce API calls.

### From mosque administrators

When an administrator registers and manages a mosque's configuration, we collect:

- **Account credentials**: a `slug` (short identifier for the mosque, e.g. used in the display URL) and a password. Passwords are never stored in plain text — see [Data Storage and Security](#data-storage-and-security).
- **Mosque configuration data**, entered voluntarily to populate the public display, which may include:
  - Mosque name, city, physical address, public website, capacity, and opening hours
  - A public contact email and phone number for the mosque
  - Geographic coordinates (latitude/longitude), used to calculate prayer times
  - Prayer calculation method and iqamah offsets
  - Logo image, sponsor/advertisement assets (images and links), and ad-rail slot configuration
  - Announcement text (English/French) and promo rotation timing

This configuration data describes the **mosque as an organization**, not the administrator as an individual. If an administrator includes personal contact details (e.g. a personal phone number) in these fields, that information is treated as part of the mosque's public configuration and will be displayed and/or served by the API to the frontend.

- **Session data**: when an administrator logs in, we issue a random session token. Only a SHA-256 hash of that token is stored server-side; the plaintext token is kept in the administrator's browser `localStorage` on their own device so the dashboard can stay signed in.

### From business partners

If you contact us to sponsor a mosque's display (e.g. via the partnership inquiry link on this website), we collect whatever information you volunteer in that inquiry (name, business, email, and message content). We use it only to evaluate and coordinate a potential sponsorship.

We do not collect billing information, payment details, or government-issued identifiers. The Service itself has no monetary transactions.

## How We Use Information

| Purpose | Data Used |
|---|---|
| Render the public prayer-time display | Mosque configuration data (name, times, sponsors, announcements) |
| Authenticate administrators and protect configuration changes | Slug, hashed password, session token |
| Calculate accurate prayer times | Latitude/longitude, calculation method |
| Remember a viewer's display preferences across visits | Locally-stored settings (never transmitted to us) |
| Reduce redundant API calls to the prayer-times provider | Locally-cached prayer times (never transmitted to us) |
| Evaluate and coordinate business sponsorships | Information volunteered in a partnership inquiry |

## Cookies and Local Storage

The Service does **not** use tracking cookies. It uses the browser's `localStorage` API for two purposes only:

- Persisting a viewer's display preferences (`divine-display-settings`)
- Persisting an administrator's session token and slug on the device used to manage the dashboard (`divine-display-auth`)

Both are stored only on the end user's own device and are never sent to any analytics or advertising service. Clearing your browser storage removes this data.

Fonts loaded from Google Fonts (see below) may set a session-level connection with Google's servers to serve font files; as of this writing we use Google Fonts' standard hosting, which does not use tracking cookies, but Google may still log IP addresses as part of normal web server operation.

## Third-Party Services

We rely on the following third-party services to operate the Service:

| Service | Purpose | Data Shared |
|---|---|---|
| [AlAdhan API](https://aladhan.com/prayer-times-api) | Calculates daily prayer times | Mosque's latitude/longitude and calculation method (no personal or viewer data) |
| Google Fonts | Serves the Inter and Material Symbols fonts used in the UI | Visitor IP address (per Google's standard web serving; see [Google's Privacy Policy](https://policies.google.com/privacy)) |
| GitHub | Hosts the open-source source code, and receives any issues you file publicly | Whatever you choose to include in an issue or pull request |
| [HOSTING PROVIDER, e.g. Railway, Render, a VPS] | Hosts the backend API and database | All data described in this policy, at rest |
| [IMAGE HOST, if logos/sponsor images are hosted externally] | Serves logo and sponsor images referenced by URL in the configuration | Visitor IP address when images are requested |

Each third-party service has its own privacy policy governing how it handles data. We do not use analytics, advertising trackers, or social media pixels.

## Data Storage and Security

- **Passwords** are hashed using PBKDF2-HMAC-SHA256 with a random 16-byte salt and 210,000 iterations before being stored. We never store or log plaintext passwords.
- **Session tokens** are cryptographically random and stored server-side only as a SHA-256 hash. Sessions expire automatically after 7 days.
- **Configuration data** is stored as structured data in our database, hosted at **[HOSTING PROVIDER / REGION]**.
- We recommend administrators access the dashboard over HTTPS/TLS; production deployments should always be served over TLS.
- Only the authenticated mosque administrator (via a valid bearer session token) can update that mosque's password or configuration. Reading a mosque's public configuration (for display purposes) does not require authentication, by design — it is meant to be shown publicly.

## Data Sharing

We do not sell any data. We may share data only:

- **As part of normal Service operation**: a mosque's configuration is served to anyone who loads the public display for that mosque — this is the intended purpose of the field.
- **With infrastructure providers**: hosting and database providers that store data on our behalf, strictly to operate the Service.
- **For legal compliance**: if required by law, subpoena, or valid legal process.
- **During a business or project transfer**: if the Service or its assets are transferred, administrators will be notified in advance where feasible.

## Data Retention

| Data Type | Retention Period |
|---|---|
| Mosque account and configuration | Until the administrator requests deletion, or the account is removed by us |
| Session tokens | Until expiry (7 days) or logout, whichever is first |
| Locally-cached prayer times / display preferences | Until the viewer/administrator clears their browser storage |
| Business partnership inquiries | Until the inquiry is resolved, then deleted or anonymized within a reasonable period |

To request deletion of a mosque account and its configuration, contact us using the details below.

## Your Rights

Depending on your jurisdiction, you may have the right to:

- **Access** the configuration data associated with your mosque account
- **Correct** inaccurate configuration data (directly, via the dashboard)
- **Delete** your mosque account and its configuration
- **Export** your configuration in a machine-readable format (the same JSON structure accepted by the API)

To exercise these rights, contact **divine-display@snake.mozmail.com**.

### If applicable: GDPR / CCPA

If you or your organization are located in the EEA/UK or California, and applicable privacy law grants you additional rights (such as the right to lodge a complaint with a supervisory authority, or the right to opt out of the sale of personal information — which we do not engage in), contact **divine-display@snake.mozmail.com**.

## International Data Transfers

If you access the Service from outside **[COUNTRY/REGION where the backend is hosted]**, your configuration data may be transferred to and stored in that country. By using the Service, you consent to this transfer.

## Children's Privacy

The Service is not directed at children and is not designed to collect personal data from children. The public display shows only prayer times and mosque-provided content; the administration dashboard is intended for adult mosque staff or volunteers.

## Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last Updated" date above. Continued use of the Service after changes take effect constitutes acceptance of the revised policy.

## Contact

For privacy-related inquiries about this Divine Display instance:

- **Email**: [divine-display@snake.mozmail.com](mailto:divine-display@snake.mozmail.com)
- **GitHub**: [As-Salam-Mosque/divine-display](https://github.com/As-Salam-Mosque/divine-display)
- **Report an issue**: [GitHub Issues](https://github.com/As-Salam-Mosque/divine-display/issues)
