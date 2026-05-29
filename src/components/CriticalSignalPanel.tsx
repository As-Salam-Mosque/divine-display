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

      {/* Typography stack */}
      <div
        className="z-30 flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-3 md:gap-5 lg:gap-6">
          {/* Action label */}
          <span className="font-label-caps text-lg md:text-3xl lg:text-4xl xl:text-5xl tv:text-6xl text-primary/70 tracking-[0.25em] md:tracking-[0.35em] uppercase">
            {criticalSignal.urgency === "low" ? t.adhan : t.iqamah}
          </span>

          {/* Hero prayer name */}
          <div className="flex flex-col items-center gap-2 md:gap-3 lg:gap-4">
            <h2
              className="font-clock-display text-primary leading-none"
              style={{ fontSize: "clamp(3.5rem, 10vw, 13rem)" }}
            >
              {criticalSignal.prayerName}
            </h2>
            <span
              className="font-body-lg text-on-surface/80 font-medium text-2xl md:text-4xl lg:text-5xl xl:text-6xl tv:text-7xl leading-none"
              lang="ar"
            >
              {criticalSignal.arabicName}
            </span>
          </div>

          {/* Subtitle — blinks to draw attention */}
          <span className="font-body-lg text-base md:text-xl lg:text-3xl xl:text-4xl tv:text-5xl text-on-surface/80 font-medium critical-text-blink">
            {criticalSignal.subtitle}
          </span>

          {/* Pulsing dots */}
          <div
            className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2"
            aria-hidden="true"
          >
            {[0, 0.3, 0.6].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-primary rounded-full motion-safe:animate-pulse"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Retained current time + dates — corner */}
      <div
        className="absolute bottom-3 left-4 md:bottom-4 md:left-5 lg:bottom-5 lg:left-6 flex flex-col items-start gap-1 md:gap-1.5 lg:gap-2 text-text-muted opacity-70 z-30"
        aria-hidden="true"
      >
        <span className="font-tabular-nums text-base md:text-xl lg:text-3xl xl:text-4xl tv:text-5xl">
          {displayHours}:{clock.minutes}
          {!is24h && <span className="ml-1 text-[0.7em]">{clock.ampm}</span>}
        </span>
        <span className="font-body-md text-xs md:text-sm lg:text-lg xl:text-xl tv:text-2xl">
          {clock.gregorianDate}
        </span>
        <span className="font-body-md text-xs md:text-sm lg:text-lg xl:text-xl tv:text-2xl">
          {hijriDate || "—"}
        </span>
      </div>
    </div>
  );
}
