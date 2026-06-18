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
  skipToPrayerTimes: "Skip to prayer times",
  loadingPrayerTimes: "Loading prayer times",
  // status messages
  statusAdhanNow: (name: string) => `Adhan for ${name} — come to prayer`,
  statusIqamahNow: (name: string) => `Iqamah for ${name} — come to prayer`,
  criticalSubtitle: "Come to prayer",
  statusIqamah: (name: string, remaining: string) =>
    `${name} Iqamah in ${remaining}`,
  statusNext: (name: string, remaining: string) => `${name} in ${remaining}`,
  communitySponsors: "COMMUNITY SPONSORS",
  paidAds: "PAID ADS",
  available: "Available",
  masjidAnnouncements: "ANNOUNCEMENTS",
  currentlyActive: ", currently active",
  notAvailable: "Not available",
  // time labels
  time: "TIME",
  adhan: "ADHAN",
  iqamah: "IQAMAH",
  // theme
  lightTheme: "Use light theme",
  // accessibility
  sectionAccessibility: "Accessibility",
  alternatePrayerCardColors: "Use alternating backgrounds for prayer cards",
  landing: {
    skipToMain: "Skip to main content",
    primaryNav: "Primary",
    brand: "Divine Display",
    navHome: "Home",
    navAbout: "About Us",
    navFeatures: "Features",
    navPartners: "Partners",
    navContact: "Contact",
    languageToggle: "Language",
    joinUs: "Join Us",
    heroTitleLead: "Elevate Your",
    heroTitleHighlight: "Masjid's Presence.",
    heroDescription:
      "Providing sacred spaces with the digital tools they need to connect, inform and grow.",
    heroJoin: "Join us",
    liveDemo: "Live demo",
    heroImageAlt: "Divine Display interface screenshot",
    perspective: "Perspective",
    ourVision: "Our Vision",
    visionDescription:
      "Redefining how masjids connect with congregants through ethical, community-centric technology.",
    visionHalalTitle: "Halal Screened",
    visionHalalDescription:
      "Only community businesses that align with Islamic values are permitted to display announcements.",
    visionCommunityTitle: "Community Driven",
    visionCommunityDescription:
      "Local businesses support their spiritual home while growing their reach within the community.",
    visionFreedomTitle: "Freedom",
    visionFreedomDescription:
      "The clock is open source and can be installed anywhere for free for accessible digital infrastructure.",
    capabilities: "Capabilities",
    premiumFeatures: "Premium Features",
    featureRealtimeTitle: "Real-time prayer times",
    featureRealtimeDescription:
      "Automated, location-based Adhan and Iqamah times with multiple calculation methods.",
    featureAnnouncementsTitle: "Community announcements",
    featureAnnouncementsDescription:
      "Broadcast Jumu'ah times, educational events, and community alerts instantly.",
    featurePostersTitle: "Display custom posters",
    featurePostersDescription:
      "Upload your own graphics and PDF posters to rotate seamlessly on the display.",
    featurePromotionsTitle: "Dynamic promotions",
    featurePromotionsDescription:
      "Showcase partner businesses and fundraising goals with elegant visuals.",
    featureDevicesTitle: "Beautiful on all devices",
    featureDevicesDescription:
      "Optimized for TV displays, tablets, mobile phones, and desktop browsers.",
    featureUpdatesTitle: "Continuous updates",
    featureUpdatesDescription:
      "New features and religious content are continuously shipped at no extra cost.",
    partnersHeading: "Trusted by Communities and Partners",
    partnersSubheading:
      "Building stronger local ecosystems through mosque-first digital communication.",
    forCommunities: "For Communities",
    mosque: "Mosque",
    mosqueDescription:
      "Upgrade your facility with a premium digital display system. No hardware costs, no subscription fees.",
    registerMosque: "Register your mosque for free",
    forPartners: "For Partners",
    businessPartner: "Business (Partner)",
    businessDescription:
      "Increase your reach while supporting your local mosque through a halal-screened announcement network.",
    contactSales: "Contact our sales representative",
    footerDescription:
      "Providing sacred spaces with digital tools to connect, inform and grow.",
    company: "Company",
    sitemap: "Sitemap",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    adPolicy: "Ad Policy",
    contact: "Contact",
  },
};

export default en;
