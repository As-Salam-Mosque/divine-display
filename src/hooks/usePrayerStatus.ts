import { useDebugCriticalSignal } from "./useDebugCriticalSignal";
import { usePrayerTimes } from "./usePrayerTimes";
import { isCriticalStatusType } from "../utils/prayerStatus";
import type { Language, MosqueConfig, PrayerTimesState } from "../types";

export interface PrayerStatusState
  extends Omit<
    PrayerTimesState,
    "statusMessage" | "statusType" | "criticalSignal"
  > {
  statusMessage: string;
  statusType: PrayerTimesState["statusType"];
  criticalSignal: PrayerTimesState["criticalSignal"];
  isCriticalSignal: boolean;
}

export function usePrayerStatus(
  config: MosqueConfig,
  language: Language = "en",
): PrayerStatusState {
  const prayerTimes = usePrayerTimes(config, language);
  const debugCritical = useDebugCriticalSignal(language, prayerTimes.prayers);
  const statusType = debugCritical?.statusType ?? prayerTimes.statusType;
  const statusMessage =
    debugCritical?.statusMessage ?? prayerTimes.statusMessage;
  const criticalSignal =
    debugCritical?.criticalSignal ?? prayerTimes.criticalSignal;

  return {
    ...prayerTimes,
    statusMessage,
    statusType,
    criticalSignal,
    isCriticalSignal: isCriticalStatusType(statusType),
  };
}
