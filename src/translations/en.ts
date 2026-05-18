const en = {
  settings: "Settings",
  close: "Close",
  // sections
  sectionDisplay: "Display",
  sectionVisibility: "Visibility",
  sectionMosqueInfo: "Mosque Information",
  // display
  language: "Language",
  langEn: "English",
  langFr: "French",
  timeFormat: "Time Format",
  format12h: "12-hour (AM/PM)",
  format24h: "24-hour",
  // visibility
  showSponsors: "Show community sponsors",
  // mosque info fields
  mosqueName: "Mosque name",
  city: "City",
  location: "Address",
  website: "Website",
  capacity: "Capacity",
  openingHours: "Opening hours",
  email: "Email address",
  phone: "Contact number",
  // clock panel
  currentTime: "CURRENT TIME",
  hijri: "HIJRI",
  // status messages
  statusIqamah: (name: string, remaining: string) =>
    `${name} Iqamah in ${remaining}`,
  statusNext: (name: string, remaining: string) => `${name} in ${remaining}`,
  communitySponsors: "COMMUNITY SPONSORS",
  paidAds: "PAID ADS",
  available: "Available",
  masjidAnnouncements: "MASJID ANNOUNCEMENTS",
  currentlyActive: ", currently active",
  notAvailable: "Not available",
  // time labels
  time: "TIME",
  adhan: "ADHAN",
  iqamah: "IQAMAH",
  // theme
  lightTheme: "Use light theme",
};

export default en;
