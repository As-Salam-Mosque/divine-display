// Shared helpers for the unified `PrayerTime.schedule` field: each entry is
// either a 3-letter weekday abbreviation (weekly recurrence) or an ISO date
// "YYYY-MM-DD" (one-off occurrence, e.g. Eid).

export const WEEKDAY_ABBR = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export function isWeekdayAbbr(value: string): boolean {
  return (WEEKDAY_ABBR as readonly string[]).includes(
    value.trim().toLowerCase(),
  );
}

export function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * An extra prayer is "scheduled" today when `schedule` contains either the
 * current weekday's abbreviation (recurring) or today's ISO date (one-off).
 * Entries without a schedule (or an empty one) are never scheduled.
 */
export function isScheduledToday(
  schedule: string[] | undefined,
  now: Date,
): boolean {
  if (!schedule || schedule.length === 0) return false;
  const todayAbbr = WEEKDAY_ABBR[now.getDay()];
  const todayISO = toISODateLocal(now);
  return schedule.some((entry) => {
    const normalized = entry.trim().toLowerCase();
    return normalized === todayAbbr || normalized === todayISO;
  });
}

/**
 * Derives `PrayerTime.displayOnly` from `schedule` instead of storing it as
 * a separate flag, so the two can never drift out of sync.
 *
 * `schedule === undefined` marks a base prayer (Fajr, Dhuhr, ...), which is
 * never display-only. Extra prayers always carry a `schedule` array (empty
 * when unconfigured) and are display-only unless it matches today via
 * `isScheduledToday`.
 */
export function isDisplayOnly(
  schedule: string[] | undefined,
  now: Date = new Date(),
): boolean {
  return schedule !== undefined && !isScheduledToday(schedule, now);
}
