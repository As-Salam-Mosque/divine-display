export interface FormattedTime {
  time: string;
  ampm: string;
}

/**
 * Formats a raw "HH:MM" time string into the user's preferred display format.
 */
export function formatDisplayTime(
  timeStr: string,
  timeFormat: "12h" | "24h",
): FormattedTime {
  const [hRaw, mRaw] = timeStr.trim().split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);

  if (Number.isNaN(h) || Number.isNaN(m)) {
    return { time: timeStr, ampm: "" };
  }

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

/**
 * Parses a "HH:MM" string into a Date object set to today.
 */
export function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Adds minutes to a "HH:MM" string and returns the new "HH:MM" string.
 */
export function addMinutes(timeStr: string, minutes: number): string {
  const d = parseTime(timeStr);
  d.setMinutes(d.getMinutes() + minutes);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Formats the remaining time between two dates as a countdown string.
 * Returns "MM:SS" when under 1 hour, or "H:MM:SS" otherwise.
 */
export function formatRemaining(targetDate: Date, now: Date): string {
  const totalSeconds = Math.max(
    0,
    Math.ceil((targetDate.getTime() - now.getTime()) / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours === 0 ? `${mm}:${ss}` : `${hours}:${mm}:${ss}`;
}
