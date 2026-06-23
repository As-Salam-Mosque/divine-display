import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";
import type { MosqueConfig, AdSlot, PrayerTime, PromoConfig } from "../types";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

// ── Internal form types ──────────────────────────────────────────────────────

interface IqamahRow {
  prayerName: string;
  offsetMinutes: string;
}

interface AdSlotRow {
  id: string;
  label: string;
  image: string;
  link: string;
  weight: string;
}

interface ExtraPrayerRow {
  name: string;
  arabicName: string;
  adhan: string;
  iqamah: string;
  displayOnly: boolean;
  times: string[];
}

interface FormState {
  name: string;
  city: string;
  location: string;
  website: string;
  capacity: string;
  openingHours: string;
  email: string;
  phone: string;
  latitude: string;
  longitude: string;
  calculationMethod: string;
  iqamahOffsets: IqamahRow[];
  adSlots: AdSlotRow[];
  announcementsEn: string;
  announcementsFr: string;
  promoEnabled: boolean;
  promoDisplayDurationMs: string;
  promoCycleMs: string;
  promoInitialDelayMs: string;
  extraPrayers: ExtraPrayerRow[];
}

const EMPTY_FORM: FormState = {
  name: "",
  city: "",
  location: "",
  website: "",
  capacity: "",
  openingHours: "",
  email: "",
  phone: "",
  latitude: "",
  longitude: "",
  calculationMethod: "0",
  iqamahOffsets: [],
  adSlots: [],
  announcementsEn: "",
  announcementsFr: "",
  promoEnabled: false,
  promoDisplayDurationMs: "",
  promoCycleMs: "",
  promoInitialDelayMs: "",
  extraPrayers: [],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configToForm(c: any): FormState {
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
    adSlots: ((c.sponsors as AdSlot[]) || []).map((s) => ({
      id: String(s.id),
      label: s.label,
      image: s.image || "",
      link: s.link || "",
      weight: s.weight != null ? String(s.weight) : "",
    })),
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
      displayOnly: !!p.displayOnly,
      times: Array.isArray(p.times) ? [...p.times] : p.times ? [p.times] : [],
    })),
  };
}

function formToConfig(f: FormState): MosqueConfig {
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
    email: f.email,
    phone: f.phone,
    latitude: parseFloat(f.latitude) || 0,
    longitude: parseFloat(f.longitude) || 0,
    calculationMethod: parseInt(f.calculationMethod) || 0,
    iqamahOffsets,
    sponsors: f.adSlots.map((s) => ({
      id: parseInt(s.id) || 0,
      label: s.label,
      image: s.image || null,
      link: s.link || null,
      ...(s.weight !== "" ? { weight: parseInt(s.weight) } : {}),
    })),
    adRailSlots: f.adSlots.map((s) => {
      const sponsorId = parseInt(s.id) || 0;
      return {
        id: sponsorId,
        mode: "fixed" as const,
        sponsorId,
      };
    }),
    announcementsEn: f.announcementsEn
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    announcementsFr: f.announcementsFr
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    promo,
    extraPrayers: f.extraPrayers.map((p) => ({
      name: p.name,
      arabicName: p.arabicName,
      adhan: p.adhan || null,
      iqamah: p.iqamah || null,
      displayOnly: p.displayOnly,
      times: p.times.length > 0 ? p.times : undefined,
    })),
  };
}

// ── AlAdhan calculation methods ──────────────────────────────────────────────

const CALC_METHODS: [number, string][] = [
  [0, "Muslim World League"],
  [1, "ISNA — Islamic Society of North America"],
  [2, "Egyptian General Authority of Survey"],
  [3, "Umm Al-Qura University, Makkah"],
  [4, "University of Islamic Sciences, Karachi"],
  [5, "University of Tehran"],
  [7, "Shia Ithna-Ashari"],
  [8, "Gulf Region"],
  [9, "Kuwait"],
  [10, "Qatar"],
  [11, "Singapore (MUIS)"],
  [12, "Union Islamique de France"],
  [13, "Diyanet İşleri Başkanlığı, Turkey"],
  [14, "Russia"],
  [15, "Moonsighting Committee Worldwide"],
  [16, "Dubai"],
  [17, "JAKIM, Malaysia"],
  [18, "Tunisia"],
  [19, "Algeria"],
  [20, "Indonesia (Kemenag)"],
  [21, "Morocco"],
  [22, "Comunidade Islamica de Lisboa"],
  [23, "Jordan"],
];

// ── Sidebar nav items ────────────────────────────────────────────────────────

// Navigation items are populated dynamically in DashboardPage component
// to support i18n translations

