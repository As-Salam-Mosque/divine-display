import type { PrayerTime } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";
import { cn } from "../utils/cn";
import { formatDisplayTime, type FormattedTime } from "../utils/time";

interface PrayerCardProps {
  prayer: PrayerTime;
  isActive: boolean;
  backgroundVariant?: "a" | "b";
}

function TimeCellContent({
  label,
  time,
  isActive,
}: {
  label: string;
  time: FormattedTime;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <span
        className={cn(
          "text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-label-caps font-bold leading-none",
          isActive ? "text-primary" : "text-text-muted",
        )}
      >
        {label}
      </span>
      <div className="flex items-baseline justify-center gap-1 min-w-0">
        <span
          className={cn(
            "time-large font-semibold font-tabular-nums leading-none",
            isActive ? "text-primary" : "text-on-surface-variant",
          )}
        >
          {time.time}
        </span>
        {time.ampm && (
          <span
            className={cn(
              "text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-tabular-nums leading-none",
              isActive ? "text-primary" : "text-text-muted",
            )}
          >
            {time.ampm}
          </span>
        )}
      </div>
    </div>
  );
}

function TimeCell({
  label,
  time,
  isActive,
}: {
  label: string;
  time: FormattedTime;
  isActive: boolean;
}) {
  return (
    <>
      <div className="timecell-compact">
        <TimeCellContent label={label} time={time} isActive={isActive} />
      </div>
      <div className="timecell-normal">
        <TimeCellContent label={label} time={time} isActive={isActive} />
      </div>
    </>
  );
}

export function PrayerCard({
  prayer,
  isActive,
  backgroundVariant = "a",
}: PrayerCardProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  const timeEntries = (
    Array.isArray(prayer.times)
      ? prayer.times
      : prayer.times
        ? [prayer.times]
        : []
  )
    .map((time) => time.trim())
    .filter(Boolean);
  const showTimeList = !prayer.adhan && timeEntries.length > 0;
  const showTimeFallback =
    !prayer.adhan && !prayer.iqamah && timeEntries.length === 0;
  const fallbackTimeDisplay = formatDisplayTime("—", settings.timeFormat);

  const ariaLabel = [
    prayer.name,
    prayer.arabicName,
    isActive ? t.currentlyActive : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      aria-label={ariaLabel}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "prayer-card rounded-xl ghost-border flex flex-1 h-full min-w-0 w-full overflow-hidden",
        isActive
          ? "bg-prayer-card-active active-border dark-active z-30 overflow-visible"
          : backgroundVariant === "a"
            ? "bg-prayer-card-a"
            : "bg-prayer-card-b",
      )}
    >
      <div className="prayer-card-name-section">
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={cn(
              "font-label-caps text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl tv:text-5xl font-bold",
              isActive ? "text-primary" : "text-on-surface",
            )}
          >
            {prayer.name.toUpperCase()}
          </span>
          <span
            className={cn(
              "font-body-md block text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tv:text-4xl [@media(max-height:40vh)]:hidden",
              isActive ? "text-primary" : "text-text-muted",
            )}
            lang="ar"
          >
            {prayer.arabicName}
          </span>
        </div>
      </div>

      <div className="prayer-card-divider" aria-hidden="true" />

      <div className="prayer-card-time-section">
        {showTimeList ? (
          timeEntries.map((time, index) => (
            <TimeCell
              key={`${prayer.name}-time-${index}`}
              label={timeEntries.length > 1 ? `${t.time} ${index + 1}` : t.time}
              time={formatDisplayTime(time, settings.timeFormat)}
              isActive={isActive}
            />
          ))
        ) : showTimeFallback ? (
          <TimeCell
            label={t.time}
            time={fallbackTimeDisplay}
            isActive={isActive}
          />
        ) : (
          <>
            {prayer.adhan && (
              <TimeCell
                label={t.adhan || "ADHAN"}
                time={formatDisplayTime(prayer.adhan, settings.timeFormat)}
                isActive={isActive}
              />
            )}
            {prayer.iqamah && (
              <TimeCell
                label={t.iqamah || "IQAMAH"}
                time={formatDisplayTime(prayer.iqamah, settings.timeFormat)}
                isActive={isActive}
              />
            )}
          </>
        )}
      </div>
    </li>
  );
}
