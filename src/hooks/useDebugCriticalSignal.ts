import { useT } from "../i18n";
import type {
  CriticalSignalData,
  Language,
  PrayerTime,
  StatusType,
} from "../types";

export interface DebugCriticalOverride {
  statusType: StatusType;
  statusMessage: string;
  criticalSignal: CriticalSignalData;
}

type DebugMode = "adhan" | "iqamah" | "time";

type DebugPrayer = Pick<PrayerTime, "name" | "arabicName">;

const DEFAULT_DEBUG_PRAYERS: Record<string, DebugPrayer> = {
  fajr: { name: "Fajr", arabicName: "الفجر" },
  dhuhr: { name: "Dhuhr", arabicName: "الظهر" },
  asr: { name: "Asr", arabicName: "العصر" },
  maghrib: { name: "Maghrib", arabicName: "المغرب" },
  isha: { name: "Isha", arabicName: "العشاء" },
};

function isDebugMode(value: string | null): value is DebugMode {
  return value === "adhan" || value === "iqamah" || value === "time";
}

export function useDebugCriticalSignal(
  language: Language = "en",
  prayers: PrayerTime[] = [],
): DebugCriticalOverride | null {
  const t = useT(language);

  if (!import.meta.env.DEV || typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("debugCritical");
  if (!isDebugMode(mode)) return null;

  const requestedName = params.get("debugPrayer")?.trim() || "Dhuhr";
  const prayerKey = requestedName.toLowerCase();
  const prayer =
    prayers.find((item) => item.name.trim().toLowerCase() === prayerKey) ??
    DEFAULT_DEBUG_PRAYERS[prayerKey] ?? {
      name: requestedName,
      arabicName: params.get("debugArabicName")?.trim() || requestedName,
    };

  const statusType: StatusType =
    mode === "adhan"
      ? "adhan-now"
      : mode === "iqamah"
        ? "iqamah-now"
        : "time-now";
  const urgency: CriticalSignalData["urgency"] =
    mode === "adhan" ? "low" : mode === "iqamah" ? "high" : "medium";
  const statusMessage =
    mode === "adhan"
      ? t.statusAdhanNow(prayer.name)
      : mode === "iqamah"
        ? t.statusIqamahNow(prayer.name)
        : t.statusTimeNow(prayer.name);

  return {
    statusType,
    statusMessage,
    criticalSignal: {
      prayerName: prayer.name,
      arabicName: prayer.arabicName,
      urgency,
      subtitle: t.criticalSubtitle,
    },
  };
}
