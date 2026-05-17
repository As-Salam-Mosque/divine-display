import { useState, useEffect, useCallback } from "react";
import type { Language, PrayerTime, PrayerTimesState } from "../types";
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

function formatTime12(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
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

function buildStatusMessage(
  prayers: PrayerTime[],
  activePrayerIndex: number | null,
  nextPrayerIndex: number | null,
  now: Date,
  language: Language,
): string {
  const t = translations[language];
  // If we're currently before iqamah of the active prayer, show Iqamah countdown
  if (activePrayerIndex !== null) {
    const active = prayers[activePrayerIndex];
    if (active.iqamah) {
      const parts = active.iqamah.trim().split(" ");
      const [h, m] = parts[0].split(":").map(Number);
      const ampm = parts[1];
      const h24 =
        ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
      const iqDate = new Date();
      iqDate.setHours(h24, m, 0, 0);
      if (
        now >=
          (function () {
            // determine adhan date for active
            if (active.adhan) {
              const aParts = active.adhan.trim().split(" ");
              const [ah, am] = aParts[0].split(":").map(Number);
              const aAmpm = aParts[1];
              const aH24 =
                aAmpm === "PM" && ah !== 12
                  ? ah + 12
                  : aAmpm === "AM" && ah === 12
                    ? 0
                    : ah;
              const adhanDate = new Date();
              adhanDate.setHours(aH24, am, 0, 0);
              return adhanDate;
            }
            // if no adhan (like shuruq), return epoch to avoid triggering
            return new Date(0);
          })() &&
        now < iqDate
      ) {
        return t.statusIqamah(active.name, formatRemaining(iqDate, now));
      }
    }
  }

  // Otherwise, show next prayer countdown
  if (nextPrayerIndex !== null) {
    const next = prayers[nextPrayerIndex];
    const nextAdhan = next.adhan ?? next.time ?? null;
    if (nextAdhan) {
      const raw = nextAdhan.trim();
      const parts = raw.split(" ");
      const [h, m] = parts[0].split(":").map(Number);
      const ampm = parts[1];
      const h24 =
        ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
      const nextDate = new Date();
      nextDate.setHours(h24, m, 0, 0);
      if (nextDate.getTime() <= now.getTime()) {
        // next is tomorrow's first prayer
        nextDate.setDate(nextDate.getDate() + 1);
      }
      return t.statusNext(next.name, formatRemaining(nextDate, now));
    }
  }
  return "";
}

interface CachedData {
  key: string;
  timings: Record<string, string>;
  hijriDate: string;
}

export function usePrayerTimes(config: MosqueConfig, language: Language = "en"): PrayerTimesState {
  const [state, setState] = useState<PrayerTimesState>({
    prayers: [],
    hijriDate: "",
    activePrayerIndex: null,
    nextPrayerIndex: null,
    statusMessage: "",
    loading: true,
    error: null,
  });

  const deriveDynamic = useCallback((prayers: PrayerTime[]) => {
    const now = new Date();
    let currentIndex: number | null = null;
    let nextIndex: number | null = null;

    // Find current (last prayer whose adhan has passed) and next
    for (let i = 0; i < prayers.length; i++) {
      const prayer = prayers[i];
      const adhanStr = prayer.adhan ?? prayer.time ?? null;
      if (!adhanStr) continue;
      const raw = adhanStr.trim().split(" ");
      const [h, m] = raw[0].split(":").map(Number);
      const ampm = raw[1];
      const h24 =
        ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h;
      const prayerDate = new Date();
      prayerDate.setHours(h24, m, 0, 0);

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
        const parts = current.iqamah.trim().split(" ");
        const [h, m] = parts[0].split(":").map(Number);
        const ampm = parts[1];
        const h24 =
          ampm === "PM" && h !== 12
            ? h + 12
            : ampm === "AM" && h === 12
              ? 0
              : h;
        const iqDate = new Date();
        iqDate.setHours(h24, m, 0, 0);

        // determine adhan date/time
        let adhanDate = new Date(0);
        if (current.adhan) {
          const aParts = current.adhan.trim().split(" ");
          const [ah, am] = aParts[0].split(":").map(Number);
          const aAmpm = aParts[1];
          const aH24 =
            aAmpm === "PM" && ah !== 12
              ? ah + 12
              : aAmpm === "AM" && ah === 12
                ? 0
                : ah;
          adhanDate = new Date();
          adhanDate.setHours(aH24, am, 0, 0);
        }

        if (now >= adhanDate && now < iqDate) beforeIqamah = true;
      }
    }

    // Highlight next by default, but if we're before iqamah highlight current
    const highlightedIndex = beforeIqamah ? currentIndex : nextIndex;

    const statusMessage = buildStatusMessage(
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
      statusMessage,
    }));
  }, [language]);

  useEffect(() => {
    const cacheKey = `prayer-times-${todayKey()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data: CachedData = JSON.parse(cached);
        if (data.key === todayKey()) {
          const prayers = buildPrayers(data.timings, config);
          setState((prev) => ({
            ...prev,
            prayers,
            hijriDate: data.hijriDate,
            loading: false,
          }));
          deriveDynamic(prayers);
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
  return PRAYER_ORDER.map((name) => {
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
        time: formatTime12(raw),
      };
    }

    const adhanFormatted = formatTime12(raw);
    const offset = config.iqamahOffsets[name] ?? 0;
    const iqamahFormatted = formatTime12(addMinutes(raw, offset));

    return {
      name: name as PrayerTime["name"],
      arabicName: meta.arabicName,
      icon: meta.icon,
      adhan: adhanFormatted,
      iqamah: iqamahFormatted,
    };
  });
}
