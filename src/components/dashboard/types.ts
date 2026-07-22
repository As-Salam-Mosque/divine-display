import type { translations } from "../../i18n";

export type DashboardTranslations = (typeof translations)["en"]["dashboard"];

export interface IqamahRow {
  prayerName: string;
  offsetMinutes: string;
}

export interface SponsorRow {
  id: string;
  label: string;
  image: string;
  link: string;
  weight: string;
}

export interface RailSlotRow {
  id: string;
  mode: "fixed" | "dynamic";
  sponsorId: string;
}

export interface ExtraPrayerRow {
  name: string;
  arabicName: string;
  adhan: string;
  iqamah: string;
  schedule: string[];
  times: string[];
}

export interface FormState {
  name: string;
  city: string;
  location: string;
  website: string;
  capacity: string;
  openingHours: string;
  logo: string;
  email: string;
  phone: string;
  latitude: string;
  longitude: string;
  calculationMethod: string;
  iqamahOffsets: IqamahRow[];
  sponsors: SponsorRow[];
  adRailSlots: RailSlotRow[];
  adRailRotationMs: string;
  announcementsEn: string;
  announcementsFr: string;
  promoEnabled: boolean;
  promoDisplayDurationMs: string;
  promoCycleMs: string;
  promoInitialDelayMs: string;
  extraPrayers: ExtraPrayerRow[];
}

export interface DashboardStatus {
  type: "success" | "error";
  message: string;
}

export const EMPTY_FORM: FormState = {
  name: "",
  city: "",
  location: "",
  website: "",
  capacity: "",
  openingHours: "",
  logo: "",
  email: "",
  phone: "",
  latitude: "",
  longitude: "",
  calculationMethod: "0",
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
  extraPrayers: [],
};
