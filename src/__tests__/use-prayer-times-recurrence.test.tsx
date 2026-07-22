import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { type MosqueConfig, DEFAULT_APP_SETTINGS } from "../types";
import { WEEKDAY_ABBR, toISODateLocal } from "../utils/prayerSchedule";

const MOCK_TIMINGS = {
  Fajr: "05:00",
  Sunrise: "06:20",
  Dhuhr: "12:30",
  Asr: "15:45",
  Maghrib: "18:10",
  Isha: "19:30",
};

const MOCK_API_RESPONSE = {
  data: {
    timings: MOCK_TIMINGS,
    date: {
      hijri: {
        month: { en: "Ramadan" },
        day: "1",
        year: "1447",
      },
    },
  },
};

function mockPrayerTimesFetch() {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ json: async () => MOCK_API_RESPONSE });
  vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);
  return fetchMock;
}

function createConfig(overrides: Partial<MosqueConfig>): MosqueConfig {
  return {
    ...DEFAULT_APP_SETTINGS.mosque,
    name: "Test Mosque",
    city: "Montreal",
    location: "",
    website: "https://example.com",
    capacity: "",
    openingHours: "",
    email: "",
    phone: "",
    latitude: 45.5,
    longitude: -73.5,
    calculationMethod: 2,
    iqamahOffsets: {
      Fajr: 40,
      Dhuhr: 10,
      Asr: 5,
      Maghrib: 0,
      Isha: 0,
    },
    sponsors: [],
    adRailSlots: [],
    announcementsEn: [],
    announcementsFr: [],
    extraPrayers: [],
    ...overrides,
  };
}

// Derived from the real current date (no system-time mocking, so it plays
// nicely with @testing-library's real-timer-based `waitFor`).
const now = new Date();
const TODAY_ABBR = WEEKDAY_ABBR[now.getDay()];
const OTHER_ABBR = WEEKDAY_ABBR[(now.getDay() + 1) % 7];
const TODAY_ISO = toISODateLocal(now);
const OTHER_ISO = toISODateLocal(new Date(now.getTime() + 86400000));

describe("usePrayerTimes extra prayer schedule", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const storageMock: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key: string) => store.get(key) ?? null,
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      removeItem: (key: string) => {
        store.delete(key);
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    };

    vi.stubGlobal("localStorage", storageMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("is active when `schedule` contains today's weekday", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.601,
      extraPrayers: [
        {
          name: "Khutbah",
          arabicName: "خطبة",
          adhan: null,
          iqamah: null,
          times: "13:00",
          schedule: [TODAY_ABBR],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Khutbah");
    expect(extra).toBeDefined();
    expect(extra?.displayOnly).toBe(false);
  });

  it("is display-only when `schedule` names a different weekday", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.602,
      extraPrayers: [
        {
          name: "Khutbah",
          arabicName: "خطبة",
          adhan: null,
          iqamah: null,
          times: "13:00",
          schedule: [OTHER_ABBR],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Khutbah");
    expect(extra).toBeDefined();
    expect(extra?.displayOnly).toBe(true);
  });

  it("is active when `schedule` contains today's exact ISO date", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.603,
      extraPrayers: [
        {
          name: "Eid Prayer",
          arabicName: "صلاة العيد",
          adhan: null,
          iqamah: null,
          times: "08:00",
          schedule: [TODAY_ISO],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Eid Prayer");
    expect(extra).toBeDefined();
    expect(extra?.displayOnly).toBe(false);
  });

  it("is display-only when `schedule` names a different date", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.604,
      extraPrayers: [
        {
          name: "Eid Prayer",
          arabicName: "صلاة العيد",
          adhan: null,
          iqamah: null,
          times: "08:00",
          schedule: [OTHER_ISO],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Eid Prayer");
    expect(extra).toBeDefined();
    expect(extra?.displayOnly).toBe(true);
  });

  it("is always display-only when no `schedule` is configured", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.605,
      extraPrayers: [
        {
          name: "Announcement",
          arabicName: "إعلان",
          adhan: null,
          iqamah: null,
          times: "13:00",
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find(
      (p) => p.name === "Announcement",
    );
    expect(extra).toBeDefined();
    expect(extra?.displayOnly).toBe(true);
  });
});
