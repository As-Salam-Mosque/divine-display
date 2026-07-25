import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebugCriticalSignal } from "../hooks/useDebugCriticalSignal";
import type { PrayerTime } from "../types";

const extraPrayer: PrayerTime = {
  name: "Khutbah 1",
  arabicName: "خطبة 1",
  adhan: null,
  iqamah: null,
  times: "13:00",
  schedule: ["fri"],
};

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("useDebugCriticalSignal", () => {
  it("uses the configured PrayerTime for an extra prayer", () => {
    window.history.replaceState(
      {},
      "",
      "/?debugCritical=time&debugPrayer=Khutbah%201",
    );

    const { result } = renderHook(() =>
      useDebugCriticalSignal("en", [extraPrayer]),
    );

    expect(result.current).toMatchObject({
      statusType: "time-now",
      statusMessage: "Khutbah 1 is now — come to prayer",
      criticalSignal: {
        prayerName: "Khutbah 1",
        arabicName: "خطبة 1",
        urgency: "medium",
      },
    });
  });

  it("supports an arbitrary prayer name with a supplied Arabic name", () => {
    window.history.replaceState(
      {},
      "",
      "/?debugCritical=iqamah&debugPrayer=Eid%20Prayer&debugArabicName=%D8%B5%D9%84%D8%A7%D8%A9%20%D8%A7%D9%84%D8%B9%D9%8A%D8%AF",
    );

    const { result } = renderHook(() => useDebugCriticalSignal("en"));

    expect(result.current?.criticalSignal).toMatchObject({
      prayerName: "Eid Prayer",
      arabicName: "صلاة العيد",
      urgency: "high",
    });
  });
});
