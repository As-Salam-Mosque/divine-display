import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  mosqueName: "MASJID AL-NOOR",
  city: "TORONTO",
  latitude: 43.7,
  longitude: -79.42,
  calculationMethod: 2, // ISNA
  iqamahOffsets: {
    Fajr: 18,
    Dhuhr: 17,
    Asr: 20,
    Maghrib: 5,
    Isha: 20,
  },
  adSlots: [
    { id: 1, label: "SPONSOR SPACE", image: null },
    { id: 2, label: "SPONSOR SPACE", image: null },
    { id: 3, label: "SPONSOR SPACE", image: null },
  ],
  announcements: [
    "Friday Khutbah — Sheikh Yusuf will lead the khutbah this Friday on the virtues of patience.",
    "Quran Halaqah — Weekly Quran circle every Wednesday after Maghrib in the main hall.",
    "Parking Notice — East lot closed for repaving. Please use the side entrance.",
    "Visit our website at assalam.info",
  ],
};

export default config;
