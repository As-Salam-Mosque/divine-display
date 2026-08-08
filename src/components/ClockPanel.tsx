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
  return <div className="clock-panel__silhouette" aria-hidden="true" />;
}

interface ClockDisplayProps {
  clock: ClockState;
  is24h: boolean;
}

// Memoized clock display — only re-renders when time actually changes
const ClockDisplay = memo(
  ({ clock, is24h }: ClockDisplayProps) => (
    <div
      className="clock-panel__time"
      aria-label={`${is24h ? clock.hours24 : clock.hours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
      role="timer"
    >
      <span className="font-clock-display">
        {is24h ? clock.hours24 : clock.hours}:{clock.minutes}
      </span>
      <div className="clock-panel__seconds-group">
        <span className="clock-panel__seconds">
          :{clock.seconds}
        </span>
        {!is24h && (
          <span className="clock-panel__ampm">
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

// Static mosque branding — only re-renders when settings change
const MosqueInfo = memo(() => {
  const { settings } = useSettings();
  const logo = settings.mosque?.logo?.trim() || "";
  const hasLogo = logo.length > 0;

  return (
    <div className="clock-panel__branding">
      <div className="clock-panel__branding-inner">
        {hasLogo ? (
          <img
            src={logo}
            alt={`${settings.mosque?.name || "Mosque"} logo`}
            className="clock-panel__logo"
          />
        ) : (
          <span
            className="clock-panel__mosque-icon material-symbols-outlined filled"
            aria-hidden="true"
          >
            mosque
          </span>
        )}
        <h1 className="clock-panel__mosque-name font-headline-md">
          {settings.mosque?.name}
        </h1>
        <p className="clock-panel__city font-label-caps">
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
}

// Calendar dates — only re-renders when date changes (once per day)
const CalendarRow = memo(
  ({ clock, hijriDate, language }: CalendarRowProps) => {
    const t = useT(language);
    return (
      <div className="clock-panel__dates">
        <div className="clock-panel__date">
          <span className="clock-panel__date-value font-body-md">
            {clock.gregorianDate}
          </span>
          <span className="clock-panel__date-label font-label-caps">
            {clock.dayName}
          </span>
        </div>
        <div className="clock-panel__date-divider" aria-hidden="true" />
        <div className="clock-panel__date">
          <span className="clock-panel__date-value font-body-md">
            {hijriDate || "—"}
          </span>
          <span className="clock-panel__date-label font-label-caps">
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
    prev.language === next.language,
);

CalendarRow.displayName = "CalendarRow";

interface StatusDisplayProps {
  message: string;
}

function StatusDisplay({ message }: StatusDisplayProps) {
  if (!message) return null;

  const { label, countdown } = splitStatusMessage(message);

  return (
    <div
      className="clock-panel__status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="clock-panel__status-text">
        <span
          className="clock-panel__status-icon material-symbols-outlined"
          aria-hidden="true"
        >
          campaign
        </span>
        <span className="clock-panel__status-label font-body-md">{label}</span>
      </span>
      {countdown && (
        <span className="clock-panel__countdown font-tabular-nums">
          {countdown}
        </span>
      )}
    </div>
  );
}

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
        "clock-panel",
        isCriticalSignal
          ? "clock-panel--critical critical-enter"
          : "clock-panel--default",
      )}
    >
      {!isCriticalSignal && <MosqueSilhouette />}

      {/* Settings Gear — hidden during critical state */}
      {!isCriticalSignal && (
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t.settings}
          className="clock-panel__settings focus-ring"
        >
          <span
            className="clock-panel__settings-icon material-symbols-outlined"
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
            "clock-panel__content",
            promoActive && "clock-panel__content--promo",
          )}
        >
          {/* Main Display / Left Column */}
          <div
            className={cn(
              "clock-panel__main",
              promoActive && "promo-compact",
            )}
          >
            {/* Mosque Branding */}
            <MosqueInfo />

            {/* Calendar Row */}
            <CalendarRow
              clock={clock}
              hijriDate={hijriDate}
              language={settings.language}
            />

            {/* Time Display and Status */}
            <h2 className="clock-panel__current-time-label font-label-caps">
              {t.currentTime}
            </h2>
            <div
              className={cn(
                "clock-panel__time-row",
                promoActive && "clock-panel__time-row--compact",
              )}
            >
              <ClockDisplay clock={clock} is24h={is24h} />

              <StatusDisplay message={statusMessage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
