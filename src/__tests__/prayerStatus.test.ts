import { describe, expect, it } from "vitest";
import { translations } from "../i18n";
import {
  buildStatusFromEvent,
  STATUS_SIGNAL_WINDOW_MS,
  type NextEvent,
} from "../utils/prayerStatus";
import type { PrayerTime } from "../types";

const extraPrayer: PrayerTime = {
  name: "Khutbah 1",
  arabicName: "خطبة 1",
  adhan: null,
  iqamah: null,
  times: "13:00",
  schedule: ["fri"],
};

function eventAt(date: Date): NextEvent {
  return {
    prayerIndex: 0,
    type: "time",
    date,
  };
}

describe("buildStatusFromEvent time signals", () => {
  it("builds a medium-urgency critical signal for a time-only PrayerTime", () => {
    const eventDate = new Date("2026-07-25T13:00:00");
    const now = new Date(eventDate.getTime() + 30_000);

    const result = buildStatusFromEvent(
      [extraPrayer],
      eventAt(eventDate),
      now,
      "en",
    );

    expect(result).toEqual({
      statusMessage: translations.en.statusTimeNow("Khutbah 1"),
      statusType: "time-now",
      criticalSignal: {
        prayerName: "Khutbah 1",
        arabicName: "خطبة 1",
        urgency: "medium",
        subtitle: translations.en.criticalSubtitle,
      },
    });
  });

  it("keeps a time-only event as a countdown outside the signal window", () => {
    const eventDate = new Date("2026-07-25T13:00:00");
    const now = new Date(eventDate.getTime() + STATUS_SIGNAL_WINDOW_MS);

    const result = buildStatusFromEvent(
      [extraPrayer],
      eventAt(eventDate),
      now,
      "en",
    );

    expect(result.statusType).toBe("next-countdown");
    expect(result.criticalSignal).toBeNull();
  });
});
