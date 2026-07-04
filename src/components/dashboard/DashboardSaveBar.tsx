import { cn } from "../../utils/cn";
import type { DashboardStatus, DashboardTranslations } from "./types";

interface DashboardSaveBarProps {
  status: DashboardStatus | null;
  hasChanges: boolean;
  saving: boolean;
  t: DashboardTranslations;
  onDiscard: () => void;
}

export function DashboardSaveBar({
  status,
  hasChanges,
  saving,
  t,
  onDiscard,
}: DashboardSaveBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-background-deep"
      style={{ borderTop: "1px solid var(--ghost-border-color)" }}
    >
      <div className="w-full px-6 lg:px-8 lg:pl-56">
        <div className="max-w-5xl mx-auto py-4 relative">
          {status && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0">
              <div
                role={status.type === "error" ? "alert" : "status"}
                aria-live={status.type === "error" ? "assertive" : "polite"}
                aria-atomic="true"
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm flex items-center gap-2",
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400",
                )}
              >
                <span
                  className="material-symbols-outlined shrink-0"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  {status.type === "success" ? "check_circle" : "error"}
                </span>
                {status.message}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-text-muted hidden sm:block">
              {t.changesApplyImmediately}
            </p>
            <div className="flex items-center gap-3 ml-auto">
              {hasChanges && !saving && (
                <button
                  type="button"
                  onClick={onDiscard}
                  className="px-4 py-2.5 rounded-lg text-sm text-text-muted hover:text-on-surface hover:bg-surface-container ghost-border transition-colors focus-ring"
                >
                  {t.discardLabel}
                </button>
              )}
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className={cn(
                  "gold-button rounded-lg px-6 py-3 font-semibold text-sm",
                  "flex items-center gap-2 whitespace-nowrap transition-opacity",
                  (saving || !hasChanges) && "opacity-50 cursor-not-allowed",
                )}
              >
                {saving ? (
                  <>
                    <span
                      className="material-symbols-outlined motion-safe:animate-spin"
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    >
                      sync
                    </span>
                    {t.savingLabel}
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    >
                      save
                    </span>
                    {t.saveConfigurationLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
