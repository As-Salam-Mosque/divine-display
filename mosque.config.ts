import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  name: "MASJID AS-SALAM",
  city: "MONTREAL",
  location: "1177 rue de la Montagne, Montreal QC",
  website: "https://www.assalam.info",
  capacity: "500",
  openingHours: "See website",
  email: "info@assalam.info",
  phone: "+1-514-545-5466",
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
    // {
    //   name: "Khutbah",
    //   arabicName: "خطبة",
    //   adhan: null,
    //   iqamah: null,
    //   times: ["13:00", "14:00"],
    // },
  ],
  adSlots: [
    {
      id: 1,
      label: "SPONSOR SPACE",
      image: "/hajj-kids.jpeg",
      weight: 1,
    },
  ],
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
