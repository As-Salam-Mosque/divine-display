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
  adhan: string | null;
  iqamah: string | null;
  // Optional time-only entry/entries (e.g., multiple khutbah sessions)
  times?: string | string[];
  // When true, this prayer is shown in the table but excluded from event
  // processing: it won't drive countdowns, highlights, or critical signals.
  // Extra prayers default to true; base prayers default to undefined (falsy).
  displayOnly?: boolean;
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

export interface AdRailSlotConfig {
  id: number;
  mode: "fixed" | "dynamic";
  sponsorId?: number;
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
  sponsors: AdSlot[];
  adRailSlots: AdRailSlotConfig[];
  announcementsEn: string[];
  announcementsFr: string[];
  // Optional promo configuration to control timing of the promo rail
  promo?: PromoConfig;

  // Optional admin-supplied additional prayers (e.g. khutbah times).
  // These are typed as PrayerTime so their shape matches runtime objects and
  // can be merged without a separate ExtraPrayer interface.
  extraPrayers?: PrayerTime[];
}

export type MosqueConfigSource = "default" | "remote";

export interface MosqueConfigState {
  config: MosqueConfig;
  loading: boolean;
  error: string | null;
  source: MosqueConfigSource;
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

export type StatusType =
  | "none"
  | "adhan-now"
  | "iqamah-now"
  | "iqamah-countdown"
  | "next-countdown";

/** Structured data for the critical (adhan-now / iqamah-now) display state. */
export interface CriticalSignalData {
  prayerName: string;
  arabicName: string;
  /** urgency level: "low" = adhan (preparatory), "medium" = reserved, "high" = iqamah (starting now) */
  urgency: "low" | "medium" | "high";
  subtitle: string;
}

export interface PrayerTimesState {
  prayers: PrayerTime[];
  hijriDate: string;
  activePrayerIndex: number | null;
  nextPrayerIndex: number | null;
  statusMessage: string;
  statusType: StatusType;
  /** Structured critical signal data (non-null only during adhan-now/iqamah-now). */
  criticalSignal: CriticalSignalData | null;
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
  // Accessibility: when true, prayer cards will alternate between two
  // background colors for visual separation. Defaults to false so all cards
  // share the same background by default.
  alternatePrayerCardColors?: boolean;
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
    sponsors: [],
    adRailSlots: [],
    announcementsEn: [],
    announcementsFr: [],
    extraPrayers: [],
  },
  // Accessibility defaults: do not alternate prayer card colors by default.
  alternatePrayerCardColors: false,
};
