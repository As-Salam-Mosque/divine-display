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

  return (
    <div
      role="listitem"
      // import { useT } from "../i18n";
      // ...
      aria-label={`${prayer.name}${isActive ? t.currentlyActive : ""}`}
      className={[
        "rounded-xl flex flex-col items-center py-3 md:py-5 px-2 md:px-3 relative",
        isActive
          ? "bg-primary/10 border-2 border-primary shadow-[0_0_15px_rgba(197,160,89,0.3)] z-30 overflow-visible"
          : isShuruq
            ? "bg-surface-panel ghost-border opacity-70"
            : "bg-surface-panel ghost-border",
      ].join(" ")}
    >
      {/* Active indicator dot */}
      {isActive && (
        <div
          className="absolute -top-1.5 right-2 w-3 h-3 bg-primary rounded-full shadow-[0_0_5px_#c5a059]"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <span
        className={`material-symbols-outlined text-[22px] md:text-[32px] mb-1 ${isActive ? "text-primary" : "text-text-muted"}`}
        aria-hidden="true"
      >
        {prayer.icon}
      </span>

      {/* Prayer name */}
      <h3
        className={`font-label-caps text-sm md:text-xl lg:text-2xl tracking-wider md:tracking-widest font-bold text-center truncate ${isActive ? "text-primary" : "text-on-surface"}`}
      >
        {prayer.name.toUpperCase()}
      </h3>

      {/* Arabic name */}
      <span
        className={`font-body-md text-sm md:text-lg mb-1 md:mb-auto ${isActive ? "text-primary/80" : "text-text-muted"}`}
        lang="ar"
      >
        {prayer.arabicName}
      </span>

      {/* Divider */}
      <div
        className={`w-full h-[1px] my-2 ${isActive ? "bg-primary/30" : "bg-outline-variant/50"}`}
        aria-hidden="true"
      />

      {/* Times */}
      <div className="w-full px-1 md:px-4 font-tabular-nums">
        {isShuruq && prayer.time ? (
          <div className="flex justify-center">
            <TimeBlock
              label={t.time || "TIME"}
              timeStr={prayer.time}
              isActive={isActive}
            />
          </div>
        ) : (
          <div className="flex justify-around">
            {prayer.adhan && (
              <TimeBlock
                label="ADHAN"
                timeStr={prayer.adhan}
                isActive={isActive}
              />
            )}
            {prayer.iqamah && (
              <TimeBlock
                label="IQAMAH"
                timeStr={prayer.iqamah}
                isActive={isActive}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({
  label,
  timeStr,
  isActive,
}: {
  label: string;
  timeStr: string;
  isActive: boolean;
}) {
  const { settings } = useSettings();
  const { time, ampm } = formatDisplayTime(timeStr, settings.timeFormat);
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-xs md:text-base font-label-caps tracking-wider ${isActive ? "text-primary/70" : "text-text-muted"}`}
      >
        {label}
      </span>
      <span
        className={`text-lg md:text-3xl lg:text-4xl font-semibold leading-tight ${isActive ? "text-primary" : "text-on-surface-variant"}`}
      >
        {time}
      </span>
      <span
        className={`text-xs md:text-base ${isActive ? "text-primary/80" : "text-text-muted"}`}
      >
        {ampm}
      </span>
    </div>
  );
}
