import { memo } from "react";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";
import { isCriticalStatusType } from "../utils/prayerStatus";
import { splitStatusMessage } from "../utils/time";
import type {
  ClockState,
  CriticalSignalData,
  Language,
  StatusType,
} from "../types";
import { CriticalSignalPanel } from "./CriticalSignalPanel";

interface ClockPanelProps {
  clock: ClockState;
  hijriDate: string;
  statusMessage: string;
  statusType: StatusType;
  criticalSignal?: CriticalSignalData | null;
  onOpenSettings: () => void;
  promoActive?: boolean;
}

function MosqueSilhouette() {
  return (
    <div
      className="absolute bottom-0 w-full h-20 md:h-36 lg:h-44 opacity-10 bg-no-repeat bg-bottom bg-contain pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1000 300' xmlns='http://www.w3.org/2000/svg' fill='%23c5a059'><path d='M500 50 C450 150 400 200 400 300 L600 300 C600 200 550 150 500 50 Z M200 150 C180 200 150 250 150 300 L250 300 C250 250 220 200 200 150 Z M800 150 C780 200 750 250 750 300 L850 300 C850 250 820 200 800 150 Z M50 200 L70 300 L30 300 Z M950 200 L970 300 L930 300 Z'/></svg>")`,
      }}
      aria-hidden="true"
    />
  );
}

interface ClockDisplayProps {
  clock: ClockState;
  is24h: boolean;
}

// Memoized clock display — only re-renders when time actually changes
const ClockDisplay = memo(
  ({ clock, is24h }: ClockDisplayProps) => (
    <div
      className="clock-panel__time flex items-baseline gap-2 md:gap-5 lg:gap-7 xl:gap-10 text-on-surface z-10"
      aria-label={`${is24h ? clock.hours24 : clock.hours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
      role="timer"
    >
      <span className="font-clock-display leading-none">
        {is24h ? clock.hours24 : clock.hours}:{clock.minutes}
      </span>
      <div className="relative flex items-start leading-none">
        <span className="clock-panel__seconds text-primary font-bold leading-tight">
          :{clock.seconds}
        </span>
        {!is24h && (
          <span className="clock-panel__ampm absolute top-[-0.9em] right-0 whitespace-nowrap text-primary font-semibold leading-none">
            {clock.ampm}
          </span>
        )}
      </div>
    </div>
  ),
  (prev, next) =>
    prev.clock.hours === next.clock.hours &&
    prev.clock.hours24 === next.clock.hours24 &&
    prev.clock.minutes === next.clock.minutes &&
    prev.clock.seconds === next.clock.seconds &&
    prev.clock.ampm === next.clock.ampm &&
    prev.is24h === next.is24h,
);

ClockDisplay.displayName = "ClockDisplay";

interface MosqueInfoProps {
  promoActive: boolean;
}

// Static mosque branding — only re-renders when settings change
const MosqueInfo = memo(({ promoActive }: MosqueInfoProps) => {
  const { settings } = useSettings();
  const logo = settings.mosque?.logo?.trim() || "";
  const hasLogo = logo.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col items-center mb-1 md:mb-2 lg:mb-3",
        promoActive && "md:items-start",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center mb-1 md:mb-2",
          promoActive && "md:items-start",
        )}
      >
        {hasLogo ? (
          <img
            src={logo}
            alt={`${settings.mosque?.name || "Mosque"} logo`}
            className="h-8 md:h-12 lg:h-16 xl:h-20 tv:h-24 w-auto max-w-55 md:max-w-65 lg:max-w-[320px] xl:max-w-95 tv:max-w-[440px] object-contain mb-1 md:mb-2"
          />
        ) : (
          <span
            className="material-symbols-outlined filled text-primary text-xl md:text-3xl lg:text-4xl xl:text-5xl tv:text-6xl mb-1 md:mb-2"
            aria-hidden="true"
          >
            mosque
          </span>
        )}
        <h1 className="font-headline-md text-base md:text-2xl lg:text-4xl xl:text-5xl tv:text-6xl font-semibold tracking-[0.18em] md:tracking-[0.28em] lg:tracking-[0.35em] text-primary">
          {settings.mosque?.name}
        </h1>
        <p className="font-label-caps text-sm md:text-base lg:text-lg xl:text-xl tv:text-2xl text-text-muted">
          {settings.mosque?.city}
        </p>
      </div>
    </div>
  );
});

MosqueInfo.displayName = "MosqueInfo";

interface CalendarRowProps {
  clock: ClockState;
  hijriDate: string;
  language: Language;
  promoActive: boolean;
}

