export type PrayerName =
  | "Fajr"
  | "Shuruq"
  | "Dhuhr"
  | "Asr"
  | "Maghrib"
  | "Isha";

export interface PrayerTime {
  name: PrayerName;
  arabicName: string;
  icon: string;
  adhan: string | null;
  iqamah: string | null;
  time?: string;
}

export interface AdSlot {
  id: number;
  label: string;
  image?: string | null;
  link?: string | null;
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

export interface AppSettings {
  language: Language;
  timeFormat: TimeFormat;
  showSponsors: boolean;
  mosque: MosqueConfig;
}

// Hardcoded default app settings. Use these as the single source of truth
// for settings when the app should not persist user-modified settings to
// localStorage.
export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: "en",
  timeFormat: "24h",
  showSponsors: true,
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
  },
};
