import type { MosqueConfig } from "./src/types";

const config: MosqueConfig = {
  name: "MASJID AL-NOOR",
  city: "TORONTO",
  location: "123 Example St",
  website: "https://www.masjidalnoor.example",
  capacity: "500",
  openingHours: "See website",
  email: "info@masjidalnoor.example",
  phone: "+1-416-555-0123",
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
  // extraPrayers: [{ name: "Khutbah 1", time: "13:00", isKhutbah: true }],
  adSlots: [
    { id: 1, label: "SPONSOR SPACE", image: "https://picsum.photos/1000" },
    { id: 2, label: "SPONSOR SPACE", image: "https://picsum.photos/1200" },
    { id: 3, label: "SPONSOR SPACE", image: "https://picsum.photos/1500" },
  ],
  announcements: [
    "Friday Khutbah — Sheikh Yusuf will lead the khutbah this Friday on the virtues of patience.",
    "Quran Halaqah — Weekly Quran circle every Wednesday after Maghrib in the main hall.",
    "Parking Notice — East lot closed for repaving. Please use the side entrance.",
    "Visit our website at masjidalnoor.example",
  ],
};

export default config;
