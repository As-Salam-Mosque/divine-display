import type { PrayerTime } from "../types";
import { useT } from "../i18n";
import { useSettings } from "../context/SettingsContext";

interface PrayerCardProps {
  prayer: PrayerTime;
  isActive: boolean;
}

function formatDisplayTime(timeStr: string, timeFormat: "12h" | "24h") {
  // Expect timeStr in 24-hour "HH:MM" format (from data layer)
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

export function PrayerCard({ prayer, isActive }: PrayerCardProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const isShuruq = !prayer.adhan && !prayer.iqamah;

  const ariaLabel =
    `${prayer.name} ${prayer.arabicName || ""} ${isActive ? t.currentlyActive : ""}`.trim();

  return (
    <div
      role="listitem"
      aria-label={ariaLabel}
      className={[
        // Mobile: horizontal row layout (name | divider | times). md+: vertical card.
        "rounded-xl bg-surface-panel ghost-border flex items-center w-full lg:flex-col lg:items-center py-1 sm:py-1.5 md:py-2 lg:py-4 xl:py-5 tv:py-6 px-2 sm:px-3 md:px-4 lg:px-5 tv:px-6 relative h-full max-h-[clamp(80px,12vh,140px)] lg:max-h-none overflow-hidden",
        isActive
          ? "bg-primary/10 border-2 border-primary shadow-[0_0_15px_rgba(197,160,89,0.3)] z-30 overflow-visible"
          : "",
      ].join(" ")}
    >
      {isActive && (
        <div
          className="absolute -top-1.5 right-2 w-3 h-3 bg-primary rounded-full shadow-primary-sm"
          aria-hidden="true"
        />
      )}

      {/* Left: Prayer name + Arabic (centered horizontally) */}
      <div className="flex-shrink-0 w-1/4 lg:w-full flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <span
            className={`font-label-caps text-[10px] sm:text-xs md:text-base lg:text-lg xl:text-xl tv:text-2xl font-bold ${isActive ? "text-primary" : "text-on-surface"}`}
          >
            {prayer.name.toUpperCase()}
          </span>
          <span
            className={`font-body-md block lg:inline text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg tv:text-xl mt-0 ${isActive ? "text-primary/80" : "text-text-muted"} [@media(max-height:40vh)]:hidden`}
            lang="ar"
          >
            {prayer.arabicName}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        className="hidden lg:block border-t border-outline-variant/50 my-1 w-full"
        aria-hidden="true"
      />
      <div
        className="lg:hidden h-7 border-l border-outline-variant/50 mx-2"
        aria-hidden="true"
      />

      {/* Right: Times (Athan / Iqamah) */}
      <div className="flex-1 flex flex-row justify-around items-center w-full">
        {isShuruq && prayer.time ? (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg font-label-caps text-text-muted">
              {t.time || "TIME"}
            </span>
            <span
              className={`text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] tv:text-[36px] font-semibold font-tabular-nums ${isActive ? "text-primary" : "text-on-surface-variant"}`}
            >
              {formatDisplayTime(prayer.time!, settings.timeFormat).time}
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg text-text-muted font-tabular-nums">
              {formatDisplayTime(prayer.time!, settings.timeFormat).ampm}
            </span>
          </div>
        ) : (
          <>
            {prayer.adhan && (
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg font-label-caps text-text-muted">
                  {t.adhan || "ADHAN"}
                </span>
                <span
                  className={`text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] tv:text-[36px] font-semibold font-tabular-nums ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {formatDisplayTime(prayer.adhan!, settings.timeFormat).time}
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg text-text-muted font-tabular-nums">
                  {formatDisplayTime(prayer.adhan!, settings.timeFormat).ampm}
                </span>
              </div>
            )}

            {prayer.iqamah && (
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg font-label-caps text-text-muted">
                  {t.iqamah || "IQAMAH"}
                </span>
                <span
                  className={`text-[18px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] tv:text-[36px] font-semibold font-tabular-nums ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {formatDisplayTime(prayer.iqamah!, settings.timeFormat).time}
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base tv:text-lg text-text-muted font-tabular-nums">
                  {formatDisplayTime(prayer.iqamah!, settings.timeFormat).ampm}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
