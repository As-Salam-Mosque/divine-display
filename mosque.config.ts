import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  name: "MASJID AL-SALAM",
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
    //   name: "Khutbah 1",
    //   arabicName: "خطبة 1",
    //   icon: "campaign",
    //   adhan: null,
    //   iqamah: null,
    //   time: "13:00",
    // },
    // {
    //   name: "Khutbah 2",
    //   arabicName: "خطبة 2",
    //   icon: "campaign",
    //   adhan: null,
    //   iqamah: null,
    //   time: "14:00",
    // },
  ],
  adSlots: [
    {
      id: 1,
      label: "SPONSOR SPACE",
      image: "/hajj-kids.jpeg",
      weight: 0.5,
    },
    {
      id: 2,
      label: "SPONSOR SPACE",
      image: "/udhiyah.jpeg",
      weight: 0.5,
    },
    {
      id: 3,
      label: "SPONSOR SPACE",
      image: "/tawaf.jpeg",
      weight: 0.5,
    },
  ],
  promo: { displayDurationMs: 150000, cycleMs: 90000, initialDelayMs: 5000 },
  announcements_en: [
    "Friday Khutbah — Sheikh Ali will lead the khutbah at 1PM (Arabic) and 2:10PM (Anglais)",
    "Quran Halaqah — Weekly Quran circle every Saturday after 3PM in the main hall.",
    // "Parking Notice — East lot closed for repaving. Please use the side entrance.",
    "See all out events at assalam.info/services",
  ],
  announcements_fr: [
    "Khutbah du vendredi — Le Sheikh Ali dirigera le khutbah à 13h (Arabe) et 14h10 (Français)",
    "Halaqah du Coran — Halaqah du Coran chaque samedi après 15h dans la salle principale.",
    // "Avis de stationnement — Lot est fermé pour réparation. Veuillez utiliser l'entrée latérale.",
    "Consultez tous nos événements sur assalam.info/services",
  ],
};

export default config;
