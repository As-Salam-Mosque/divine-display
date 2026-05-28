import type { PrayerTime } from "../types";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  return (
    <ul
      className="grid w-full h-full min-h-0 gap-2 py-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-6"
      aria-label="Prayer times"
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
