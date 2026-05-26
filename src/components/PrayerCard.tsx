import type { PrayerTime } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";

interface PrayerCardProps {
  prayer: PrayerTime;
  isActive: boolean;
}

function formatDisplayTime(timeStr: string, timeFormat: "12h" | "24h") {
  const [hRaw, mRaw] = timeStr.trim().split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return { time: timeStr, ampm: "" };

  if (timeFormat === "24h") {
    return {
      time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      ampm: "",
    };
  }

  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return { time: `${h12}:${String(m).padStart(2, "0")}`, ampm };
}

function TimeCell({
  label,
  time,
  isActive,
}: {
  label: string;
  time: { time: string; ampm: string };
  isActive: boolean;
}) {
  // Render both variants and let CSS container queries show/hide the appropriate one.
  return (
    <>
      <div className="timecell-compact">
        <div className="flex flex-col items-center justify-center gap-1">
          <span
            className={`text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-label-caps font-bold leading-none ${isActive ? "text-primary" : "text-text-muted"}`}
          >
            {label}
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`time-large font-semibold font-tabular-nums leading-none ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            >
              {time.time}
            </span>
            {time.ampm && (
              <span
                className={`text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-tabular-nums leading-none ${isActive ? "text-primary" : "text-text-muted"}`}
              >
                {time.ampm}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="timecell-normal">
        <div className="flex flex-col items-center justify-center gap-1">
          <span
            className={`text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-label-caps font-bold leading-none ${isActive ? "text-primary" : "text-text-muted"}`}
          >
            {label}
          </span>
          <div className="flex items-baseline justify-center gap-1 min-w-0">
            <span
              className={`time-large font-semibold font-tabular-nums leading-none ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            >
              {time.time}
            </span>
            {time.ampm && (
              <span
                className={`text-[0.6875rem] sm:text-sm md:text-base lg:text-lg tv:text-xl font-tabular-nums leading-none ${isActive ? "text-primary" : "text-text-muted"}`}
              >
                {time.ampm}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function PrayerCard({ prayer, isActive }: PrayerCardProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  const hasNoAdhanOrIqamah = !prayer.adhan && !prayer.iqamah;
  const singleTime = prayer.time ?? "—";
  const singleTimeDisplay = formatDisplayTime(singleTime, settings.timeFormat);

  const ariaLabel =
    `${prayer.name} ${prayer.arabicName || ""} ${isActive ? t.currentlyActive : ""}`.trim();

  return (
    <li
      aria-label={ariaLabel}
      className={[
        "prayer-card rounded-xl bg-surface-panel ghost-border flex flex-1 h-full min-w-0 w-full overflow-hidden",
        isActive
          ? "bg-surface-panel ghost-border active-glow dark-active z-30 overflow-visible"
          : "",
      ].join(" ")}
    >
      {/* The layout (flex-row vs flex-col) is now controlled by CSS container queries in index.css */}
      <div className="prayer-card-name-section">
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`font-label-caps text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tv:text-4xl font-bold ${isActive ? "text-primary" : "text-on-surface"}`}
          >
            {prayer.name.toUpperCase()}
          </span>
          <span
            className={`font-body-md block text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tv:text-4xl ${isActive ? "text-primary" : "text-text-muted"} [@media(max-height:40vh)]:hidden`}
            lang="ar"
          >
            {prayer.arabicName}
          </span>
        </div>
      </div>

      <div
        className="prayer-card-divider"
        aria-hidden="true"
      />

      <div className="prayer-card-time-section">
        {hasNoAdhanOrIqamah ? (
          <TimeCell
            label={t.time}
            time={singleTimeDisplay}
            isActive={isActive}
          />
        ) : (
          <>
            {prayer.adhan && (
              <TimeCell
                label={t.adhan || "ADHAN"}
                time={formatDisplayTime(prayer.adhan!, settings.timeFormat)}
                isActive={isActive}
              />
            )}

            {prayer.iqamah && (
              <TimeCell
                label={t.iqamah || "IQAMAH"}
                time={formatDisplayTime(prayer.iqamah!, settings.timeFormat)}
                isActive={isActive}
              />
            )}
          </>
        )}
      </div>
    </li>
  );
}