// Calendar dates — only re-renders when date changes (once per day)
const CalendarRow = memo(
  ({ clock, hijriDate, language, promoActive }: CalendarRowProps) => {
    const t = useT(language);
    return (
      <div className="clock-panel__dates flex items-center gap-2 md:gap-4 lg:gap-5">
        <div
          className={cn(
            "flex flex-col items-center",
            promoActive && "md:items-start",
          )}
        >
          <span className="font-body-md text-base md:text-lg lg:text-xl xl:text-2xl tv:text-3xl text-on-surface font-medium">
            {clock.gregorianDate}
          </span>
          <span className="font-label-caps text-sm md:text-base lg:text-base xl:text-lg tv:text-xl text-text-muted">
            {clock.dayName}
          </span>
        </div>
        <div
          className="w-px h-5 md:h-8 lg:h-12 bg-primary-20"
          aria-hidden="true"
        />
        <div
          className={cn(
            "flex flex-col items-center",
            promoActive && "md:items-start",
          )}
        >
          <span className="font-body-md text-base md:text-lg lg:text-xl xl:text-2xl tv:text-3xl text-on-surface font-medium">
            {hijriDate || "—"}
          </span>
          <span className="font-label-caps text-sm md:text-base lg:text-base xl:text-lg tv:text-xl text-text-muted">
            {t.hijri}
          </span>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.clock.gregorianDate === next.clock.gregorianDate &&
    prev.clock.dayName === next.clock.dayName &&
    prev.hijriDate === next.hijriDate &&
    prev.language === next.language &&
    prev.promoActive === next.promoActive,
);

CalendarRow.displayName = "CalendarRow";

export function ClockPanel({
  clock,
  hijriDate,
  statusMessage,
  statusType,
  criticalSignal = null,
  onOpenSettings,
  promoActive = false,
}: ClockPanelProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  const is24h = settings.timeFormat === "24h";
  const displayHours = is24h ? clock.hours24 : clock.hours;
  const isCriticalSignal = isCriticalStatusType(statusType);

  return (
    <div
      className={cn(
        "clock-panel rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 tv:p-12 h-full w-full flex flex-col items-center justify-center relative overflow-hidden",
        isCriticalSignal
          ? "bg-background-deep border-2 border-primary critical-enter"
          : "bg-surface-panel ghost-border active-glow",
      )}
    >
      {!isCriticalSignal && <MosqueSilhouette />}

      {/* Settings Gear — hidden during critical state */}
      {!isCriticalSignal && (
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t.settings}
          className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-30 w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-[rgba(var(--primary-rgb),0.18)] focus-visible:text-primary focus-visible:bg-[rgba(var(--primary-rgb),0.18)] transition-colors focus-ring"
        >
          <span
            className="material-symbols-outlined text-base md:text-xl lg:text-2xl"
            aria-hidden="true"
          >
            settings
          </span>
        </button>
      )}

      {isCriticalSignal && criticalSignal ? (
        <CriticalSignalPanel
          criticalSignal={criticalSignal}
          statusMessage={statusMessage}
          clock={clock}
          hijriDate={hijriDate}
          is24h={is24h}
          displayHours={displayHours}
        />
      ) : (
        <div
          className={cn(
            "z-10 w-full max-h-full flex flex-col items-center justify-center gap-2 md:gap-3 lg:gap-4",
            promoActive && "md:flex-row md:items-stretch md:justify-between",
          )}
        >
          {/* Main Display / Left Column */}
          <div
            className={cn(
              "flex flex-col min-w-0",
              promoActive
                ? "promo-compact md:w-[calc(100%-var(--promo-rail-width))] md:items-start pl-1 md:pl-2 max-md:items-center w-full"
                : "items-center w-full",
            )}
          >
            {/* Mosque Branding */}
            <MosqueInfo promoActive={promoActive} />

            {/* Calendar Row */}
            <CalendarRow
              clock={clock}
              hijriDate={hijriDate}
              language={settings.language}
              promoActive={promoActive}
            />

            {/* Time Display */}
            <h2 className="font-label-caps font-bold text-sm md:text-base lg:text-lg xl:text-xl tv:text-2xl text-primary tracking-wide md:tracking-wider z-10 mb-0.5 md:mb-1 lg:mb-1.5">
              {t.currentTime}
            </h2>
            <ClockDisplay clock={clock} is24h={is24h} />

            {/* Status Pill */}
            {statusMessage &&
              (() => {
                const { label, countdown } = splitStatusMessage(statusMessage);
                return (
                  <div
                    className="clock-panel__status mt-1 md:mt-2 lg:mt-3 flex items-center gap-3 md:gap-4 status-pill rounded-full px-3 md:px-5 lg:px-6 py-1.5 md:py-2 lg:py-2.5 z-10 max-w-full"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="text-primary shrink-0"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" />
                    </svg>
                    <span className="clock-panel__status-text flex items-center gap-1.5 md:gap-2.5 min-w-0">
                      <span className="clock-panel__status-label font-body-md text-text-muted font-medium">
                        {label}
                      </span>
                      {countdown && (
                        <span className="clock-panel__countdown font-tabular-nums text-on-surface font-bold leading-none">
                          {countdown}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })()}
          </div>
        </div>
      )}
    </div>
  );
}
