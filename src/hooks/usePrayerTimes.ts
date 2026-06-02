import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Language,
  PrayerTime,
  PrayerTimesState,
  StatusType,
  MosqueConfig,
} from "../types";
import { parseTime, addMinutes } from "../utils/time";
import {
  type EventType,
  type NextEvent,
  EVENT_TYPE_PRIORITY,
  buildStatusFromEvent,
  findNextPrayerIndex,
  findHighlightedIndex,
} from "../utils/prayerStatus";

const PRAYER_META: Record<string, { arabicName: string; isShuruq?: boolean }> =
  {
    Fajr: { arabicName: "الفجر" },
    Shuruq: { arabicName: "الشروق", isShuruq: true },
    Dhuhr: { arabicName: "الظهر" },
    Asr: { arabicName: "العصر" },
    Maghrib: { arabicName: "المغرب" },
    Isha: { arabicName: "العشاء" },
  };

const PRAYER_ORDER: string[] = [
  "Fajr",
  "Shuruq",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

const ALADHAN_KEYS: Record<string, string> = {
  Fajr: "Fajr",
  Shuruq: "Sunrise",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

// Cache for event dates to avoid recalculating every second
interface EventCache {
  prayers: PrayerTime[];
  events: NextEvent[];
}
let eventCache: EventCache | null = null;

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function cacheKeyForConfig(config: MosqueConfig): string {
  return `prayer-times-${todayKey()}-${config.latitude}-${config.longitude}-${config.calculationMethod}`;
}

function normalizeTimeList(times?: string | string[] | null): string[] {
  const list = Array.isArray(times) ? times : times ? [times] : [];
  return list.map((time) => time.trim()).filter(Boolean);
}

function toEventDate(timeStr: string, now: Date): Date {
  const d = parseTime(timeStr.trim());
  // Cache event dates for 65 seconds to avoid recalculating every second
  const STATUS_SIGNAL_WINDOW_MS = 60_000;
  if (d.getTime() - now.getTime() < -STATUS_SIGNAL_WINDOW_MS) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

interface CachedData {
  key: string;
  timings: Record<string, string>;
  hijriDate: string;
}

/**
 * Hook for managing prayer times with optimized state updates.
 * Separates static prayer data from dynamic countdown/status information.
 * This allows the second-by-second updates to be more efficient.
 */
export function usePrayerTimes(
  config: MosqueConfig,
  language: Language = "en",
): PrayerTimesState {
  // Lazy initializer: check localStorage cache immediately so we can
  // render prayer data on the first frame without a loading flash.
  const [state, setState] = useState<PrayerTimesState>(() => {
    const cacheKey = cacheKeyForConfig(config);
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const data: CachedData = JSON.parse(raw);
        if (data.key === cacheKey) {
          const prayers = buildPrayers(data.timings, config);
          return {
            prayers,
            hijriDate: data.hijriDate,
            activePrayerIndex: null,
            nextPrayerIndex: null,
            statusMessage: "",
            statusType: "none",
            criticalSignal: null,
            loading: false,
            error: null,
          };
        }
      }
    } catch {
      // ignore corrupt cache
    }
    return {
      prayers: [],
      hijriDate: "",
      activePrayerIndex: null,
      nextPrayerIndex: null,
      statusMessage: "",
      statusType: "none" as StatusType,
      criticalSignal: null,
      loading: true,
      error: null,
    };
  });

  // Build events list once when prayers load (not on every tick)
  const buildEventsList = useCallback((prayers: PrayerTime[]) => {
    const now = new Date();
    const events: NextEvent[] = [];
    const addEvent = (prayerIndex: number, type: EventType, time: string) => {
      events.push({ prayerIndex, type, date: toEventDate(time, now) });
    };

    for (let i = 0; i < prayers.length; i++) {
      const p = prayers[i];
      if (p.displayOnly) continue;

      if (p.iqamah) addEvent(i, "iqamah", p.iqamah);

      if (p.adhan) {
        addEvent(i, "adhan", p.adhan);
      } else {
        normalizeTimeList(p.times).forEach((time) => addEvent(i, "time", time));
      }
    }

    // Sort events by time and priority
    events.sort(
      (a, b) =>
        a.date.getTime() -
        b.date.getTime() +
        EVENT_TYPE_PRIORITY[a.type] -
        EVENT_TYPE_PRIORITY[b.type],
    );

    eventCache = { prayers, events };
    return events;
  }, []);

  // Update dynamic status every second (lightweight operation)
  const updateDynamicStatus = useCallback(
    (prayers: PrayerTime[], events: NextEvent[]) => {
      const now = new Date();
      const nextEvent = events.length ? events[0] : null;
      const nextIndex = findNextPrayerIndex(nextEvent, events, prayers.length);
      const status = buildStatusFromEvent(prayers, nextEvent, now, language);
      const highlightedIndex = findHighlightedIndex(
        status.statusType,
        nextEvent?.prayerIndex ?? null,
        nextIndex,
      );

      setState((prev) => ({
        ...prev,
        activePrayerIndex: highlightedIndex,
        nextPrayerIndex: nextIndex,
        statusMessage: status.statusMessage,
        statusType: status.statusType,
        criticalSignal: status.criticalSignal,
      }));
    },
    [language],
  );

  // Track whether we've already fetched for the current config to avoid
  // re-fetching when the lazy initializer already provided cached data.
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const cacheKey = cacheKeyForConfig(config);

    // If lazy initializer already loaded valid cache for this config, skip fetch
    if (!hasFetchedRef.current && !state.loading && state.prayers.length > 0) {
      hasFetchedRef.current = true;
      // Still build events cache from initial data
      buildEventsList(state.prayers);
      return;
    }

    hasFetchedRef.current = true;

    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${config.latitude}&longitude=${config.longitude}&method=${config.calculationMethod}`;

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const timings: Record<string, string> = json.data.timings;
        const hijri = json.data.date.hijri;
        const hijriDate = `${hijri.month.en} ${hijri.day}, ${hijri.year} AH`;

        const cacheData: CachedData = {
          key: cacheKey,
          timings,
          hijriDate,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));

        const prayers = buildPrayers(timings, config);
        const events = buildEventsList(prayers);
        setState((prev) => ({
          ...prev,
          prayers,
          hijriDate,
          loading: false,
          error: null,
        }));
        // Update status once for immediate display
        updateDynamicStatus(prayers, events);
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: String(err),
        }));
      });
    // state.loading and state.prayers.length are read only on mount to check
    // if the lazy initializer already populated the cache. They are intentionally
    // excluded to avoid refetching on every state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, buildEventsList, updateDynamicStatus]);

  // Poll every second to keep the status message countdown live
  // This only updates dynamic status, not prayer data
  useEffect(() => {
    if (!state.prayers.length || !eventCache) return;
    const tick = () =>
      updateDynamicStatus(eventCache!.prayers, eventCache!.events);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.prayers.length, updateDynamicStatus]);

  return state;
}

function buildPrayers(
  timings: Record<string, string>,
  config: MosqueConfig,
): PrayerTime[] {
  // Build canonical daily prayers. Upstream data may append admin-defined
  // `extraPrayers` (e.g. khutbahs) which are merged below.
  const basePrayers: PrayerTime[] = PRAYER_ORDER.map((name) => {
    const meta = PRAYER_META[name];
    const aladhanKey = ALADHAN_KEYS[name];
    const raw = timings[aladhanKey];

    if (meta.isShuruq) {
      return {
        name: name as PrayerTime["name"],
        arabicName: meta.arabicName,
        adhan: null,
        iqamah: null,
        times: raw,
      };
    }

    const adhanRaw = raw;
    const offset = config.iqamahOffsets[name] ?? 0;
    const iqamahRaw = addMinutes(raw, offset);

    return {
      name: name as PrayerTime["name"],
      arabicName: meta.arabicName,
      adhan: adhanRaw,
      iqamah: iqamahRaw,
    };
  });

  // Extras can provide iqamah explicitly, or derive it from iqamahOffsets[name].
  const extras: PrayerTime[] = (config.extraPrayers ?? []).map((e) => {
    const timeList = normalizeTimeList(e.times);
    const adhan = e.adhan ?? null;
    const offset = config.iqamahOffsets[e.name];
    const iqamahBase = adhan ?? (timeList.length === 1 ? timeList[0] : null);
    const iqamah =
      e.iqamah ??
      (iqamahBase && offset !== undefined
        ? addMinutes(iqamahBase, offset)
        : null);

    return {
      name: e.name,
      arabicName: e.arabicName ?? e.name,
      adhan: e.adhan,
      iqamah,
      times: e.times,
      displayOnly: e.displayOnly ?? true,
    };
  });

  return [...basePrayers, ...extras];
}
