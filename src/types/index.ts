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
  mosqueName: string;
  city: string;
  latitude: number;
  longitude: number;
  calculationMethod: number;
  iqamahOffsets: Record<string, number>;
  adSlots: AdSlot[];
  announcements: string[];
}

export interface ClockState {
  hours: string;   // 12-hour
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

export interface MosqueInfo {
  name: string;
  city: string;
  location: string;
  website: string;
  capacity: string;
  openingHours: string;
  email: string;
  phone: string;
}

export interface AppSettings {
  language: Language;
  timeFormat: TimeFormat;
  showSponsors: boolean;
  mosque: MosqueInfo;
}
