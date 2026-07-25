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
      className="z-20 w-full h-full flex flex-col items-center justify-center text-center relative"
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

      {/* Typography stack — padded bottom on mobile to clear the absolute clock block */}
      <div
        className="z-30 w-full flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10 pb-16 md:pb-0"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-3 md:gap-5 lg:gap-6">
          {/* Action label */}
          <span className="font-label-caps text-lg md:text-3xl lg:text-4xl xl:text-5xl tv:text-6xl text-primary/70 tracking-[0.25em] md:tracking-[0.35em] uppercase">
            {actionLabel}
          </span>

          {/* Hero prayer name — bilingual horizontal */}
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <div className="flex w-full flex-row items-center gap-4 md:gap-6 lg:gap-10">
              <div className="flex min-w-0 flex-1 justify-end">
                <h2
                  className="font-clock-display text-primary leading-none critical-text-blink text-center"
                  style={{ fontSize: "clamp(2.5rem, 8vw, 11rem)" }}
                >
                  {criticalSignal.prayerName}
                </h2>
              </div>
              <div
                style={{
                  width: "4px",
                  minWidth: "4px",
                  height: "clamp(4rem, 8vw, 11rem)",
                  minHeight: "4rem",
                  flexShrink: 0,
                  alignSelf: "center",
                  borderRadius: "9999px",
                  backgroundColor: "var(--on-surface-variant)",
                  opacity: 0.25,
                }}
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 justify-start">
                <span
                  className="font-body-lg text-primary/80 font-medium leading-none critical-text-blink"
                  lang="ar"
                  style={{ fontSize: "clamp(2.5rem, 8vw, 11rem)" }}
                >
                  {criticalSignal.arabicName}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Retained current time + dates — corner */}
      <div
        className="absolute bottom-3 left-4 md:bottom-4 md:left-5 lg:bottom-5 lg:left-6 flex flex-row items-baseline gap-2 md:gap-3 lg:gap-4 text-text-muted opacity-70 z-30"
        aria-hidden="true"
      >
        <span className="font-tabular-nums text-base md:text-xl lg:text-3xl xl:text-4xl tv:text-5xl">
          {displayHours}:{clock.minutes}
          {!is24h && <span className="ml-1 text-[0.7em]">{clock.ampm}</span>}
        </span>
        <span
          className="text-text-muted/40 text-base md:text-xl lg:text-2xl"
          aria-hidden="true"
        >
          ·
        </span>
        <span className="font-body-md text-xs md:text-sm lg:text-lg xl:text-xl tv:text-2xl">
          {clock.gregorianDate}
        </span>
        <span
          className="text-text-muted/40 text-base md:text-xl lg:text-2xl"
          aria-hidden="true"
        >
          ·
        </span>
        <span className="font-body-md text-xs md:text-sm lg:text-lg xl:text-xl tv:text-2xl">
          {hijriDate || "—"}
        </span>
      </div>
    </div>
  );
}
