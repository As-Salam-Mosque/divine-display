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
  { arabicName: string; icon: string; isShuruq?: boolean }
> = {
  Fajr: { arabicName: "الفجر", icon: "partly_cloudy_night" },
  Shuruq: { arabicName: "الشروق", icon: "wb_twilight", isShuruq: true },
  Dhuhr: { arabicName: "الظهر", icon: "light_mode" },
  Asr: { arabicName: "العصر", icon: "wb_sunny" },
  Maghrib: { arabicName: "المغرب", icon: "nights_stay" },
  Isha: { arabicName: "العشاء", icon: "bedtime" },
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

function isWithinSignalWindow(targetDate: Date, now: Date): boolean {
  return (
    now.getTime() >= targetDate.getTime() &&
    now.getTime() < targetDate.getTime() + STATUS_SIGNAL_WINDOW_MS
  );
}

function buildStatus(
  prayers: PrayerTime[],
  activePrayerIndex: number | null,
  nextPrayerIndex: number | null,
  now: Date,
  language: Language,
): {
  message: string;
  type: StatusType;
  criticalSignal: CriticalSignalData | null;
} {
  const t = translations[language];
  // If we're currently before iqamah of the active prayer, show Iqamah countdown
  if (activePrayerIndex !== null) {
    const active = prayers[activePrayerIndex];
    const adhanDate = active.adhan ? parseTime(active.adhan.trim()) : null;
    const iqDate = active.iqamah ? parseTime(active.iqamah.trim()) : null;

    if (iqDate && isWithinSignalWindow(iqDate, now)) {
      return {
        message: t.statusIqamahNow(active.name),
        type: "iqamah-now",
        criticalSignal: {
          prayerName: active.name,
          arabicName: active.arabicName,
          urgency: "high",
          subtitle: t.criticalSubtitle,
        },
      };
    }

    if (adhanDate && isWithinSignalWindow(adhanDate, now)) {
      return {
        message: t.statusAdhanNow(active.name),
        type: "adhan-now",
        criticalSignal: {
          prayerName: active.name,
          arabicName: active.arabicName,
          urgency: "low",
          subtitle: t.criticalSubtitle,
        },
      };
    }

    if (iqDate) {
      const adhanFloor = adhanDate ?? new Date(0);
      if (now >= adhanFloor && now < iqDate) {
        return {
          message: t.statusIqamah(active.name, formatRemaining(iqDate, now)),
          type: "iqamah-countdown",
          criticalSignal: null,
        };
      }
    }
  }

  // Otherwise, show next prayer countdown
  if (nextPrayerIndex !== null) {
    const next = prayers[nextPrayerIndex];
    const nextAdhan = next.adhan ?? next.time ?? null;
    if (nextAdhan) {
      const nextDate = parseTime(nextAdhan.trim());
      if (nextDate.getTime() <= now.getTime()) {
        // next is tomorrow's first prayer
        nextDate.setDate(nextDate.getDate() + 1);
      }
      return {
        message: t.statusNext(next.name, formatRemaining(nextDate, now)),
        type: "next-countdown",
        criticalSignal: null,
      };
    }
  }
  return { message: "", type: "none", criticalSignal: null };
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
      let currentIndex: number | null = null;
      let nextIndex: number | null = null;

      // Find current (last prayer whose adhan has passed) and next
      for (let i = 0; i < prayers.length; i++) {
        const prayer = prayers[i];
        const adhanStr = prayer.adhan ?? prayer.time ?? null;
        if (!adhanStr) continue;
        const prayerDate = parseTime(adhanStr.trim());

        if (prayerDate <= now) {
          currentIndex = i;
        } else if (nextIndex === null) {
          nextIndex = i;
        }
      }

      // if there is no next (all prayers passed), wrap to first
      if (nextIndex === null && prayers.length) nextIndex = 0;

      // Determine whether we're before iqamah of the current prayer
      let beforeIqamah = false;
      if (currentIndex !== null) {
        const current = prayers[currentIndex];
        if (current.iqamah) {
          const iqDate = parseTime(current.iqamah.trim());

          // determine adhan date/time
          let adhanDate = new Date(0);
          if (current.adhan) {
            adhanDate = parseTime(current.adhan.trim());
          }

          if (now >= adhanDate && now < iqDate) beforeIqamah = true;
        }
      }

      // Highlight next by default, but if we're between adhan and iqamah highlight current
      const beforeIqamahHighlight = beforeIqamah ? currentIndex : nextIndex;

      const status = buildStatus(
        prayers,
        currentIndex,
        nextIndex,
        now,
        language,
      );

      // During iqamah-now the current prayer is starting — highlight the next prayer instead
      const highlightedIndex =
        status.type === "iqamah-now" ? nextIndex : beforeIqamahHighlight;

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
        icon: meta.icon,
        adhan: null,
        iqamah: null,
        // Keep raw 24-hour HH:MM for centralized formatting in UI
        time: raw,
      };
    }

    const adhanRaw = raw;
    const offset = config.iqamahOffsets[name] ?? 0;
    const iqamahRaw = addMinutes(raw, offset);

    return {
      name: name as PrayerTime["name"],
      arabicName: meta.arabicName,
      icon: meta.icon,
      // Store raw 24-hour HH:MM strings
      adhan: adhanRaw,
      iqamah: iqamahRaw,
    };
  });

  // Append any admin-supplied extraPrayers from config.
  // Extras can provide iqamah explicitly, or derive it from iqamahOffsets[name].
  const extras: PrayerTime[] = (config.extraPrayers ?? []).map((e) => {
    const adhan = e.adhan ?? e.time ?? null;
    const offset = config.iqamahOffsets[e.name];
    const iqamah =
      e.iqamah ??
      (adhan && offset !== undefined ? addMinutes(adhan, offset) : null);

    return {
      name: e.name,
      arabicName: e.arabicName ?? e.name,
      icon: e.icon ?? "campaign",
      adhan,
      iqamah,
      time: e.time,
    };
  });

  return [...basePrayers, ...extras];
}
