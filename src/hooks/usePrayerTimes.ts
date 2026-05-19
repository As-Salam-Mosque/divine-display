import { useState, useEffect, useCallback } from "react";
import type {
  Language,
  PrayerTime,
  PrayerTimesState,
  StatusType,
} from "../types";
import type { MosqueConfig } from "../types";
import { translations } from "../i18n";

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

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function addMinutes(timeStr: string, minutes: number): string {
  const d = parseTime(timeStr);
  d.setMinutes(d.getMinutes() + minutes);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatRemaining(targetDate: Date, now: Date) {
  // Return a countdown string in H:mm:ss (omit leading "00" hour)
  const totalSeconds = Math.max(
    0,
    Math.ceil((targetDate.getTime() - now.getTime()) / 1000),
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours === 0) {
    // show MM:SS when under 1 hour (no leading 00:)
    return `${mm}:${ss}`;
  }
  return `${hours}:${mm}:${ss}`;
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
): { message: string; type: StatusType } {
  const t = translations[language];
  // If we're currently before iqamah of the active prayer, show Iqamah countdown
  if (activePrayerIndex !== null) {
    const active = prayers[activePrayerIndex];
    const adhanDate = active.adhan ? parseTime(active.adhan.trim()) : null;
    const iqDate = active.iqamah ? parseTime(active.iqamah.trim()) : null;

    if (iqDate && isWithinSignalWindow(iqDate, now)) {
      return { message: t.statusIqamahNow(active.name), type: "iqamah-now" };
    }

    if (adhanDate && isWithinSignalWindow(adhanDate, now)) {
      return { message: t.statusAdhanNow(active.name), type: "adhan-now" };
    }

    if (iqDate) {
      const adhanFloor = adhanDate ?? new Date(0);
      if (now >= adhanFloor && now < iqDate) {
        return {
          message: t.statusIqamah(active.name, formatRemaining(iqDate, now)),
          type: "iqamah-countdown",
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
      };
    }
  }
  return { message: "", type: "none" };
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
  const [state, setState] = useState<PrayerTimesState>({
    prayers: [],
    hijriDate: "",
    activePrayerIndex: null,
    nextPrayerIndex: null,
    statusMessage: "",
    statusType: "none",
    loading: true,
    error: null,
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

      // Highlight next by default, but if we're before iqamah highlight current
      let highlightedIndex = beforeIqamah ? currentIndex : nextIndex;

      // Special handling for Friday khutbahs: consolidate multiple khutbah entries into one UI
      // Representative selection logic mirrors PrayerTable: pick the next khutbah >= now, otherwise earliest.
      const isFriday = now.getDay() === 5; // 5 === Friday
      if (isFriday) {
        const khutbahIndices = prayers
          .map((p, i) => ({ p, i }))
          .filter(({ p }) => !!p.isKhutbah)
          .map(({ i }) => i);

        if (khutbahIndices.length > 0) {
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const timeToMinutes = (prayer: PrayerTime) => {
            const timeStr = (
              prayer.time ||
              prayer.iqamah ||
              prayer.adhan ||
              ""
            ).trim();
            if (!timeStr) return Number.POSITIVE_INFINITY;
            const [hRaw, mRaw] = timeStr.split(":");
            const h = Number(hRaw);
            const m = Number(mRaw);
            if (Number.isNaN(h) || Number.isNaN(m))
              return Number.POSITIVE_INFINITY;
            return h * 60 + m;
          };

          const upcoming = khutbahIndices.find(
            (i) => timeToMinutes(prayers[i]) >= nowMinutes,
          );
          const representative = upcoming ?? khutbahIndices[0];

          // If the computed highlightedIndex points to any khutbah entry, map it to the representative
          if (
            highlightedIndex !== null &&
            khutbahIndices.includes(highlightedIndex)
          ) {
            highlightedIndex = representative;
          }
          // Note: we intentionally do NOT remap nextIndex here. nextIndex remains the chronological next
          // prayer (which may be another khutbah). This ensures the ClockPanel/status counts toward the
          // actual upcoming prayer time even when the UI shows a consolidated single khutbah card.
        }
      }

      const status = buildStatus(
        prayers,
        currentIndex,
        nextIndex,
        now,
        language,
      );

      setState((prev) => ({
        ...prev,
        activePrayerIndex: highlightedIndex,
        nextPrayerIndex: nextIndex,
        statusMessage: status.message,
        statusType: status.type,
      }));
    },
    [language],
  );

  useEffect(() => {
    const cacheKey = `prayer-times-${todayKey()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data: CachedData = JSON.parse(cached);
        if (data.key === todayKey()) {
          const prayers = buildPrayers(data.timings, config);
          // Defer state update slightly to avoid synchronous setState inside effect
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              prayers,
              hijriDate: data.hijriDate,
              loading: false,
            }));
            deriveDynamic(prayers);
          }, 0);
          return;
        }
      } catch {
        // ignore corrupt cache
      }
    }

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
          key: todayKey(),
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
  // isKhutbah is intentionally left false here by default. Upstream data
  // providers or configuration should explicitly set `isKhutbah: true` for
  // khutbah entries. This removes any name-based heuristic from the codebase.
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
        isKhutbah: false,
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
      isKhutbah: false,
    };
  });

  // Append any admin-supplied extraPrayers from config. Convert ExtraPrayer -> PrayerTime
  // const extras = (config.extraPrayers ?? []).map((e, idx) => {
  const extras = (config.extraPrayers ?? []).map((e) => {
    const adhan = e.adhan ?? e.time ?? null;
    // const iqamah = e.iqamah ?? e.time ?? null;
    return {
      name: e.name as PrayerTime["name"] as PrayerTime["name"],
      arabicName: e.arabicName ?? e.name,
      icon: e.icon ?? "campaign",
      adhan,
      // iqamah,
      time: e.time,
      isKhutbah: !!e.isKhutbah,
    } as PrayerTime;
  });

  return [...basePrayers, ...extras];
}
