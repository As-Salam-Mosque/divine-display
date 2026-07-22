import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  name: "AL-MASJID",
  city: "MONTREAL",
  location: "123 rue de l'Islam, Montreal QC",
  website: "https://www.islam.com",
  capacity: "500",
  openingHours: "See website",
  logo: "",
  email: "masjid@islam.com",
  phone: "+1-514-123-4567",
  latitude: 45.497253,
  longitude: -73.573064,
  calculationMethod: 2, // ISNA
  iqamahOffsets: {
    Fajr: 40,
    Dhuhr: 14,
    Asr: 5,
    Maghrib: 0,
    Isha: 0,
  },
  extraPrayers: [
    {
      name: "Khutbah",
      arabicName: "خطبة",
      adhan: null,
      iqamah: null,
      times: ["13:00", "14:00"],
      schedule: ["fri"], // Friday — automatically active in the countdown
    },
    {
      name: "Eid Prayer",
      arabicName: "صلاة العيد",
      adhan: null,
      iqamah: null,
      times: ["08:00"],
      schedule: ["2026-03-20"], // update yearly — active only on this date
    },
  ],
  sponsors: [
    {
      id: 1,
      label: "SPONSOR SPACE",
      weight: 0,
    },
    {
      id: 2,
      label: "SPONSOR SPACE",
      weight: 1,
    },
    {
      id: 3,
      label: "SPONSOR SPACE",
      weight: 0,
    },
  ],
  adRailSlots: [
    { id: 1, mode: "fixed", sponsorId: 1 },
    { id: 2, mode: "dynamic" },
    { id: 3, mode: "fixed", sponsorId: 3 },
  ],
  adRailRotationMs: 10000,
  promo: { displayDurationMs: 10000, cycleMs: 90000, initialDelayMs: 5000 },
  announcementsEn: [
    "Friday Khutbah — Sheikh Ali will lead the khutbah at 1PM (Arabic) and 2:10PM (English)",
    "Quran Halaqah — Weekly Quran circle every Saturday after 3PM in the main hall.",
    "See all out events at assalam.info/services",
  ],
  announcementsFr: [
    "Khutbah du vendredi — Le Sheikh Ali dirigera le khutbah à 13h (Arabe) et 14h10 (Anglais)",
    "Halaqah du Coran — Halaqah du Coran chaque samedi après 15h dans la salle principale.",
    "Consultez tous nos événements sur assalam.info/services",
  ],
};

export default config;
