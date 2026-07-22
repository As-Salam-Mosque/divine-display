import { describe, expect, it } from "vitest";
import {
  configToForm,
  formToConfig,
  mapValidationLocToFieldId,
} from "../utils/dashboardForm";

describe("dashboardForm utils", () => {
  it("maps validation locations to dashboard field IDs", () => {
    expect(mapValidationLocToFieldId(["body", "configuration", "name"])).toBe(
      "cfg-name",
    );
    expect(mapValidationLocToFieldId(["body", "configuration", "logo"])).toBe(
      "cfg-logo",
    );
    expect(
      mapValidationLocToFieldId([
        "body",
        "configuration",
        "adRailSlots",
        2,
        "sponsorId",
      ]),
    ).toBe("ad-rail-sponsor-2");
    expect(
      mapValidationLocToFieldId([
        "body",
        "configuration",
        "extraPrayers",
        1,
        "iqamah",
      ]),
    ).toBe("ep-iqamah-1");
    expect(
      mapValidationLocToFieldId([
        "body",
        "configuration",
        "extraPrayers",
        1,
        "schedule",
      ]),
    ).toBe("ep-days-1-sun");
  });

  it("converts configuration payload into dashboard form state", () => {
    const form = configToForm({
      name: "Masjid",
      city: "Montreal",
      logo: "https://example.com/logo.png",
      latitude: 45.5,
      longitude: -73.6,
      calculationMethod: 2,
      iqamahOffsets: { Fajr: 25 },
      sponsors: [
        { id: 10, label: "Sponsor A", image: null, link: null, weight: 2 },
      ],
      adRailSlots: [{ id: 1, mode: "fixed", sponsorId: 10 }],
      announcementsEn: ["A", "B"],
      announcementsFr: ["C"],
      promo: { displayDurationMs: 10000, cycleMs: 60000, initialDelayMs: 5000 },
      extraPrayers: [
        {
          name: "Jumuah",
          arabicName: "الجمعة",
          adhan: "13:00",
          iqamah: "13:30",
          schedule: ["fri"],
          times: ["13:30", "14:30"],
        },
      ],
    });

    expect(form.name).toBe("Masjid");
    expect(form.logo).toBe("https://example.com/logo.png");
    expect(form.iqamahOffsets[0]).toEqual({
      prayerName: "Fajr",
      offsetMinutes: "25",
    });
    expect(form.sponsors[0].id).toBe("10");
    expect(form.adRailSlots[0].sponsorId).toBe("10");
    expect(form.announcementsEn).toBe("A\nB");
    expect(form.promoEnabled).toBe(true);
    expect(form.extraPrayers[0].times).toEqual(["13:30", "14:30"]);
    expect(form.extraPrayers[0].schedule).toEqual(["fri"]);
  });

  it("converts dashboard form state back to mosque configuration", () => {
    const config = formToConfig({
      name: "Masjid",
      city: "Montreal",
      location: "Address",
      website: "https://example.com",
      capacity: "500",
      openingHours: "Daily",
      logo: "https://example.com/logo.png",
      email: "test@example.com",
      phone: "123",
      latitude: "45.5",
      longitude: "-73.6",
      calculationMethod: "2",
      iqamahOffsets: [{ prayerName: "Fajr", offsetMinutes: "20" }],
      sponsors: [
        { id: "1", label: "A", image: "", link: "", weight: "" },
        { id: "2", label: "B", image: "", link: "", weight: "2" },
      ],
      adRailSlots: [
        { id: "1", mode: "fixed", sponsorId: "2" },
        { id: "2", mode: "dynamic", sponsorId: "" },
      ],
      adRailRotationMs: "10000",
      announcementsEn: "One\nTwo",
      announcementsFr: "Un",
      promoEnabled: true,
      promoDisplayDurationMs: "8000",
      promoCycleMs: "60000",
      promoInitialDelayMs: "5000",
      extraPrayers: [
        {
          name: "Jumuah",
          arabicName: "الجمعة",
          adhan: "13:00",
          iqamah: "13:30",
          schedule: ["fri", "2026-03-20"],
          times: ["13:30"],
        },
      ],
    });

    expect(config.latitude).toBe(45.5);
    expect(config.iqamahOffsets).toEqual({ Fajr: 20 });
    expect(config.sponsors[1].weight).toBe(2);
    expect(config.adRailSlots[0]).toEqual({
      id: 1,
      mode: "fixed",
      sponsorId: 2,
    });
    expect(config.adRailSlots[1]).toEqual({ id: 2, mode: "dynamic" });
    expect(config.logo).toBe("https://example.com/logo.png");
    expect(config.announcementsEn).toEqual(["One", "Two"]);
    expect(config.promo?.displayDurationMs).toBe(8000);
    expect(config.extraPrayers?.[0].schedule).toEqual(["fri", "2026-03-20"]);
  });

  it("omits an empty schedule from the saved configuration", () => {
    const config = formToConfig({
      name: "Masjid",
      city: "Montreal",
      location: "Address",
      website: "https://example.com",
      capacity: "500",
      openingHours: "Daily",
      logo: "https://example.com/logo.png",
      email: "test@example.com",
      phone: "123",
      latitude: "45.5",
      longitude: "-73.6",
      calculationMethod: "2",
      iqamahOffsets: [],
      sponsors: [],
      adRailSlots: [],
      adRailRotationMs: "",
      announcementsEn: "",
      announcementsFr: "",
      promoEnabled: false,
      promoDisplayDurationMs: "",
      promoCycleMs: "",
      promoInitialDelayMs: "",
      extraPrayers: [
        {
          name: "Khutbah",
          arabicName: "خطبة",
          adhan: "",
          iqamah: "",
          schedule: ["", "  "],
          times: ["13:00"],
        },
      ],
    });

    expect(config.extraPrayers?.[0].schedule).toBeUndefined();
  });
});
