import type { PrayerTime } from "../types";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  // CSS-first responsive grid using auto-fit/minmax; keeps cards responsive
  // without JS. Minimum card width = 220px (matches previous CARD_MIN_PX).
  return (
    <ul
      className="grid gap-2 py-1 h-full min-h-0"
      aria-label="Prayer times"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))` }}
    >
      {prayers.map((prayer, index) => {
        const isActive = activePrayerIndex === index;

        return (
          <PrayerCard
            key={`${prayer.name}-${index}`}
            prayer={prayer}
            isActive={isActive}
          />
        );
      })}
    </ul>
  );
}
