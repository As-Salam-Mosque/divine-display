import type { PrayerTime } from "../types";
import { PrayerCard } from "./PrayerCard";

interface PrayerTableProps {
  prayers: PrayerTime[];
  activePrayerIndex: number | null;
}

function timeToMinutes(prayer: PrayerTime) {
  const timeStr = (prayer.time || prayer.iqamah || prayer.adhan || "").trim();
  if (!timeStr) return Number.POSITIVE_INFINITY;
  const [hRaw, mRaw] = timeStr.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
  return h * 60 + m;
}

export function PrayerTable({ prayers, activePrayerIndex }: PrayerTableProps) {
  const today = new Date();
  const isFriday = today.getDay() === 5; // 5 === Friday (0 = Sunday)

  const khutbahIndices = prayers
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !!p.isKhutbah)
    .map(({ i }) => i);

  // If it's Friday and we have khutbah entries, pick a single representative to display.
  // There can be multiple khutbah times in the source data, but the UI should show only one card.
  let selectedKhutbahIndex: number | null = null;
  if (isFriday && khutbahIndices.length > 0) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    // Prefer the next khutbah whose time is >= now, otherwise fall back to the earliest (wrap)
    const upcoming = khutbahIndices.find(
      (i) => timeToMinutes(prayers[i]) >= nowMinutes,
    );
    selectedKhutbahIndex = upcoming ?? khutbahIndices[0];
  }

  return (
    <div
      className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 tv:gap-8 overflow-visible py-2 -my-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]"
      role="list"
      aria-label="Prayer times"
    >
      {prayers
        .map((prayer, index) => {
          // When we've consolidated khutbahs, only render the selected khutbah index and skip the rest
          if (
            selectedKhutbahIndex !== null &&
            khutbahIndices.includes(index) &&
            index !== selectedKhutbahIndex
          ) {
            return null;
          }

          const isActive = activePrayerIndex === index;

          return (
            <PrayerCard
              key={`${prayer.name}-${index}`}
              prayer={prayer}
              isActive={isActive}
            />
          );
        })
        // filter out the nulls from skipped khutbah entries
        .filter(Boolean)}
    </div>
  );
}