// ── Shared UI primitives ─────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all placeholder:text-text-muted font-body-md";

const textareaCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all placeholder:text-text-muted font-body-md resize-y";

const selectCls =
  "w-full rounded-lg py-2.5 px-3 text-sm text-on-surface bg-surface-container " +
  "ghost-border focus:outline-none focus:ring-2 focus:ring-primary/25 " +
  "transition-all font-body-md";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[13px] font-medium text-text-muted mb-1.5"
    >
      {children}
    </label>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function SectionCard({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="bg-surface-panel ghost-border rounded-xl p-5 sm:p-6 scroll-mt-24"
      aria-labelledby={`${id}-heading`}
    >
      <div
        className="flex items-center gap-3 mb-5 pb-4"
        style={{ borderBottom: "1px solid var(--ghost-border-color)" }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
          <span
            className="material-symbols-outlined text-primary filled"
            style={{ fontSize: 18 }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
        <div>
          <h2
            id={`${id}-heading`}
            className="font-headline-md text-on-surface leading-snug"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-text-muted mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full",
          "border-2 border-transparent transition-colors focus-ring",
          checked ? "bg-primary" : "bg-surface-container",
        )}
        style={checked ? {} : { border: "1px solid var(--ghost-border-color)" }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
      <span
        className="cursor-pointer select-none text-sm text-on-surface"
        onClick={() => onChange(!checked)}
        aria-hidden="true"
      >
        {label}
      </span>
    </div>
  );
}

function AddRowBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1 font-label-caps text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/10 focus-ring"
      style={{ border: "1px solid rgba(var(--primary-rgb), 0.3)" }}
    >
      {children}
    </button>
  );
}

function RemoveBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-2 font-label-caps text-xs uppercase tracking-widest transition-colors focus-ring text-red-400 hover:bg-red-500/10"
      style={{ border: "1px solid rgba(239,68,68,0.3)" }}
    >
      {label}
    </button>
  );
}

