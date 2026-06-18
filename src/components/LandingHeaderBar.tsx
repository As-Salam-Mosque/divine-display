import type { Language } from "../types";

interface LandingHeaderBarProps {
  primaryNavLabel: string;
  brand: string;
  joinUs: string;
  languageToggleLabel: string;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  navItems: Array<{
    label: string;
    href: string;
  }>;
}

export function LandingHeaderBar({
  primaryNavLabel,
  brand,
  joinUs,
  languageToggleLabel,
  currentLanguage,
  onLanguageChange,
  navItems,
}: LandingHeaderBarProps) {
  return (
    <nav
      aria-label={primaryNavLabel}
      className="fixed top-0 z-50 w-full border-b border-outline-variant bg-background-deep/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <a
          href="#home"
          className="font-headline-md text-2xl font-bold text-primary focus-ring"
        >
          {brand}
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-label-caps text-sm tracking-wide text-text-muted transition-colors hover:text-primary focus-ring"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden md:flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-panel/60 p-1"
            role="group"
            aria-label={languageToggleLabel}
          >
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              aria-pressed={currentLanguage === "en"}
              className={`rounded-md px-2 py-1 text-xs font-semibold focus-ring ${
                currentLanguage === "en"
                  ? "bg-primary text-black"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("fr")}
              aria-pressed={currentLanguage === "fr"}
              className={`rounded-md px-2 py-1 text-xs font-semibold focus-ring ${
                currentLanguage === "fr"
                  ? "bg-primary text-black"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              FR
            </button>
          </div>
          <a
            href="#partners"
            className="gold-button rounded-lg px-6 py-2 text-sm font-semibold focus-ring"
          >
            {joinUs}
          </a>
        </div>
      </div>
    </nav>
  );
}
