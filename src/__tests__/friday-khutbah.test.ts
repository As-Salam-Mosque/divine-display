import { describe, it, expect } from "vitest";
import type { PrayerTime } from "../types";
import { selectRepresentativeKhutbah, mapHighlightedIndexForKhutbah, renderedPrayerIndices } from "../lib/khutbah";

function makePrayer(time: string, isKhutbah = false): PrayerTime {
  return {
    name: "Dhuhr",
    arabicName: "الظهر",
    icon: "light_mode",
    adhan: time,
    iqamah: time,
    time,
    isKhutbah,
  };
}

describe("Friday khutbah consolidation helpers", () => {
  it("selects the next khutbah >= now, otherwise earliest (wrap)", () => {
    // Create three khutbah entries at 12:00, 13:00, 15:00
    const prayers: PrayerTime[] = [
      makePrayer("12:00", true), // idx 0
      makePrayer("13:00", true), // idx 1
      makePrayer("15:00", true), // idx 2
    ];

    // now = 12:30 -> should pick 13:00 (idx 1)
    const now1 = new Date("2026-05-15T12:30:00"); // Friday
    expect(selectRepresentativeKhutbah(prayers, now1)).toBe(1);

    // now = 15:30 -> none remaining, should wrap to earliest (idx 0)
    const now2 = new Date("2026-05-15T15:30:00");
    expect(selectRepresentativeKhutbah(prayers, now2)).toBe(0);

    // now before first: 11:00 -> picks idx 0
    const now3 = new Date("2026-05-15T11:00:00");
    expect(selectRepresentativeKhutbah(prayers, now3)).toBe(0);
  });

  it("maps highlighted index pointing to any khutbah to the representative", () => {
    const prayers: PrayerTime[] = [
      makePrayer("12:00", true), // 0
      makePrayer("13:00", true), // 1
      makePrayer("15:00", true), // 2
      makePrayer("18:00", false),
    ];

    const now = new Date("2026-05-15T12:30:00"); // rep = 1
    expect(selectRepresentativeKhutbah(prayers, now)).toBe(1);

    // If highlighted is 0 (a khutbah), mapping should produce 1
    expect(mapHighlightedIndexForKhutbah(prayers, 0, now)).toBe(1);

    // If highlighted is 3 (non-khutbah), mapping returns same
    expect(mapHighlightedIndexForKhutbah(prayers, 3, now)).toBe(3);
  });

  it("renderedPrayerIndices returns only representative khutbah on Friday", () => {
    const prayers: PrayerTime[] = [
      makePrayer("12:00", true), // 0
      makePrayer("13:00", true), // 1
      makePrayer("15:00", true), // 2
      makePrayer("18:00", false), // 3
    ];

    const now = new Date("2026-05-15T12:30:00"); // Friday
    const rendered = renderedPrayerIndices(prayers, now);
    // Should include indices 1 (rep) and 3
    expect(rendered).toEqual([1, 3]);

    // Non-Friday: return all
    const saturday = new Date("2026-05-16T12:30:00");
    expect(renderedPrayerIndices(prayers, saturday)).toEqual([0,1,2,3]);
  });
});