// ── DashboardPage ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { token, slug, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = useT(language);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  // Start as true: config is fetched immediately on mount
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [savedForm, setSavedForm] = useState<FormState>(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState<string>("mosque-info");

  // Auth guard
  useEffect(() => {
    if (!token || !slug) setLocation("/login");
  }, [token, slug, setLocation]);

  // Load config on mount (loading initialised as true above)
  useEffect(() => {
    if (!token || !slug) return;
    const failMsg = t.dashboard.failedToLoadConfiguration;
    fetch(`${API_BASE}/api/v1/mosques?name=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(failMsg);
        return res.json();
      })
      .then((data) => {
        const loaded = configToForm(data.configuration || {});
        setForm(loaded);
        setSavedForm(loaded);
      })
      .catch((err: unknown) =>
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : failMsg,
        }),
      )
      .finally(() => setLoading(false));
  }, [token, slug, t.dashboard.failedToLoadConfiguration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/mosques/configuration`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ configuration: formToConfig(form) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { detail?: string }).detail ||
            t.dashboard.failedToSaveConfiguration,
        );
      }
      setSavedForm(form);
      setStatus({
        type: "success",
        message: t.dashboard.configurationSaved,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : t.dashboard.failedToSaveConfiguration,
      });
    } finally {
      setSaving(false);
    }
  };

  // Patch helper for flat fields
  const update = (patch: Partial<FormState>) =>
    setForm((p) => ({ ...p, ...patch }));

  // ── Iqamah offset helpers ──────────────────────────────────────────────────
  const addIqamah = () =>
    setForm((p) => ({
      ...p,
      iqamahOffsets: [
        ...p.iqamahOffsets,
        { prayerName: "", offsetMinutes: "0" },
      ],
    }));
  const removeIqamah = (i: number) =>
    setForm((p) => ({
      ...p,
      iqamahOffsets: p.iqamahOffsets.filter((_, idx) => idx !== i),
    }));
  const setIqamah = (i: number, field: keyof IqamahRow, value: string) =>
    setForm((p) => {
      const rows = [...p.iqamahOffsets];
      rows[i] = { ...rows[i], [field]: value };
      return { ...p, iqamahOffsets: rows };
    });

  // ── AdSlot helpers ─────────────────────────────────────────────────────────
  const addAdSlot = () =>
    setForm((p) => ({
      ...p,
      adSlots: [
        ...p.adSlots,
        {
          id: String(p.adSlots.length),
          label: "",
          image: "",
          link: "",
          weight: "",
        },
      ],
    }));
  const removeAdSlot = (i: number) =>
    setForm((p) => ({
      ...p,
      adSlots: p.adSlots.filter((_, idx) => idx !== i),
    }));
  const setAdSlot = (i: number, field: keyof AdSlotRow, value: string) =>
    setForm((p) => {
      const rows = [...p.adSlots];
      rows[i] = { ...rows[i], [field]: value };
      return { ...p, adSlots: rows };
    });

  // ── ExtraPrayer helpers ────────────────────────────────────────────────────
  const addExtraPrayer = () =>
    setForm((p) => ({
      ...p,
      extraPrayers: [
        ...p.extraPrayers,
        {
          name: "",
          arabicName: "",
          adhan: "",
          iqamah: "",
          displayOnly: true,
          times: [],
        },
      ],
    }));
  const removeExtraPrayer = (i: number) =>
    setForm((p) => ({
      ...p,
      extraPrayers: p.extraPrayers.filter((_, idx) => idx !== i),
    }));
  function setExtraPrayer<K extends keyof ExtraPrayerRow>(
    i: number,
    field: K,
    value: ExtraPrayerRow[K],
  ) {
    setForm((p) => {
      const rows = [...p.extraPrayers];
      rows[i] = { ...rows[i], [field]: value };
      return { ...p, extraPrayers: rows };
    });
  }
  const addExtraPrayerTime = (i: number) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      rows[i] = { ...rows[i], times: [...rows[i].times, ""] };
      return { ...p, extraPrayers: rows };
    });
  const removeExtraPrayerTime = (pIdx: number, tIdx: number) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      rows[pIdx] = {
        ...rows[pIdx],
        times: rows[pIdx].times.filter((_, i) => i !== tIdx),
      };
      return { ...p, extraPrayers: rows };
    });
  const setExtraPrayerTime = (pIdx: number, tIdx: number, value: string) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      const times = [...rows[pIdx].times];
      times[tIdx] = value;
      rows[pIdx] = { ...rows[pIdx], times };
      return { ...p, extraPrayers: rows };
    });

  // Auto-dismiss success toasts
  useEffect(() => {
    if (status?.type !== "success") return;
    const timeoutId = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const hasChanges = JSON.stringify(form) !== JSON.stringify(savedForm);

  // Suppress unused variable warning for location (kept for type checking)
  void location;

  if (!token || !slug) return null;

  return (
    <div className="dark min-h-screen bg-background-deep text-on-surface font-body-md">
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 bg-surface-panel px-6 py-4"
        style={{ borderBottom: "1px solid var(--ghost-border-color)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus-ring rounded-lg p-1 bg-none border-none cursor-pointer text-left"
          >
            <img src="/favicon.svg" alt="Divine Display" className="w-6 h-6" />
            <div>
              <span className="font-headline-md text-on-surface text-base leading-none">
                Divine Display
              </span>
              <span className="block font-label-caps text-text-muted uppercase tracking-widest text-xs mt-0.5">
                {slug}
              </span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation(`/?name=${encodeURIComponent(slug)}`)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-caps text-xs uppercase tracking-widest text-text-muted hover:text-primary hover:bg-primary/5 transition-colors focus-ring bg-none border-none cursor-pointer"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
                aria-hidden="true"
              >
                open_in_new
              </span>
              {t.dashboard.preview}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setLocation("/login");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-caps text-xs uppercase tracking-widest text-text-muted hover:text-primary hover:bg-primary/5 transition-colors focus-ring"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
                aria-hidden="true"
              >
                logout
              </span>
              <span className="hidden sm:inline">{t.dashboard.signOut}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="w-full px-6 lg:px-8 py-8 lg:pl-56">
        <div className="lg:flex lg:gap-8 lg:items-center">
          {/* Sidebar nav (desktop only) */}
          <aside
            className="hidden lg:block w-48 shrink-0 fixed top-0 left-0 h-full z-40 bg-background-deep"
            style={{ borderRight: "1px solid var(--ghost-border-color)" }}
          >
            <nav
              className="sticky space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto mt-20 mb-8 px-3"
              style={{ top: "5.5rem" }}
              aria-label="Configuration sections"
            >
              {[
                {
                  id: "mosque-info",
                  icon: "mosque",
                  label: t.dashboard.mosqueInformation,
                },
                {
                  id: "location",
                  icon: "location_on",
                  label: "Location & Calculation",
                },
                {
                  id: "iqamah",
                  icon: "schedule",
                  label: t.dashboard.iqamahOffsets,
                },
                {
                  id: "announcements",
                  icon: "campaign",
                  label: t.dashboard.announcements,
                },
                {
                  id: "ad-slots",
                  icon: "storefront",
                  label: t.dashboard.adSlots,
                },
                { id: "promo", icon: "timer", label: t.dashboard.promoTiming },
                {
                  id: "extra-prayers",
                  icon: "add_circle",
                  label: t.dashboard.extraPrayers,
                },
              ].map(({ id, icon, label }) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const section = document.getElementById(id);
                      if (!section) return;
                      const top = section.offsetTop - 112;
                      window.history.replaceState(null, "", `#${id}`);
                      window.scrollTo({
                        top: Math.max(0, top),
                        behavior: "smooth",
                      });
                      setActiveSection(id);
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors focus-ring",
                      isActive
                        ? "text-primary bg-primary/10 font-medium"
                        : "text-text-muted hover:text-primary hover:bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined shrink-0",
                        isActive && "filled",
                      )}
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span>{label}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 lg:min-h-[130vh]">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-24 text-text-muted">
                <span
                  className="material-symbols-outlined text-primary motion-safe:animate-spin"
                  style={{ fontSize: 32 }}
                  aria-hidden="true"
                >
                  sync
                </span>
                <span className="text-sm">
                  {t.dashboard.loadingConfiguration}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* ── 1. Mosque Information ──────────────────────────── */}
                  <SectionCard
                    id="mosque-info"
                    icon="mosque"
                    title={t.dashboard.mosqueInformation}
                    description={t.dashboard.mosqueInformationDesc}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="cfg-name" label={t.dashboard.mosqueNameLabel}>
                        <input
                          id="cfg-name"
                          className={inputCls}
                          value={form.name}
                          onChange={(e) => update({ name: e.target.value })}
                          placeholder={t.dashboard.mosaicPlaceholder}
                          autoComplete="organization"
                        />
                      </Field>
                      <Field id="cfg-city" label={t.dashboard.cityLabel}>
                        <input
                          id="cfg-city"
                          className={inputCls}
                          value={form.city}
                          onChange={(e) => update({ city: e.target.value })}
                          placeholder={t.dashboard.cityPlaceholder}
                          autoComplete="address-level2"
                        />
                      </Field>
                    </div>
                    <Field
                      id="cfg-location"
                      label={t.dashboard.fullAddressLabel}
                    >
                      <input
                        id="cfg-location"
                        className={inputCls}
                        value={form.location}
                        onChange={(e) => update({ location: e.target.value })}
                        placeholder={t.dashboard.fullAddressPlaceholder}
                        autoComplete="street-address"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="cfg-website" label={t.dashboard.websiteLabel}>
                        <input
                          id="cfg-website"
                          type="url"
                          className={inputCls}
                          value={form.website}
                          onChange={(e) => update({ website: e.target.value })}
                          placeholder={t.dashboard.websitePlaceholder}
                          autoComplete="url"
                        />
                      </Field>
                      <Field
                        id="cfg-capacity"
                        label={t.dashboard.capacityLabel}
                      >
                        <input
                          id="cfg-capacity"
                          className={inputCls}
                          value={form.capacity}
                          onChange={(e) => update({ capacity: e.target.value })}
                          placeholder={t.dashboard.capacityPlaceholder}
                        />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="cfg-email" label={t.dashboard.emailLabel}>
                        <input
                          id="cfg-email"
                          type="email"
                          className={inputCls}
                          value={form.email}
                          onChange={(e) => update({ email: e.target.value })}
                          placeholder={t.dashboard.emailPlaceholder}
                          autoComplete="email"
                        />
                      </Field>
                      <Field id="cfg-phone" label={t.dashboard.phoneLabel}>
                        <input
                          id="cfg-phone"
                          type="tel"
                          className={inputCls}
                          value={form.phone}
                          onChange={(e) => update({ phone: e.target.value })}
                          placeholder={t.dashboard.phonePlaceholder}
                          autoComplete="tel"
                        />
                      </Field>
                    </div>
                    <Field id="cfg-hours" label={t.dashboard.openingHoursLabel}>
                      <input
                        id="cfg-hours"
                        className={inputCls}
                        value={form.openingHours}
                        onChange={(e) =>
                          update({ openingHours: e.target.value })
                        }
                        placeholder={t.dashboard.openingHoursPlaceholder}
                      />
                    </Field>
                  </SectionCard>

                  {/* ── 2. Location & Calculation ──────────────────────── */}
                  <SectionCard
                    id="location"
                    icon="location_on"
                    title={t.dashboard.locationCalculation}
                    description={t.dashboard.locationCalculationDesc}
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field id="cfg-lat" label={t.dashboard.latitudeLabel}>
                        <input
                          id="cfg-lat"
                          type="number"
                          step="any"
                          className={inputCls}
                          value={form.latitude}
                          onChange={(e) => update({ latitude: e.target.value })}
                          placeholder={t.dashboard.latitudePlaceholder}
                        />
                      </Field>
                      <Field id="cfg-lng" label={t.dashboard.longitudeLabel}>
                        <input
                          id="cfg-lng"
                          type="number"
                          step="any"
                          className={inputCls}
                          value={form.longitude}
                          onChange={(e) =>
                            update({ longitude: e.target.value })
                          }
                          placeholder={t.dashboard.longitudePlaceholder}
                        />
                      </Field>
                      <Field
                        id="cfg-method"
                        label={t.dashboard.calculationMethodLabel}
                      >
                        <select
                          id="cfg-method"
                          className={selectCls}
                          value={form.calculationMethod}
                          onChange={(e) =>
                            update({ calculationMethod: e.target.value })
                          }
                        >
                          {CALC_METHODS.map(([value, label]) => (
                            <option key={value} value={value}>
                              {value} — {label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </SectionCard>

                  {/* ── 3. Iqamah Offsets ──────────────────────────────── */}
                  <SectionCard
                    id="iqamah"
                    icon="schedule"
                    title={t.dashboard.iqamahOffsets}
                    description={t.dashboard.iqamahOffsetsDesc}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-text-muted">
                        {form.iqamahOffsets.length === 0
                          ? t.dashboard.noOffsetsConfigured
                          : t.dashboard.offsetsConfigured(
                              form.iqamahOffsets.length,
                            )}
                      </p>
                      <AddRowBtn onClick={addIqamah}>
                        {t.dashboard.addPrayer}
                      </AddRowBtn>
                    </div>
                    {form.iqamahOffsets.length > 0 && (
                      <div className="space-y-3">
                        {form.iqamahOffsets.map((row, i) => (
                          <div
                            key={i}
                            className="grid gap-3 rounded-xl p-3 ghost-border bg-surface-container sm:grid-cols-[1fr_1fr_auto] items-end"
                          >
                            <Field
                              id={`iq-name-${i}`}
                              label={t.dashboard.prayerNameLabel}
                            >
                              <input
                                id={`iq-name-${i}`}
                                className={inputCls}
                                value={row.prayerName}
                                onChange={(e) =>
                                  setIqamah(i, "prayerName", e.target.value)
                                }
                                placeholder={t.dashboard.prayerNamePlaceholder}
                              />
                            </Field>
                            <Field
                              id={`iq-offset-${i}`}
                              label={t.dashboard.offsetMinutesLabel}
                            >
                              <input
                                id={`iq-offset-${i}`}
                                type="number"
                                min="0"
                                className={inputCls}
                                value={row.offsetMinutes}
                                onChange={(e) =>
                                  setIqamah(i, "offsetMinutes", e.target.value)
                                }
                                placeholder={
                                  t.dashboard.offsetMinutesPlaceholder
                                }
                              />
                            </Field>
                            <div className="pb-0.5">
                              <RemoveBtn
                                onClick={() => removeIqamah(i)}
                                label={t.dashboard.removeLabel}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  {/* ── 4. Announcements ───────────────────────────────── */}
                  <SectionCard
                    id="announcements"
                    icon="campaign"
                    title={t.dashboard.announcements}
                    description={t.dashboard.announcementsDesc}
                  >
                    <Field
                      id="cfg-ann-en"
                      label={t.dashboard.englishAnnouncementsLabel}
                    >
                      <textarea
                        id="cfg-ann-en"
                        className={textareaCls}
                        rows={4}
                        value={form.announcementsEn}
                        onChange={(e) =>
                          update({ announcementsEn: e.target.value })
                        }
                        placeholder={
                          t.dashboard.englishAnnouncementsPlaceholder
                        }
                        aria-describedby="ann-help"
                      />
                    </Field>
                    <Field
                      id="cfg-ann-fr"
                      label={t.dashboard.frenchAnnouncementsLabel}
                    >
                      <textarea
                        id="cfg-ann-fr"
                        className={textareaCls}
                        rows={4}
                        value={form.announcementsFr}
                        onChange={(e) =>
                          update({ announcementsFr: e.target.value })
                        }
                        placeholder={t.dashboard.frenchAnnouncementsPlaceholder}
                        aria-describedby="ann-help"
                      />
                    </Field>
                    <p id="ann-help" className="text-xs text-text-muted -mt-1">
                      {t.dashboard.announcementsHelp}
                    </p>
                  </SectionCard>

                  {/* ── 5. Ad Slots ────────────────────────────────────── */}
                  <SectionCard
                    id="ad-slots"
                    icon="storefront"
                    title={t.dashboard.adSlots}
                    description={t.dashboard.adSlotsDesc}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-text-muted">
                        {form.adSlots.length === 0
                          ? t.dashboard.noAdSlotsConfigured
                          : t.dashboard.adSlotCount(form.adSlots.length)}
                      </p>
                      <AddRowBtn onClick={addAdSlot}>
                        {t.dashboard.addSlot}
                      </AddRowBtn>
                    </div>
                    {form.adSlots.length > 0 && (
                      <div className="space-y-4">
                        {form.adSlots.map((slot, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-5 ghost-border bg-surface-container"
                          >
                            <div className="flex gap-4 items-stretch">
                              {/* Fields column */}
                              <div className="flex-1 min-w-0 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                                  <Field
                                    id={`ad-id-${i}`}
                                    label={t.dashboard.idLabel}
                                  >
                                    <input
                                      id={`ad-id-${i}`}
                                      type="number"
                                      min="0"
                                      className={inputCls}
                                      value={slot.id}
                                      onChange={(e) =>
                                        setAdSlot(i, "id", e.target.value)
                                      }
                                    />
                                  </Field>
                                  <Field
                                    id={`ad-label-${i}`}
                                    label={t.dashboard.sponsorNameLabel}
                                  >
                                    <input
                                      id={`ad-label-${i}`}
                                      className={inputCls}
                                      value={slot.label}
                                      onChange={(e) =>
                                        setAdSlot(i, "label", e.target.value)
                                      }
                                      placeholder={
                                        t.dashboard.sponsorNamePlaceholder
                                      }
                                    />
                                  </Field>
                                </div>

                                <Field
                                  id={`ad-image-${i}`}
                                  label={t.dashboard.imageLabel}
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      id={`ad-image-${i}`}
                                      className={cn(inputCls, "flex-1")}
                                      value={slot.image}
                                      onChange={(e) =>
                                        setAdSlot(i, "image", e.target.value)
                                      }
                                      placeholder={t.dashboard.imagePlaceholder}
                                    />
                                    <button
                                      type="button"
                                      aria-label={t.dashboard.uploadImageLabel}
                                      onClick={() =>
                                        (
                                          document.getElementById(
                                            `ad-file-${i}`,
                                          ) as HTMLInputElement | null
                                        )?.click()
                                      }
                                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ghost-border bg-surface-container hover:bg-primary/10 hover:border-primary/30 transition-colors focus-ring"
                                    >
                                      <span
                                        className="material-symbols-outlined text-text-muted"
                                        style={{ fontSize: 18 }}
                                        aria-hidden="true"
                                      >
                                        upload
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={t.dashboard.clearImageLabel}
                                      onClick={() => setAdSlot(i, "image", "")}
                                      className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
                                      style={{
                                        border: "1px solid rgba(239,68,68,0.3)",
                                      }}
                                    >
                                      <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: 18 }}
                                        aria-hidden="true"
                                      >
                                        delete
                                      </span>
                                    </button>
                                    <input
                                      id={`ad-file-${i}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () =>
                                          setAdSlot(
                                            i,
                                            "image",
                                            reader.result as string,
                                          );
                                        reader.readAsDataURL(file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </div>
                                </Field>

                                <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
                                  <Field
                                    id={`ad-link-${i}`}
                                    label={t.dashboard.linkUrlLabel}
                                  >
                                    <input
                                      id={`ad-link-${i}`}
                                      type="url"
                                      className={inputCls}
                                      value={slot.link}
                                      onChange={(e) =>
                                        setAdSlot(i, "link", e.target.value)
                                      }
                                      placeholder={
                                        t.dashboard.linkUrlPlaceholder
                                      }
                                    />
                                  </Field>
                                  <Field
                                    id={`ad-weight-${i}`}
                                    label={t.dashboard.rotationWeightLabel}
                                  >
                                    <input
                                      id={`ad-weight-${i}`}
                                      type="number"
                                      min="0"
                                      className={inputCls}
                                      value={slot.weight}
                                      onChange={(e) =>
                                        setAdSlot(i, "weight", e.target.value)
                                      }
                                      placeholder={
                                        t.dashboard.rotationWeightPlaceholder
                                      }
                                    />
                                  </Field>
                                  <div className="pb-0.5">
                                    <RemoveBtn
                                      onClick={() => removeAdSlot(i)}
                                      label={t.dashboard.removeSlotLabel}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Preview column — shown when an image URL is set */}
                              {slot.image &&
                                (slot.image.startsWith("data:") ||
                                  slot.image.startsWith("http")) && (
                                  <div className="hidden sm:flex shrink-0 w-1/4 h-full items-center justify-center">
                                    <img
                                      src={slot.image}
                                      alt={`${t.dashboard.previewLabel.replace("{label}", slot.label || t.dashboard.adSlotPreview)}`}
                                      className="w-full h-full rounded-lg object-contain ghost-border"
                                    />
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  {/* ── 6. Promo Timing ────────────────────────────────── */}
                  <SectionCard
                    id="promo"
                    icon="timer"
                    title={t.dashboard.promoTiming}
                    description={t.dashboard.promoTimingDesc}
                  >
                    <Toggle
                      id="promo-enabled"
                      checked={form.promoEnabled}
                      onChange={(v) => update({ promoEnabled: v })}
                      label={t.dashboard.enablePromoRail}
                    />
                    {form.promoEnabled && (
                      <div className="grid gap-4 sm:grid-cols-3 pt-1">
                        <Field
                          id="promo-duration"
                          label={t.dashboard.displayDurationLabel}
                        >
                          <input
                            id="promo-duration"
                            type="number"
                            min="0"
                            className={inputCls}
                            value={form.promoDisplayDurationMs}
                            onChange={(e) =>
                              update({
                                promoDisplayDurationMs: e.target.value,
                              })
                            }
                            placeholder={t.dashboard.displayDurationPlaceholder}
                          />
                        </Field>
                        <Field
                          id="promo-cycle"
                          label={t.dashboard.cycleIntervalLabel}
                        >
                          <input
                            id="promo-cycle"
                            type="number"
                            min="0"
                            className={inputCls}
                            value={form.promoCycleMs}
                            onChange={(e) =>
                              update({ promoCycleMs: e.target.value })
                            }
                            placeholder={t.dashboard.cycleIntervalPlaceholder}
                          />
                        </Field>
                        <Field
                          id="promo-delay"
                          label={t.dashboard.initialDelayLabel}
                        >
                          <input
                            id="promo-delay"
                            type="number"
                            min="0"
                            className={inputCls}
                            value={form.promoInitialDelayMs}
                            onChange={(e) =>
                              update({ promoInitialDelayMs: e.target.value })
                            }
                            placeholder={t.dashboard.initialDelayPlaceholder}
                          />
                        </Field>
                      </div>
                    )}
                  </SectionCard>

                  {/* ── 7. Extra Prayers ───────────────────────────────── */}
                  <SectionCard
                    id="extra-prayers"
                    icon="add_circle"
                    title={t.dashboard.extraPrayers}
                    description={t.dashboard.extraPrayersDesc}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-text-muted">
                        {form.extraPrayers.length === 0
                          ? t.dashboard.noExtraPrayersConfigured
                          : t.dashboard.extraPrayerCount(
                              form.extraPrayers.length,
                            )}
                      </p>
                      <AddRowBtn onClick={addExtraPrayer}>
                        {t.dashboard.addExtraPrayer}
                      </AddRowBtn>
                    </div>
                    {form.extraPrayers.length > 0 && (
                      <div className="space-y-4">
                        {form.extraPrayers.map((prayer, i) => (
                          <div
                            key={i}
                            className="rounded-xl p-4 space-y-4 ghost-border bg-surface-container"
                          >
                            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                              <Field
                                id={`ep-name-${i}`}
                                label={t.dashboard.prayerNameLatinLabel}
                              >
                                <input
                                  id={`ep-name-${i}`}
                                  className={inputCls}
                                  value={prayer.name}
                                  onChange={(e) =>
                                    setExtraPrayer(i, "name", e.target.value)
                                  }
                                  placeholder={
                                    t.dashboard.prayerNameLatinPlaceholder
                                  }
                                />
                              </Field>
                              <Field
                                id={`ep-arabic-${i}`}
                                label={t.dashboard.arabicNameLabel}
                              >
                                <input
                                  id={`ep-arabic-${i}`}
                                  lang="ar"
                                  dir="rtl"
                                  className={inputCls}
                                  value={prayer.arabicName}
                                  onChange={(e) =>
                                    setExtraPrayer(
                                      i,
                                      "arabicName",
                                      e.target.value,
                                    )
                                  }
                                  placeholder={
                                    t.dashboard.arabicNamePlaceholder
                                  }
                                />
                              </Field>
                              <div className="sm:pb-0.5">
                                <RemoveBtn
                                  onClick={() => removeExtraPrayer(i)}
                                  label={t.dashboard.removePrayerLabel}
                                />
                              </div>
                            </div>

                            <Toggle
                              id={`ep-display-${i}`}
                              checked={prayer.displayOnly}
                              onChange={(v) =>
                                setExtraPrayer(i, "displayOnly", v)
                              }
                              label={t.dashboard.displayOnlyLabel}
                            />

                            {!prayer.displayOnly && (
                              <div className="grid gap-3 sm:grid-cols-2">
                                <Field
                                  id={`ep-adhan-${i}`}
                                  label={t.dashboard.adhanTimeLabel}
                                >
                                  <input
                                    id={`ep-adhan-${i}`}
                                    className={inputCls}
                                    value={prayer.adhan}
                                    onChange={(e) =>
                                      setExtraPrayer(i, "adhan", e.target.value)
                                    }
                                    placeholder={
                                      t.dashboard.adhanTimePlaceholder
                                    }
                                  />
                                </Field>
                                <Field
                                  id={`ep-iqamah-${i}`}
                                  label={t.dashboard.iqamahTimeLabel}
                                >
                                  <input
                                    id={`ep-iqamah-${i}`}
                                    className={inputCls}
                                    value={prayer.iqamah}
                                    onChange={(e) =>
                                      setExtraPrayer(
                                        i,
                                        "iqamah",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={
                                      t.dashboard.iqamahTimePlaceholder
                                    }
                                  />
                                </Field>
                              </div>
                            )}

                            {/* Session times (multiple occurrences) */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <FieldLabel>
                                  {t.dashboard.sessionTimesLabel}
                                </FieldLabel>
                                <AddRowBtn
                                  onClick={() => addExtraPrayerTime(i)}
                                >
                                  {t.dashboard.addTimeLabel}
                                </AddRowBtn>
                              </div>
                              {prayer.times.length === 0 ? (
                                <p className="text-xs text-text-muted italic">
                                  {t.dashboard.noSessionTimes}
                                </p>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  {prayer.times.map((time, ti) => (
                                    <div
                                      key={ti}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        className={cn(
                                          inputCls,
                                          "flex-1 min-w-0",
                                        )}
                                        value={time}
                                        onChange={(e) =>
                                          setExtraPrayerTime(
                                            i,
                                            ti,
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          t.dashboard.sessionTimePlaceholder
                                        }
                                        aria-label={t.dashboard.sessionTimeLabel(
                                          ti,
                                          prayer.name,
                                        )}
                                      />
                                      <button
                                        type="button"
                                        aria-label={t.dashboard.removeTimeLabel}
                                        onClick={() =>
                                          removeExtraPrayerTime(i, ti)
                                        }
                                        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
                                        style={{
                                          border:
                                            "1px solid rgba(239,68,68,0.3)",
                                        }}
                                      >
                                        <span
                                          className="material-symbols-outlined"
                                          style={{ fontSize: 16 }}
                                          aria-hidden="true"
                                        >
                                          close
                                        </span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>

                {/* ── Sticky save bar ────────────────────────────────────── */}
                <div
                  className="sticky bottom-0 mt-8 w-full py-4 bg-background-deep"
                  style={{ borderTop: "1px solid var(--ghost-border-color)" }}
                >
                  {status && (
                    <div
                      role={status.type === "error" ? "alert" : "status"}
                      aria-live={
                        status.type === "error" ? "assertive" : "polite"
                      }
                      aria-atomic="true"
                      className={cn(
                        "mb-3 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2",
                        status.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400",
                      )}
                    >
                      <span
                        className="material-symbols-outlined shrink-0"
                        style={{ fontSize: 18 }}
                        aria-hidden="true"
                      >
                        {status.type === "success" ? "check_circle" : "error"}
                      </span>
                      {status.message}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-text-muted hidden sm:block">
                      {t.dashboard.changesApplyImmediately}
                    </p>
                    <div className="flex items-center gap-3 ml-auto">
                      {hasChanges && !saving && (
                        <button
                          type="button"
                          onClick={() => setForm(savedForm)}
                          className="px-4 py-2.5 rounded-lg text-sm text-text-muted hover:text-on-surface hover:bg-surface-container ghost-border transition-colors focus-ring"
                        >
                          {t.dashboard.discardLabel}
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={saving || !hasChanges}
                        className={cn(
                          "gold-button rounded-lg px-6 py-3 font-semibold text-sm",
                          "flex items-center gap-2 whitespace-nowrap transition-opacity",
                          (saving || !hasChanges) &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      >
                        {saving ? (
                          <>
                            <span
                              className="material-symbols-outlined motion-safe:animate-spin"
                              style={{ fontSize: 18 }}
                              aria-hidden="true"
                            >
                              sync
                            </span>
                            {t.dashboard.savingLabel}
                          </>
                        ) : (
                          <>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: 18 }}
                              aria-hidden="true"
                            >
                              save
                            </span>
                            {t.dashboard.saveConfigurationLabel}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
