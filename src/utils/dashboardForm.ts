import type {
  MosqueConfig,
  AdRailSlotConfig,
  AdSlot,
  PrayerTime,
  PromoConfig,
} from "../types";
import type { FormState } from "../components/dashboard/types";

const TOP_LEVEL_FIELD_ID_MAP: Record<string, string> = {
  name: "cfg-name",
  city: "cfg-city",
  location: "cfg-location",
  website: "cfg-website",
  capacity: "cfg-capacity",
  openingHours: "cfg-hours",
  logo: "cfg-logo",
  email: "cfg-email",
  phone: "cfg-phone",
  latitude: "cfg-lat",
  longitude: "cfg-lng",
  calculationMethod: "cfg-method",
  adRailRotationMs: "cfg-ad-rail-rotation",
  announcementsEn: "cfg-ann-en",
  announcementsFr: "cfg-ann-fr",
};

export function mapValidationLocToFieldId(
  loc: Array<string | number>,
): string | null {
  const [, scope, field, index, nestedField] = loc;
  if (scope !== "configuration" || typeof field !== "string") return null;

  if (field in TOP_LEVEL_FIELD_ID_MAP) {
    return TOP_LEVEL_FIELD_ID_MAP[field];
  }

  if (field === "iqamahOffsets") return "iq-name-0";
  if (field === "promo" && typeof index === "string") {
    if (index === "displayDurationMs") return "promo-duration";
    if (index === "cycleMs") return "promo-cycle";
    if (index === "initialDelayMs") return "promo-delay";
  }

  if (
    field === "sponsors" &&
    typeof index === "number" &&
    typeof nestedField === "string"
  ) {
    if (nestedField === "id") return `ad-id-${index}`;
    if (nestedField === "label") return `ad-label-${index}`;
    if (nestedField === "image") return `ad-image-${index}`;
    if (nestedField === "link") return `ad-link-${index}`;
    if (nestedField === "weight") return `ad-weight-${index}`;
  }

  if (
    field === "adRailSlots" &&
    typeof index === "number" &&
    typeof nestedField === "string"
  ) {
    if (nestedField === "id") return `ad-rail-id-${index}`;
    if (nestedField === "mode") return `ad-rail-mode-${index}`;
    if (nestedField === "sponsorId") return `ad-rail-sponsor-${index}`;
  }

  if (
    field === "extraPrayers" &&
    typeof index === "number" &&
    typeof nestedField === "string"
  ) {
    if (nestedField === "name") return `ep-name-${index}`;
    if (nestedField === "arabicName") return `ep-arabic-${index}`;
    if (nestedField === "adhan") return `ep-adhan-${index}`;
    if (nestedField === "iqamah") return `ep-iqamah-${index}`;
    if (nestedField === "schedule") return `ep-days-${index}-sun`;
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function configToForm(c: any): FormState {
  const promo = c.promo as PromoConfig | undefined;
  const hasPromo =
    promo &&
    (promo.displayDurationMs != null ||
      promo.cycleMs != null ||
      promo.initialDelayMs != null);

  return {
    name: c.name ?? "",
    city: c.city ?? "",
    location: c.location ?? "",
    website: c.website ?? "",
    capacity: c.capacity ?? "",
    openingHours: c.openingHours ?? "",
    logo: c.logo ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    latitude: c.latitude != null ? String(c.latitude) : "",
    longitude: c.longitude != null ? String(c.longitude) : "",
    calculationMethod: String(c.calculationMethod ?? 0),
    iqamahOffsets: Object.entries(
      (c.iqamahOffsets as Record<string, number>) || {},
    ).map(([prayerName, offsetMinutes]) => ({
      prayerName,
      offsetMinutes: String(offsetMinutes),
    })),
    sponsors: ((c.sponsors as AdSlot[]) || []).map((s) => ({
      id: String(s.id),
      label: s.label,
      image: s.image || "",
      link: s.link || "",
      weight: s.weight != null ? String(s.weight) : "",
    })),
    adRailSlots: ((c.adRailSlots as AdRailSlotConfig[]) || []).map((slot) => ({
      id: String(slot.id),
      mode: slot.mode,
      sponsorId: slot.sponsorId != null ? String(slot.sponsorId) : "",
    })),
    adRailRotationMs:
      c.adRailRotationMs != null ? String(c.adRailRotationMs) : "",
    announcementsEn: ((c.announcementsEn as string[]) || []).join("\n"),
    announcementsFr: ((c.announcementsFr as string[]) || []).join("\n"),
    promoEnabled: !!hasPromo,
    promoDisplayDurationMs:
      promo?.displayDurationMs != null ? String(promo.displayDurationMs) : "",
    promoCycleMs: promo?.cycleMs != null ? String(promo.cycleMs) : "",
    promoInitialDelayMs:
      promo?.initialDelayMs != null ? String(promo.initialDelayMs) : "",
    extraPrayers: ((c.extraPrayers as PrayerTime[]) || []).map((p) => ({
      name: p.name,
      arabicName: p.arabicName,
      adhan: p.adhan || "",
      iqamah: p.iqamah || "",
      schedule: Array.isArray(p.schedule) ? [...p.schedule] : [],
      times: Array.isArray(p.times) ? [...p.times] : p.times ? [p.times] : [],
    })),
  };
}

export function formToConfig(f: FormState): MosqueConfig {
  const iqamahOffsets: Record<string, number> = {};
  for (const row of f.iqamahOffsets) {
    if (row.prayerName.trim()) {
      iqamahOffsets[row.prayerName.trim()] = Number(row.offsetMinutes) || 0;
    }
  }

  const promo: PromoConfig | undefined = f.promoEnabled
    ? {
        ...(f.promoDisplayDurationMs !== ""
          ? { displayDurationMs: parseInt(f.promoDisplayDurationMs) }
          : {}),
        ...(f.promoCycleMs !== "" ? { cycleMs: parseInt(f.promoCycleMs) } : {}),
        ...(f.promoInitialDelayMs !== ""
          ? { initialDelayMs: parseInt(f.promoInitialDelayMs) }
          : {}),
      }
    : undefined;

  return {
    name: f.name,
    city: f.city,
    location: f.location,
    website: f.website,
    capacity: f.capacity,
    openingHours: f.openingHours,
    logo: f.logo,
    email: f.email,
    phone: f.phone,
    latitude: parseFloat(f.latitude) || 0,
    longitude: parseFloat(f.longitude) || 0,
    calculationMethod: parseInt(f.calculationMethod) || 0,
    iqamahOffsets,
    sponsors: f.sponsors.map((s) => ({
      id: parseInt(s.id) || 0,
      label: s.label,
      image: s.image || null,
      link: s.link || null,
      ...(s.weight !== "" ? { weight: parseInt(s.weight) } : {}),
    })),
    adRailSlots: f.adRailSlots.map((slot) => ({
      id: parseInt(slot.id) || 0,
      mode: slot.mode,
      ...(slot.mode === "fixed" && slot.sponsorId !== ""
        ? { sponsorId: parseInt(slot.sponsorId) || 0 }
        : {}),
    })),
    ...(f.adRailRotationMs !== ""
      ? { adRailRotationMs: parseInt(f.adRailRotationMs) || 0 }
      : {}),
    announcementsEn: f.announcementsEn
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    announcementsFr: f.announcementsFr
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    promo,
    extraPrayers: f.extraPrayers.map((p) => {
      const schedule = p.schedule.map((s) => s.trim()).filter(Boolean);
      return {
        name: p.name,
        arabicName: p.arabicName,
        adhan: p.adhan || null,
        iqamah: p.iqamah || null,
        schedule: schedule.length > 0 ? schedule : undefined,
        times: p.times.length > 0 ? p.times : undefined,
      };
    }),
  };
}
