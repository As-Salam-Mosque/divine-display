import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { usePrayerStatus } from "../hooks/usePrayerStatus";
import { DEFAULT_APP_SETTINGS, type PrayerTimesState } from "../types";
import { translations } from "../i18n";

vi.mock("../hooks/usePrayerTimes", () => ({
  usePrayerTimes: vi.fn(),
}));

const mockedUsePrayerTimes = vi.mocked(usePrayerTimes);

function createPrayerTimes(
  overrides: Partial<PrayerTimesState> = {},
): PrayerTimesState {
  return {
    prayers: [
      {
        name: "Dhuhr",
        arabicName: "الظهر",
        adhan: "12:00",
        iqamah: "12:10",
      },
    ],
    hijriDate: "Ramadan 1, 1447 AH",
    activePrayerIndex: 0,
    nextPrayerIndex: 0,
    statusMessage: "Dhuhr in 10 minutes",
    statusType: "next-countdown",
    criticalSignal: null,
    loading: false,
    error: null,
    ...overrides,
  };
}

describe("usePrayerStatus", () => {
  beforeEach(() => {
    mockedUsePrayerTimes.mockReturnValue(createPrayerTimes());
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("applies the development critical-signal override", () => {
    window.history.replaceState(
      {},
      "",
      "/?debugCritical=iqamah&debugPrayer=Dhuhr",
    );

    const { result } = renderHook(() =>
      usePrayerStatus(DEFAULT_APP_SETTINGS.mosque, "en"),
    );

    expect(result.current.statusType).toBe("iqamah-now");
    expect(result.current.statusMessage).toBe(
      translations.en.statusIqamahNow("Dhuhr"),
    );
    expect(result.current.criticalSignal).toMatchObject({
      prayerName: "Dhuhr",
      arabicName: "الظهر",
      urgency: "high",
    });
    expect(result.current.isCriticalSignal).toBe(true);
  });

  it("passes through prayer status and derives non-critical state", () => {
    const prayerTimes = createPrayerTimes({
      statusType: "iqamah-countdown",
      statusMessage: "Iqamah for Dhuhr in 2 minutes",
    });
    mockedUsePrayerTimes.mockReturnValue(prayerTimes);

    const { result } = renderHook(() =>
      usePrayerStatus(DEFAULT_APP_SETTINGS.mosque, "en"),
    );

    expect(result.current.statusType).toBe("iqamah-countdown");
    expect(result.current.statusMessage).toBe(
      "Iqamah for Dhuhr in 2 minutes",
    );
    expect(result.current.criticalSignal).toBeNull();
    expect(result.current.isCriticalSignal).toBe(false);
  });

  it.each(["adhan-now", "iqamah-now", "time-now"] as const)(
    "marks %s as critical",
    (statusType) => {
      mockedUsePrayerTimes.mockReturnValue(createPrayerTimes({ statusType }));

      const { result } = renderHook(() =>
        usePrayerStatus(DEFAULT_APP_SETTINGS.mosque, "en"),
      );

      expect(result.current.isCriticalSignal).toBe(true);
    },
  );
});
