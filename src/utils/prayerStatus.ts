/**
 * Utility functions for deriving dynamic prayer status information
 * Separated from static prayer data to enable efficient partial updates
 */

import type {
  Language,
  PrayerTime,
  StatusType,
  CriticalSignalData,
} from "../types";
import { translations } from "../i18n";
import { formatRemaining } from "./time";

export type EventType = "iqamah" | "adhan" | "time";

export const EVENT_TYPE_PRIORITY: Record<EventType, number> = {
  adhan: 0,
  iqamah: 1,
  time: 2,
};

export const STATUS_SIGNAL_WINDOW_MS = 60_000;

export function isWithinSignalWindow(targetDate: Date, now: Date): boolean {
  return (
    now.getTime() >= targetDate.getTime() &&
    now.getTime() < targetDate.getTime() + STATUS_SIGNAL_WINDOW_MS
  );
}

export interface DynamicPrayerStatus {
  activePrayerIndex: number | null;
  nextPrayerIndex: number | null;
  statusMessage: string;
  statusType: StatusType;
  criticalSignal: CriticalSignalData | null;
}

export interface NextEvent {
  prayerIndex: number;
  type: EventType;
  date: Date;
}

/**
 * Build status message and type based on next event
 * This is the hot path that runs every second
 */
export function buildStatusFromEvent(
  prayers: PrayerTime[],
  nextEvent: NextEvent | null,
  now: Date,
  language: Language,
): Pick<
  DynamicPrayerStatus,
  "statusMessage" | "statusType" | "criticalSignal"
> {
  const t = translations[language];
  if (!nextEvent)
    return { statusMessage: "", statusType: "none", criticalSignal: null };

  const p = prayers[nextEvent.prayerIndex];
  const { type, date } = nextEvent;

  // Critical signal windows
  if (type === "iqamah" && isWithinSignalWindow(date, now)) {
    return {
      statusMessage: t.statusIqamahNow(p.name),
      statusType: "iqamah-now",
      criticalSignal: {
        prayerName: p.name,
        arabicName: p.arabicName,
        urgency: "high",
        subtitle: t.criticalSubtitle,
      },
    };
  }

  if (type === "adhan" && isWithinSignalWindow(date, now)) {
    return {
      statusMessage: t.statusAdhanNow(p.name),
      statusType: "adhan-now",
      criticalSignal: {
        prayerName: p.name,
        arabicName: p.arabicName,
        urgency: "low",
        subtitle: t.criticalSubtitle,
      },
    };
  }

  // Non-critical countdowns
  if (type === "iqamah") {
    return {
      statusMessage: t.statusIqamah(p.name, formatRemaining(date, now)),
      statusType: "iqamah-countdown",
      criticalSignal: null,
    };
  }

  // For adhan or time, show next countdown label
  return {
    statusMessage: t.statusNext(p.name, formatRemaining(date, now)),
    statusType: "next-countdown",
    criticalSignal: null,
  };
}

/**
 * Find the next prayer index (ignoring iqamah countdown)
 */
export function findNextPrayerIndex(
  nextEvent: NextEvent | null,
  events: NextEvent[],
  prayerCount: number,
): number | null {
  if (!nextEvent) return prayerCount > 0 ? 0 : null;

  // If nextEvent is not iqamah, return its prayerIndex
  if (nextEvent.type !== "iqamah") return nextEvent.prayerIndex;

  // Otherwise, find the first event after nextEvent.date which is not iqamah
  const nextIndex = events.findIndex(
    (event) => event.type !== "iqamah" && event.date > nextEvent.date
  );

  if (nextIndex === -1) {
    return prayerCount > 0 ? 0 : null;
  }

  return events[nextIndex].prayerIndex;
}


/**
 * Determine which prayer to highlight
 * During iqamah, highlight the next prayer instead of current
 */
export function findHighlightedIndex(
  statusType: StatusType,
  nextEventIndex: number | null,
  nextPrayerIndex: number | null,
): number | null {
  return statusType === "iqamah-now" ? nextPrayerIndex : nextEventIndex;
}
