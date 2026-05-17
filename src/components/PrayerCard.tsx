import type { PrayerTime } from "../types";

interface PrayerCardProps {
  prayer: PrayerTime;
  isActive: boolean;
}

function splitTime(timeStr: string): { time: string; ampm: string } {
  const parts = timeStr.trim().split(" ");
  return { time: parts[0], ampm: parts[1] ?? "" };
}

export function PrayerCard({ prayer, isActive }: PrayerCardProps) {
  const isShuruq = !prayer.adhan && !prayer.iqamah;

  return (
    <div
      role="listitem"
      aria-label={`${prayer.name}${isActive ? ", currently active" : ""}`}
      className={[
        "rounded-xl flex flex-col items-center py-3 md:py-4 px-2 relative",
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
        className={`material-symbols-outlined text-[20px] md:text-[24px] mb-1 ${isActive ? "text-primary" : "text-text-muted"}`}
        aria-hidden="true"
      >
        {prayer.icon}
      </span>

      {/* Prayer name */}
      <h3
        className={`font-label-caps text-[11px] md:text-[13px] tracking-wider md:tracking-widest font-bold ${isActive ? "text-primary" : "text-on-surface"}`}
      >
        {prayer.name.toUpperCase()}
      </h3>

      {/* Arabic name */}
      <span
        className={`font-body-md text-xs md:text-sm mb-1 md:mb-auto ${isActive ? "text-primary/80" : "text-text-muted"}`}
        lang="ar"
      >
        {prayer.arabicName}
      </span>

      {/* Divider */}
      <div
        className={`w-full h-[1px] my-1.5 ${isActive ? "bg-primary/30" : "bg-outline-variant/50"}`}
        aria-hidden="true"
      />

      {/* Times */}
      <div className="w-full px-1 md:px-3 font-tabular-nums">
        {isShuruq && prayer.time ? (
          <div className="flex justify-center">
            <TimeBlock label="TIME" timeStr={prayer.time} isActive={isActive} />
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
  const { time, ampm } = splitTime(timeStr);
  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-[9px] md:text-[11px] font-label-caps tracking-wider ${isActive ? "text-primary/70" : "text-text-muted"}`}
      >
        {label}
      </span>
      <span
        className={`text-base md:text-xl font-semibold leading-tight ${isActive ? "text-primary" : "text-on-surface-variant"}`}
      >
        {time}
      </span>
      <span
        className={`text-[9px] md:text-[11px] ${isActive ? "text-primary/80" : "text-text-muted"}`}
      >
        {ampm}
      </span>
    </div>
  );
}
