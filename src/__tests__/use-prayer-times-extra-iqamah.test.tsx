import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { type MosqueConfig, DEFAULT_APP_SETTINGS } from "../types";

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
    adSlots: [],
    announcements_en: [],
    announcements_fr: [],
    extraPrayers: [],
    ...overrides,
  };
}

describe("usePrayerTimes extra prayers iqamah support", () => {
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

  it("preserves explicit iqamah configured on extra prayers", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.5001,
      iqamahOffsets: {
        ...createConfig({}).iqamahOffsets,
        "Khutbah 1": 20,
      },
      extraPrayers: [
        {
          name: "Khutbah 1",
          arabicName: "خطبة 1",
          icon: "campaign",
          adhan: "13:00",
          iqamah: "13:12",
          time: ["13:00"],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Khutbah 1");
    expect(extra).toBeDefined();
    expect(extra?.iqamah).toBe("13:12");
  });

  it("derives iqamah for extra prayers from iqamahOffsets[name] when not explicitly set", async () => {
    mockPrayerTimesFetch();

    const config = createConfig({
      latitude: 45.5002,
      iqamahOffsets: {
        ...createConfig({}).iqamahOffsets,
        "Khutbah 2": 10,
      },
      extraPrayers: [
        {
          name: "Khutbah 2",
          arabicName: "خطبة 2",
          icon: "campaign",
          adhan: null,
          iqamah: null,
          time: ["14:00"],
        },
      ],
    });

    const { result } = renderHook(() => usePrayerTimes(config, "en"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const extra = result.current.prayers.find((p) => p.name === "Khutbah 2");
    expect(extra).toBeDefined();
    expect(extra?.adhan).toBeNull();
    expect(extra?.iqamah).toBe("14:10");
  });
});
