import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";
import type { ClockState, CriticalSignalData } from "../types";

interface CriticalSignalPanelProps {
  criticalSignal: CriticalSignalData;
  statusMessage: string;
  clock: ClockState;
  hijriDate: string;
  is24h: boolean;
  displayHours: string;
}

export function CriticalSignalPanel({
  criticalSignal,
  statusMessage,
  clock,
  hijriDate,
  is24h,
  displayHours,
}: CriticalSignalPanelProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const isIqamah = criticalSignal.urgency === "high";
  const actionLabel =
    criticalSignal.urgency === "high"
      ? t.iqamah
      : criticalSignal.urgency === "medium"
        ? t.time
        : t.adhan;

  return (
    <div
      className="critical-signal-panel z-20 w-full h-full min-w-0 min-h-0 max-w-full max-h-full overflow-hidden flex flex-col items-center justify-center text-center relative"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Screen reader gets the full composed sentence */}
      <span className="sr-only">{statusMessage}</span>

      {/* Internal radial glow — emanates from center */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          isIqamah ? "critical-inner-glow-iqamah" : "critical-inner-glow-adhan",
        )}
        aria-hidden="true"
      />

      {/* Typography stack — kept clear of the absolute clock block on mobile */}
      <div
        className="critical-signal-content z-30 w-full min-w-0 min-h-0 max-w-full max-h-full overflow-hidden flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        <div className="critical-signal-heading flex flex-col items-center">
          {/* Action label and localized urgency badge */}
          <div className="critical-action-row flex items-center justify-center">
            <span className="critical-action-label font-label-caps text-on-surface font-semibold uppercase">
              {actionLabel}
            </span>
            <span className="critical-now-badge rounded-full border border-primary/60 bg-primary/15 font-label-caps text-primary font-semibold uppercase">
              {t.now}
            </span>
          </div>

          {/* Hero prayer name — bilingual horizontal */}
          <div className="critical-hero-wrap flex flex-col items-center">
            <div className="critical-hero-pulse critical-hero-row grid w-full items-center">
              <div className="critical-hero-name-cell min-w-0">
                <h2
                  className="critical-hero-name max-w-full font-clock-display text-on-surface leading-none text-right"
                >
                  {criticalSignal.prayerName}
                </h2>
              </div>
              <div
                className="critical-hero-divider"
                aria-hidden="true"
              />
              <div className="critical-hero-arabic-cell min-w-0">
                <span
                  className="critical-hero-arabic max-w-full font-body-lg text-on-surface-variant font-medium leading-none"
                  lang="ar"
                  dir="rtl"
                >
                  {criticalSignal.arabicName}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Retained current time and dates — centered */}
      <div
        className="critical-meta absolute text-text-muted opacity-70 z-30"
        aria-hidden="true"
      >
        <span className="critical-meta-time font-tabular-nums">
          {displayHours}:{clock.minutes}
          {!is24h && <span className="ml-1">{clock.ampm}</span>}
        </span>
        <div className="critical-meta-dates flex items-baseline">
          <span
            className="critical-meta-separator text-text-muted/40"
            aria-hidden="true"
          >
            ·
          </span>
          <span className="critical-meta-date font-body-md">
            {clock.gregorianDate}
          </span>
          <span
            className="critical-meta-separator text-text-muted/40"
            aria-hidden="true"
          >
            ·
          </span>
          <span className="critical-meta-date font-body-md">
            {hijriDate || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
