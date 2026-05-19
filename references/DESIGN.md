---
name: Noor Majesty
colors:
  surface: '#16130e'
  surface-dim: '#16130e'
  surface-bright: '#3d3933'
  surface-container-lowest: '#110e09'
  surface-container-low: '#1e1b16'
  surface-container: '#231f1a'
  surface-container-high: '#2d2924'
  surface-container-highest: '#38342e'
  on-surface: '#e9e1d8'
  on-surface-variant: '#d1c5b4'
  inverse-surface: '#e9e1d8'
  inverse-on-surface: '#34302a'
  outline: '#9a8f80'
  outline-variant: '#4e4639'
  surface-tint: '#e9c176'
  primary: '#e9c176'
  on-primary: '#412d00'
  primary-container: '#c5a059'
  on-primary-container: '#4e3700'
  inverse-primary: '#775a19'
  secondary: '#bfc5e4'
  on-secondary: '#292f48'
  secondary-container: '#424862'
  on-secondary-container: '#b1b7d6'
  tertiary: '#b0c6f9'
  on-tertiary: '#173059'
  tertiary-container: '#8fa5d6'
  on-tertiary-container: '#233a65'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea5'
  primary-fixed-dim: '#e9c176'
  on-primary-fixed: '#261900'
  on-primary-fixed-variant: '#5d4201'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#bfc5e4'
  on-secondary-fixed: '#141a32'
  on-secondary-fixed-variant: '#3f465f'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#b0c6f9'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#304671'
  background: '#16130e'
  on-background: '#e9e1d8'
  surface-variant: '#38342e'
  background-deep: '#060A1A'
  surface-panel: '#111A35'
  accent-bronze: '#A37E3E'
  text-muted: '#8E9BB1'
  text-on-dark: '#FFFFFF'
typography:
  clock-display:
    fontFamily: Playfair Display
    fontSize: 160px
    fontWeight: '700'
    lineHeight: 160px
    letterSpacing: -0.02em
  clock-display-mobile:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '700'
    lineHeight: 80px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-lg:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-md:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.15em
  tabular-nums:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  margin-page: 48px
  gutter-grid: 24px
  panel-padding: 32px
  stage-gap: 64px
---

## Brand & Style

The design system is crafted for sacred spaces, prioritizing tranquility, reverence, and absolute legibility. It centers on a **Corporate / Modern** framework infused with **Minimalist** discipline, ensuring that functional data (prayer times) feels like a natural extension of the mosque's architecture.

The personality is authoritative yet welcoming. It balances the weight of tradition with the precision of modern technology. The UI avoids unnecessary ornamentation, relying instead on high-contrast typography and a structured grid to create a sense of order and calm. The emotional response should be one of spiritual focus, where the "now" (current time) is the anchor, and the "next" (upcoming prayer) is clearly illuminated.

## Colors

This design system utilizes a high-contrast dark mode palette to ensure maximum visibility from a distance while maintaining a low-glare presence in prayer halls.

- **Primary (Gold):** Used exclusively for essential highlights, active prayer states, and the clock. It symbolizes value and spiritual significance.
- **Secondary (Deep Navy):** The foundational layer, providing a receding, calm background that makes the gold and white text "pop" with clarity.
- **Neutral (Slate/Navy Grays):** Used for structural borders and secondary labels to prevent the interface from appearing overly "flat" while maintaining a monochromatic depth.

The palette relies on the interplay between the deep navy and gold to guide the eye toward the most critical information first.

## Typography

Typography is the primary vehicle for the "High-Contrast" requirement. It employs a dual-font strategy:

- **Playfair Display (Serif):** Reserved for the current time and primary prayer headers. It provides an elegant, traditional character that reflects the sanctity of the environment.
- **Montserrat (Sans-Serif):** Used for all data points, secondary labels, and messages. Its geometric clarity ensures that numerical data (Adhan/Iqamah times) is unambiguous at a distance.

**Arabic Support:** Use a high-quality Naskh-style typeface for Arabic text to match the stroke contrast of Playfair Display. Ensure that Arabic and Latin characters share a visual baseline and optical weight.

## Layout & Spacing

The layout uses a **Fluid Grid** model optimized for large-format displays (16:9 aspect ratio).

1.  **Main Stage (Top-Left 75%):** Contains the Mosque Name, the oversized Clock, and the Prayer Status. This area prioritizes whitespace to ensure the clock is the undisputed anchor.
2.  **Secondary Rail (Right 25%):** A dedicated vertical column for ads and announcements. It is visually separated by a subtle vertical divider or a distinct background tone.
3.  **Prayer Table (Bottom 100%):** Spans the full width (or sits below the main stage) in a horizontal grid.
4.  **Footer Strip:** A narrow, full-width band at the very bottom for persistent links or ticker-style notifications.

**Breakpoints:**
- **Desktop/TV (1080p target):** 12-column grid. The ad rail is fixed at a maximum of 400px; the clock stage expands to fill the remainder. The announcements ticker is visible.
- **Mobile/Tablet:** Single-column layout; the ad rail and announcements ticker are hidden to prioritize prayer times. The clock scales down but remains centered.

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to maintain a clean, architectural feel.

- **Background:** `#060A1A` (The deepest layer).
- **Panels/Cards:** `#111A35` with a very thin (1px) border in `#C5A059` at 20% opacity. This creates "ghost borders" that define space without adding visual noise.
- **Active State:** When a prayer is currently active or next, the panel receives a subtle interior glow or a solid `#C5A059` border to signify importance.
- **Ad Rail:** Slightly more muted than the main stage to ensure secondary content doesn't distract from the prayer times.

## Shapes

The shape language is **Soft (0.25rem)**. While the overall aesthetic is architectural and structured, slightly rounded corners prevent the UI from feeling sharp or aggressive.

- **Prayer Time Cards:** Use `rounded-lg` (0.5rem) to differentiate them as discrete interactive or data-rich elements.
- **Ad Slots:** Match the card roundedness for a unified look.
- **Status Pills:** Use pill-shaped (1rem+) for status indicators (e.g., "LIVE" or "NEXT") to distinguish them from structural panels.

## Components

### Prayer Table
The table should be a series of vertical cards. Each card contains the Prayer Name (Headline-MD), Arabic Translation (Body-MD), and two distinct rows for Adhan and Iqamah times using **Tabular Numerals** to ensure alignment.

### Main Clock
The clock is the dominant component. It should use a heavy weight of the headline font. The AM/PM indicator should be half the size of the numerals and vertically aligned to the top or center of the time string.

### Ad Rail Cards
Sponsor spaces should be clearly boxed with a label "COMMUNITY SPONSORS" in `label-caps`. If a slot is empty, it should display a subtle textured background or the mosque's logo at low opacity to maintain layout integrity.

### Announcements Ticker
The footer strip should support a horizontal scrolling or fading text component for masjid announcements. Use `body-md` for the text to ensure it is readable but not distracting.

### Status Indicators
Use the primary gold color to highlight the "Current Prayer." The active card in the prayer table should swap its background to a semi-transparent gold or gain a high-contrast border.
