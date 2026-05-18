import type { PrayerTime } from "../types";

export function timeStrToMinutes(timeStr: string | undefined | null) {
  if (!timeStr) return Number.POSITIVE_INFINITY;
  const parts = timeStr.trim().split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? "0");
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
  return h * 60 + m;
}

export function findKhutbahIndices(prayers: PrayerTime[]) {
  return prayers
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !!p.isKhutbah)
    .map(({ i }) => i);
}

export function selectRepresentativeKhutbah(prayers: PrayerTime[], now: Date): number | null {
  const khutbahIndices = findKhutbahIndices(prayers);
  if (khutbahIndices.length === 0) return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = khutbahIndices.find((i) => timeStrToMinutes(prayers[i].time || prayers[i].iqamah || prayers[i].adhan) >= nowMinutes);
  return upcoming ?? khutbahIndices[0];
}

export function mapHighlightedIndexForKhutbah(prayers: PrayerTime[], highlightedIndex: number | null, now: Date): number | null {
  if (highlightedIndex === null) return null;
  const khutbahIndices = findKhutbahIndices(prayers);
  if (khutbahIndices.length === 0) return highlightedIndex;
  if (!khutbahIndices.includes(highlightedIndex)) return highlightedIndex;
  return selectRepresentativeKhutbah(prayers, now);
}

export function renderedPrayerIndices(prayers: PrayerTime[], now: Date): number[] {
  const isFriday = now.getDay() === 5;
  const khutbahIndices = findKhutbahIndices(prayers);
  if (!isFriday || khutbahIndices.length === 0) return prayers.map((_, i) => i);

  const representative = selectRepresentativeKhutbah(prayers, now)!;
  return prayers
    .map((_, i) => i)
    .filter((i) => !khutbahIndices.includes(i) || i === representative);
}
