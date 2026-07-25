import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        tv: "1920px",
      },
      colors: {
        surface: "#16130e",
        "surface-container": "#231f1a",
        "on-surface": "#e9e1d8",
        "on-surface-variant": "#d1c5b4",
        "outline-variant": "#4e4639",
        primary: "#e9c176",
        "background-deep": "#060A1A",
        "surface-panel": "#111A35",
        "text-muted": "#8E9BB1",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        // Page margin: scales from 1rem (mobile) up to ~4rem (large)
        "margin-page": "clamp(1rem, 3vw, 4rem)",
        // Panel padding inside cards/containers: scales from 1rem to 2.5rem
        "panel-padding": "clamp(1rem, 2vw, 2.5rem)",
        // Stage gap between major layout regions: scales from 1.5rem to 6rem
        "stage-gap": "clamp(1.5rem, 4vw, 6rem)",
      },
      fontFamily: {
        "clock-display": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "body-lg": ["Montserrat", "sans-serif"],
        "body-md": ["Montserrat", "sans-serif"],
        "label-caps": ["Montserrat", "sans-serif"],
        "tabular-nums": ["Montserrat", "sans-serif"],
      },
      fontSize: {
        "label-caps": [
          "clamp(0.75rem, 1vw, 0.875rem)",
          { lineHeight: "1.25rem", letterSpacing: "0.15em", fontWeight: "700" },
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
