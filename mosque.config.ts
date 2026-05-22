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
    Fajr: 18,
    Dhuhr: 17,
    Asr: 20,
    Maghrib: 5,
    Isha: 20,
  },
  // extraPrayers: [{ name: "Khutbah 1", time: "13:00", isKhutbah: true }],
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
  promo: { displayDurationMs: 8000, cycleMs: 90000, initialDelayMs: 5000 },
  announcements: [
    "Friday Khutbah — Sheikh Ali will lead the khutbah at 1PM (Arabic) and 2PM (English)",
    "Quran Halaqah — Weekly Quran circle every Saturday after 3PM in the main hall.",
    // "Parking Notice — East lot closed for repaving. Please use the side entrance.",
    "See all out events at assalam.info/services",
  ],
};

export default config;
