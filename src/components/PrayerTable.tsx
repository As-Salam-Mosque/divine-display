import type { PrayerTime } from "../types";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-5 overflow-visible py-2 -my-2"
      role="list"
      aria-label="Prayer times"
    >
      {prayers.map((prayer, index) => (
        <PrayerCard
          key={prayer.name}
          prayer={prayer}
          isActive={activePrayerIndex === index}
        />
      ))}
    </div>
  );
}
