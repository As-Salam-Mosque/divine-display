

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
  // Unified recurrence for extra prayers. Each entry is either a 3-letter
  // weekday abbreviation ("sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat") for
  // weekly recurrence, or an ISO date ("YYYY-MM-DD") for a one-off
  // occurrence (e.g. Eid). Base prayers never set this (always active).
  // Extra prayers are display-only by default (undefined/empty schedule)
  // and are automatically included in the countdown/highlight/critical-
  // signal processing on any day matching an entry. Use `isDisplayOnly`
  // from `utils/prayerSchedule` to derive this rather than storing a
  // separate flag, so it can never drift out of sync with `schedule`.
  schedule?: string[];
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
  logo: string;
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
  // Dynamic rail slot rotation interval (ms)
  adRailRotationMs?: number;
  announcementsEn: string[];
  announcementsFr: string[];
  // Optional promo configuration to control timing of the promo rail
  promo?: PromoConfig;

  // Optional admin-supplied additional prayers (e.g. khutbah times, Eid
  // prayers). These are typed as PrayerTime so their shape matches runtime
  // objects and can be merged without a separate ExtraPrayer interface.
  // Display-only by default; use `schedule` to automatically include an
  // entry in the countdown on matching weekdays/dates.
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

export type StatusType =
  | "none"
  | "adhan-now"
  | "iqamah-now"
  | "time-now"
  | "iqamah-countdown"
  | "next-countdown";

/** Structured data for any critical PrayerTime event display state. */
export interface CriticalSignalData {
  prayerName: string;
  arabicName: string;
  /** urgency level: "low" = adhan, "medium" = time-only event, "high" = iqamah */
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
  /** Structured critical signal data (non-null only during a *-now status). */
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
    logo: "",
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
