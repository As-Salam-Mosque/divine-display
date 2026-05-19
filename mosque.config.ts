import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  name: "MASJID AL-SALAM",
  city: "MONTREAL",
  location: "1177 rue de la Montagne, Montreal QC",
  website: "https://www.assalam.info",
  capacity: "500",
  openingHours: "See website",
  email: "info@assalam.ca",
  phone: "+1-416-555-0123",
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
      image: "https://picsum.photos/1000",
      weight: 0.5,
    },
    {
      id: 2,
      label: "SPONSOR SPACE",
      image: "https://picsum.photos/1200",
      weight: 0.5,
    },
    { id: 3, label: "SPONSOR SPACE", image: "https://picsum.photos/1500" },
  ],
  promo: { displayDurationMs: 8000, cycleMs: 90000, initialDelayMs: 5000 },
  announcements: [
    "Friday Khutbah — Sheikh Yusuf will lead the khutbah this Friday on the virtues of patience.",
    "Quran Halaqah — Weekly Quran circle every Wednesday after Maghrib in the main hall.",
    "Parking Notice — East lot closed for repaving. Please use the side entrance.",
    "Visit our website at masjidalnoor.example",
  ],
};

export default config;
