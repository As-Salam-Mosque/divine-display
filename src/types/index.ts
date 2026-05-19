export type PrayerName =
  | "Fajr"
  | "Shuruq"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

// Relaxed PrayerTime: allow arbitrary names (string) so extra/admin prayers
// can reuse the same type as canonical prayers without a separate ExtraPrayer.
export interface PrayerTime {
  // Previously a narrow union; now any string (e.g., "Khutbah 1")
  name: string;
  arabicName: string;
  icon: string;
  adhan: string | null;
  iqamah: string | null;
  time?: string;
  // Explicit flag to mark khutbah (Friday sermon) entries when present in the data.
  // Optional to remain backward-compatible; when present and true, indicates this
  // prayer should be treated as a khutbah for consolidation/display logic.
  isKhutbah?: boolean;
}

export interface AdSlot {
  id: number;
  label: string;
  image?: string | null;
  link?: string | null;
  // Optional weight used for promo rotation. Higher weight => more likely to be chosen.
  // Defaults to 0 when omitted so slots are opt-in for rotation.
  weight?: number;
}

export interface PromoConfig {
  // How long (ms) a promo is displayed
  displayDurationMs?: number;
  // Time between promo appearances (ms)
  cycleMs?: number;
  // Initial delay before the first promo appearance (ms)
  initialDelayMs?: number;
}

export interface MosqueConfig {
  // Basic identity
  name: string;
  city: string;
  location: string; // human-readable address/location
  website: string;
  capacity: string;
  openingHours: string;
  email: string;
  phone: string;

  // Geolocation & calculation
  latitude: number;
  longitude: number;
  calculationMethod: number;
  iqamahOffsets: Record<string, number>;

  // UI content
  adSlots: AdSlot[];
  announcements: string[];
  // Optional promo configuration to control timing of the promo rail
  promo?: PromoConfig;

  // Optional admin-supplied additional prayers (e.g. khutbah times).
  // These are typed as PrayerTime so their shape matches runtime objects and
  // can be merged without a separate ExtraPrayer interface.
  extraPrayers?: PrayerTime[];
}

export interface ClockState {
  hours: string; // 12-hour
  hours24: string; // 24-hour (zero-padded)
  minutes: string;
  seconds: string;
  ampm: "AM" | "PM";
  gregorianDate: string;
  dayName: string;
}

export interface PrayerTimesState {
  prayers: PrayerTime[];
  hijriDate: string;
  activePrayerIndex: number | null;
  nextPrayerIndex: number | null;
  statusMessage: string;
  loading: boolean;
  error: string | null;
}

export type Language = "en" | "fr";
export type TimeFormat = "12h" | "24h";
export type Theme = "dark" | "light";

export interface AppSettings {
  language: Language;
  timeFormat: TimeFormat;
  showSponsors: boolean;
  theme: Theme;
  mosque: MosqueConfig;
}

// Hardcoded default app settings. Use these as the single source of truth
// for settings when the app should not persist user-modified settings to
// localStorage.
export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: "en",
  timeFormat: "24h",
  showSponsors: true,
  theme: "dark",
  mosque: {
    name: "Al-Masjid",
    city: "Montreal",
    location: "",
    website: "assalam.info",
    capacity: "",
    openingHours: "",
    email: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    calculationMethod: 0,
    iqamahOffsets: {},
    adSlots: [],
    announcements: [],
    extraPrayers: [],
  },
};
