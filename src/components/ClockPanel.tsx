import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import type { ClockState } from "../types";

interface ClockPanelProps {
  clock: ClockState;
  hijriDate: string;
  statusMessage: string;
  onOpenSettings: () => void;
}

const MosqueSilhouette = () => (
  <div
    className="absolute bottom-0 w-full h-32 md:h-48 opacity-10 bg-no-repeat bg-bottom bg-contain pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1000 300' xmlns='http://www.w3.org/2000/svg' fill='%23c5a059'><path d='M500 50 C450 150 400 200 400 300 L600 300 C600 200 550 150 500 50 Z M200 150 C180 200 150 250 150 300 L250 300 C250 250 220 200 200 150 Z M800 150 C780 200 750 250 750 300 L850 300 C850 250 820 200 800 150 Z M50 200 L70 300 L30 300 Z M950 200 L970 300 L930 300 Z'/></svg>")`,
    }}
    aria-hidden="true"
  />
);

export function ClockPanel({
  clock,
  hijriDate,
  statusMessage,
  onOpenSettings,
}: ClockPanelProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  const is24h = settings.timeFormat === "24h";
  const displayHours = is24h ? clock.hours24 : clock.hours;

  return (
    <div className="bg-surface-panel ghost-border rounded-xl p-4 md:p-6 md:flex-1 flex flex-col items-center justify-center relative overflow-hidden active-glow">
      <MosqueSilhouette />

      {/* Gear icon */}
      <button
        onClick={onOpenSettings}
        aria-label={t.settings}
        className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          aria-hidden="true"
        >
          settings
        </span>
      </button>

      {/* Mosque Identity */}
      <div className="z-10 flex flex-col items-center w-full mb-3 md:mb-6">
        <div className="flex flex-col items-center mb-2 md:mb-4">
          <span
            className="material-symbols-outlined filled text-primary text-2xl md:text-3xl mb-1"
            aria-hidden="true"
          >
            mosque
          </span>
          <h1 className="font-headline-md text-lg md:text-2xl font-semibold tracking-[0.2em] md:tracking-[0.25em] text-primary">
            {settings.mosque.name}
          </h1>
          <p className="font-label-caps text-[10px] md:text-xs text-text-muted">
            {settings.mosque.city}
          </p>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-5 md:gap-10">
          <div className="flex flex-col items-center">
            <span className="font-body-md text-sm md:text-base text-on-surface">
              {clock.gregorianDate}
            </span>
            <span className="font-label-caps text-[10px] text-text-muted">
              {clock.dayName}
            </span>
          </div>
          <div
            className="w-[1px] h-6 md:h-8 bg-primary/20"
            aria-hidden="true"
          />
          <div className="flex flex-col items-center">
            <span className="font-body-md text-sm md:text-base text-on-surface">
              {hijriDate || "—"}
            </span>
            <span className="font-label-caps text-[10px] text-text-muted">
              {t.hijri}
            </span>
          </div>
        </div>
      </div>

      {/* Clock */}
      <h2 className="font-label-caps text-[11px] md:text-label-caps text-primary tracking-widest z-10 mb-1 md:mb-1">
        {t.currentTime}
      </h2>
      <div
        className="flex items-baseline gap-2 md:gap-4 text-on-surface z-10"
        aria-label={`${displayHours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
        role="timer"
      >
        <span className="font-clock-display text-[72px] md:text-clock-display leading-none">
          {displayHours}:{clock.minutes}
        </span>
        <div className="flex flex-col items-start">
          <span className="text-2xl md:text-headline-md text-primary font-bold leading-tight">
            :{clock.seconds}
          </span>
          {!is24h && (
            <span className="text-2xl md:text-headline-md text-primary font-bold leading-tight">
              {clock.ampm}
            </span>
          )}
        </div>
      </div>

      {/* Status Pill */}
      {statusMessage && (
        <div className="mt-3 md:mt-6 flex items-center gap-2 md:gap-3 bg-surface/50 rounded-full px-4 md:px-5 py-2 md:py-2 border border-primary/20 z-10">
          <span
            className="material-symbols-outlined text-primary text-base md:text-[24px]"
            aria-hidden="true"
          >
            campaign
          </span>
          <span className="font-body-md text-sm md:text-body-lg text-on-surface">
            {statusMessage}
          </span>
        </div>
      )}
    </div>
  );
}
