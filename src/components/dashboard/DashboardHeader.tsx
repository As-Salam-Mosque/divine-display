import type { DashboardTranslations } from "./types";

interface DashboardHeaderProps {
  slug: string;
  t: DashboardTranslations;
  onHome: () => void;
  onPreview: () => void;
  onSignOut: () => void;
}

export function DashboardHeader({
  slug,
  t,
  onHome,
  onPreview,
  onSignOut,
}: DashboardHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 bg-surface-panel px-6 py-4"
      style={{ borderBottom: "1px solid var(--ghost-border-color)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={onHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-ring rounded-lg p-1 bg-none border-none cursor-pointer text-left"
        >
          <img src="/favicon.svg" alt="Divine Display" className="w-6 h-6" />
          <div>
            <span className="font-headline-md text-on-surface text-base leading-none">
              Divine Display
            </span>
            <span className="block font-label-caps text-text-muted uppercase tracking-widest text-xs mt-0.5">
              {slug}
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-caps text-xs uppercase tracking-widest text-text-muted hover:text-primary hover:bg-primary/5 transition-colors focus-ring bg-none border-none cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
            >
              open_in_new
            </span>
            {t.preview}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-caps text-xs uppercase tracking-widest text-text-muted hover:text-primary hover:bg-primary/5 transition-colors focus-ring"
          >
            <span
              className="material-symbols-outlined text-base"
              aria-hidden="true"
            >
              logout
            </span>
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
