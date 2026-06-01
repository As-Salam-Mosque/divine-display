import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { type MosqueConfig, DEFAULT_APP_SETTINGS } from "../types";

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
    adSlots: [],
    announcementsEn: [],
    announcementsFr: [],
    extraPrayers: [],
    ...overrides,
  };
}

describe("usePrayerTimes next index derivation", () => {
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
    vi.useRealTimers();
  });

  it("sets nextPrayerIndex to the upcoming prayer based on current time", async () => {
    // Create timings relative to now so Dhuhr is in the past and Asr is in the future
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");

    const minus30 = new Date(now.getTime() - 30 * 60_000);
    const plus3h = new Date(now.getTime() + 3 * 60 * 60_000);

    const timings = {
      Fajr: "05:00",
      Sunrise: "06:20",
      Dhuhr: `${pad(minus30.getHours())}:${pad(minus30.getMinutes())}`,
      Asr: `${pad(plus3h.getHours())}:${pad(plus3h.getMinutes())}`,
      Maghrib: "18:10",
      Isha: "19:30",
    };

    const apiResponse = {
      data: {
        timings,
        date: { hijri: { month: { en: "Ramadan" }, day: "1", year: "1447" } },
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => apiResponse });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const config = createConfig({ latitude: 45.5001 });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // PRAYER_ORDER: Fajr(0), Shuruq(1), Dhuhr(2), Asr(3), Maghrib(4), Isha(5)
    expect(result.current.nextPrayerIndex).toBe(3);
  });
});
