import { useState, useEffect, useCallback, useRef } from "react";
import type {
  Language,
  PrayerTime,
  PrayerTimesState,
  StatusType,
  CriticalSignalData,
  MosqueConfig,
} from "../types";
import { translations } from "../i18n";
import { parseTime, addMinutes, formatRemaining } from "../utils/time";

const PRAYER_META: Record<
  string,
  { arabicName: string; isShuruq?: boolean }
> = {
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

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function cacheKeyForConfig(config: MosqueConfig): string {
  return `prayer-times-${todayKey()}-${config.latitude}-${config.longitude}-${config.calculationMethod}`;
}

const STATUS_SIGNAL_WINDOW_MS = 60_000;

function normalizeTimeList(times?: string | string[] | null): string[] {
  const list = Array.isArray(times) ? times : times ? [times] : [];
  return list.map((time) => time.trim()).filter(Boolean);
}

function isWithinSignalWindow(targetDate: Date, now: Date): boolean {
  return (
    now.getTime() >= targetDate.getTime() &&
    now.getTime() < targetDate.getTime() + STATUS_SIGNAL_WINDOW_MS
  );
}

type EventType = "iqamah" | "adhan" | "time";

const EVENT_TYPE_PRIORITY: Record<EventType, number> = {
  adhan: 0,
  iqamah: 1,
  time: 2,
};

function toEventDate(timeStr: string, now: Date): Date {
  const d = parseTime(timeStr.trim());
  if (d.getTime() - now.getTime() < -STATUS_SIGNAL_WINDOW_MS) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function buildStatusFromEvent(
  prayers: PrayerTime[],
  nextEvent: { prayerIndex: number; type: EventType; date: Date } | null,
  now: Date,
  language: Language,
): {
  message: string;
  type: StatusType;
  criticalSignal: CriticalSignalData | null;
} {
  const t = translations[language];
  if (!nextEvent) return { message: "", type: "none", criticalSignal: null };

  const p = prayers[nextEvent.prayerIndex];
  const { type, date } = nextEvent;

  // Critical signal windows
  if (type === "iqamah" && isWithinSignalWindow(date, now)) {
    return {
      message: t.statusIqamahNow(p.name),
      type: "iqamah-now",
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
      message: t.statusAdhanNow(p.name),
      type: "adhan-now",
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
      message: t.statusIqamah(p.name, formatRemaining(date, now)),
      type: "iqamah-countdown",
      criticalSignal: null,
    };
  }

  // For adhan or time, show next countdown label
  return {
    message: t.statusNext(p.name, formatRemaining(date, now)),
    type: "next-countdown",
    criticalSignal: null,
  };
}

interface CachedData {
  key: string;
  timings: Record<string, string>;
  hijriDate: string;
}

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
            statusType: "none" as StatusType,
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
      statusType: "none",
      criticalSignal: null,
      loading: true,
      error: null,
    };
  });

  const deriveDynamic = useCallback(
    (prayers: PrayerTime[]) => {
      const now = new Date();
      const events: { prayerIndex: number; type: EventType; date: Date }[] = [];
      const addEvent = (prayerIndex: number, type: EventType, time: string) => {
        events.push({ prayerIndex, type, date: toEventDate(time, now) });
      };

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        if (p.iqamah) addEvent(i, "iqamah", p.iqamah);

        if (p.adhan) {
          addEvent(i, "adhan", p.adhan);
        } else {
          normalizeTimeList(p.times).forEach((time) =>
            addEvent(i, "time", time),
          );
        }
      }

      // Pick the soonest event by sorting events by their absolute Date
      events.sort(
        (a, b) =>
          a.date.getTime() -
          b.date.getTime() +
          EVENT_TYPE_PRIORITY[a.type] -
          EVENT_TYPE_PRIORITY[b.type],
      );
      const nextEvent = events.length ? events[0] : null;
      const nextPrayerEvent =
        events.find((event) => event.type !== "iqamah") ?? null;
      const nextIndex = nextPrayerEvent
        ? nextPrayerEvent.prayerIndex
        : prayers.length
          ? 0
          : null;

      const status = buildStatusFromEvent(prayers, nextEvent, now, language);

      // Determine highlighted index: by default use the prayer associated with the next event.
      // Preserve previous behavior: during iqamah-now the current prayer is starting — highlight the next prayer instead
      const highlightedIndex =
        status.type === "iqamah-now"
          ? nextIndex
          : (nextEvent?.prayerIndex ?? nextIndex);

      setState((prev) => ({
        ...prev,
        activePrayerIndex: highlightedIndex,
        nextPrayerIndex: nextIndex,
        statusMessage: status.message,
        statusType: status.type,
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
        setState((prev) => ({
          ...prev,
          prayers,
          hijriDate,
          loading: false,
          error: null,
        }));
        deriveDynamic(prayers);
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
  }, [config, deriveDynamic]);

  // Poll every second to keep the status message countdown live
  useEffect(() => {
    if (!state.prayers.length) return;
    const tick = () => deriveDynamic(state.prayers);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.prayers, deriveDynamic]);

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
    };
  });

  return [...basePrayers, ...extras];
}
