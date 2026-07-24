import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import { useObjectUrlMap } from "../hooks/useObjectUrl";
import { DashboardFormSections } from "../components/dashboard/DashboardFormSections";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardSaveBar } from "../components/dashboard/DashboardSaveBar";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import type {
  DashboardStatus,
  ExtraPrayerRow,
  FormState,
  IqamahRow,
  RailSlotRow,
  SponsorRow,
} from "../components/dashboard/types";
import { EMPTY_FORM } from "../components/dashboard/types";
import {
  configToForm,
  formToConfig,
  mapValidationLocToFieldId,
} from "../utils/dashboardForm";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const DASHBOARD_SECTION_IDS = [
  "mosque-info",
  "location",
  "iqamah",
  "announcements",
  "sponsors",
  "ad-rail-slots",
  "promo",
  "extra-prayers",
] as const;

interface ApiValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
}

export function DashboardPage() {
  const { token, slug, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = useT(language).dashboard;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<DashboardStatus | null>(null);
  const [fieldErrorIds, setFieldErrorIds] = useState<string[]>([]);
  const previousFieldErrorIdsRef = useRef<string[]>([]);
  const [savedForm, setSavedForm] = useState<FormState>(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState<string>("mosque-info");

  // Pending logo/sponsor images selected by the user but not yet uploaded.
  // These stay out of `form` so they never get serialized into the saved
  // configuration directly — they're only uploaded (and swapped for hosted
  // URLs) right before the configuration is sent to the backend.
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sponsorFiles, setSponsorFiles] = useState<Record<string, File>>({});
  const sponsorPreviewUrls = useObjectUrlMap(sponsorFiles);

  const handleUnauthorized = useCallback(() => {
    logout();
    setLocation("/login");
    throw new Error("unauthorized");
  }, [logout, setLocation]);

  useEffect(() => {
    if (!isAuthenticated || !slug) setLocation("/login");
  }, [isAuthenticated, slug, setLocation]);

  useEffect(() => {
    if (!token || !slug) return;
    const failMsg = t.failedToLoadConfiguration;

    fetch(`${API_BASE}/api/v1/mosques?name=${encodeURIComponent(slug)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          handleUnauthorized();
        }
        if (!res.ok) throw new Error(failMsg);
        return res.json();
      })
      .then((data) => {
        const loaded = configToForm(data.configuration || {});
        setForm(loaded);
        setSavedForm(loaded);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "unauthorized") return;
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : failMsg,
        });
      })
      .finally(() => setLoading(false));
  }, [token, slug, handleUnauthorized, t.failedToLoadConfiguration]);

  useEffect(() => {
    const previous = previousFieldErrorIdsRef.current;
    for (const id of previous) {
      const element = document.getElementById(id);
      if (!element) continue;
      element.classList.remove("ring-2", "ring-red-500/40", "border-red-500");
    }

    for (const id of fieldErrorIds) {
      const element = document.getElementById(id);
      if (!element) continue;
      element.classList.add("ring-2", "ring-red-500/40", "border-red-500");
    }

    previousFieldErrorIdsRef.current = fieldErrorIds;
  }, [fieldErrorIds]);

  useEffect(() => {
    if (loading) return;

    const offsetTop = 140;

    const updateActiveSectionFromScroll = () => {
      const sections = DASHBOARD_SECTION_IDS.map((id) =>
        document.getElementById(id),
      ).filter((section): section is HTMLElement => Boolean(section));

      if (sections.length === 0) return;

      let currentSectionId = sections[0].id;
      for (const section of sections) {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= offsetTop) {
          currentSectionId = section.id;
          continue;
        }
        break;
      }

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 16;
      if (nearBottom) {
        currentSectionId = sections[sections.length - 1].id;
      }

      setActiveSection((prev) =>
        prev === currentSectionId ? prev : currentSectionId,
      );
    };

    updateActiveSectionFromScroll();
    window.addEventListener("scroll", updateActiveSectionFromScroll, {
      passive: true,
    });
    window.addEventListener("resize", updateActiveSectionFromScroll);

    return () => {
      window.removeEventListener("scroll", updateActiveSectionFromScroll);
      window.removeEventListener("resize", updateActiveSectionFromScroll);
    };
  }, [loading]);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch(`${API_BASE}/api/v1/images/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
      }

      if (!res.ok) throw new Error("image-upload-failed");

      const data = await res.json();
      return (data as { url: string }).url;
    },
    [token, handleUnauthorized],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    setFieldErrorIds([]);

    // Pending logo/sponsor images are only uploaded now, right before the
    // configuration that references them is sent to the backend. Until this
    // point they only exist as local blob previews.
    let resolvedLogo = form.logo;
    let resolvedSponsors = form.sponsors;

    try {
      if (logoFile) {
        resolvedLogo = await uploadImage(logoFile);
      }

      const pendingSponsorIds = form.sponsors
        .map((sponsor) => sponsor.id)
        .filter((id) => Boolean(sponsorFiles[id]));

      if (pendingSponsorIds.length > 0) {
        const uploadedUrls = await Promise.all(
          pendingSponsorIds.map((id) => uploadImage(sponsorFiles[id])),
        );
        const urlById = new Map(
          pendingSponsorIds.map((id, idx) => [id, uploadedUrls[idx]]),
        );
        resolvedSponsors = form.sponsors.map((sponsor) => {
          const uploadedUrl = urlById.get(sponsor.id);
          return uploadedUrl ? { ...sponsor, image: uploadedUrl } : sponsor;
        });
      }
    } catch (err: unknown) {
      setSaving(false);
      if (err instanceof Error && err.message === "unauthorized") return;
      setStatus({ type: "error", message: t.failedToUploadImage });
      return;
    }

    const resolvedForm: FormState = {
      ...form,
      logo: resolvedLogo,
      sponsors: resolvedSponsors,
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/mosques`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ configuration: formToConfig(resolvedForm) }),
      });

      if (res.status === 401 || res.status === 403) {
        handleUnauthorized();
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = (data as { detail?: unknown }).detail;
        const issues = Array.isArray(detail)
          ? (detail as ApiValidationIssue[])
          : [];

        const mappedFieldIds = issues
          .map((issue) =>
            Array.isArray(issue.loc)
              ? mapValidationLocToFieldId(issue.loc)
              : null,
          )
          .filter((id): id is string => Boolean(id));

        if (mappedFieldIds.length > 0) {
          const uniqueFieldIds = [...new Set(mappedFieldIds)];
          setFieldErrorIds(uniqueFieldIds);
          const firstErrorField = document.getElementById(uniqueFieldIds[0]);
          firstErrorField?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }

        const firstIssueMessage = issues.find((issue) => issue.msg)?.msg;
        const detailMessage =
          typeof detail === "string" ? detail : firstIssueMessage;

        throw new Error(detailMessage || t.failedToSaveConfiguration);
      }

      setFieldErrorIds([]);
      setForm(resolvedForm);
      setSavedForm(resolvedForm);
      setLogoFile(null);
      setSponsorFiles({});
      setStatus({
        type: "success",
        message: t.configurationSaved,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "unauthorized") return;
      setStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : t.failedToSaveConfiguration,
      });
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<FormState>) =>
    setForm((p) => ({ ...p, ...patch }));

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

  const addSponsor = () =>
    setForm((p) => ({
      ...p,
      sponsors: [
        ...p.sponsors,
        {
          id: String(p.sponsors.length + 1),
          label: "",
          image: "",
          link: "",
          weight: "",
        },
      ],
    }));

  const removeSponsor = (i: number) => {
    const removedId = form.sponsors[i]?.id;
    if (removedId) {
      setSponsorFiles((prev) => {
        if (!(removedId in prev)) return prev;
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
    }
    setForm((p) => ({
      ...p,
      sponsors: p.sponsors.filter((_, idx) => idx !== i),
    }));
  };

  const setSponsor = (i: number, field: keyof SponsorRow, value: string) =>
    setForm((p) => {
      const rows = [...p.sponsors];
      rows[i] = { ...rows[i], [field]: value };
      return { ...p, sponsors: rows };
    });

  const handleLogoFileChange = (file: File | null) => setLogoFile(file);

  const handleClearLogo = () => {
    setLogoFile(null);
    update({ logo: "" });
  };

  const handleSponsorFileChange = (i: number, file: File | null) => {
    const id = form.sponsors[i]?.id;
    if (!id) return;
    setSponsorFiles((prev) => {
      const next = { ...prev };
      if (file) next[id] = file;
      else delete next[id];
      return next;
    });
  };

  const handleClearSponsorImage = (i: number) => {
    const id = form.sponsors[i]?.id;
    if (id) {
      setSponsorFiles((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setSponsor(i, "image", "");
  };

  const addAdRailSlot = () =>
    setForm((p) => ({
      ...p,
      adRailSlots: [
        ...p.adRailSlots,
        {
          id: String(p.adRailSlots.length + 1),
          mode: "fixed",
          sponsorId: "",
        },
      ],
    }));

  const removeAdRailSlot = (i: number) =>
    setForm((p) => ({
      ...p,
      adRailSlots: p.adRailSlots.filter((_, idx) => idx !== i),
    }));

  const setAdRailSlot = (
    i: number,
    field: keyof RailSlotRow,
    value: string | RailSlotRow["mode"],
  ) =>
    setForm((p) => {
      const rows = [...p.adRailSlots];
      rows[i] = { ...rows[i], [field]: value };
      if (field === "mode" && value === "dynamic") {
        rows[i].sponsorId = "";
      }
      return { ...p, adRailSlots: rows };
    });

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
          schedule: [],
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

  const addExtraPrayerScheduleDate = (i: number) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      rows[i] = { ...rows[i], schedule: [...rows[i].schedule, ""] };
      return { ...p, extraPrayers: rows };
    });

  const removeExtraPrayerScheduleDate = (pIdx: number, scheduleIdx: number) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      rows[pIdx] = {
        ...rows[pIdx],
        schedule: rows[pIdx].schedule.filter((_, i) => i !== scheduleIdx),
      };
      return { ...p, extraPrayers: rows };
    });

  const setExtraPrayerScheduleDate = (
    pIdx: number,
    scheduleIdx: number,
    value: string,
  ) =>
    setForm((p) => {
      const rows = [...p.extraPrayers];
      const schedule = [...rows[pIdx].schedule];
      schedule[scheduleIdx] = value;
      rows[pIdx] = { ...rows[pIdx], schedule };
      return { ...p, extraPrayers: rows };
    });

  useEffect(() => {
    if (status?.type !== "success") return;
    const timeoutId = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const hasPendingUploads =
    Boolean(logoFile) || Object.keys(sponsorFiles).length > 0;
  const hasChanges =
    hasPendingUploads || JSON.stringify(form) !== JSON.stringify(savedForm);

  if (!isAuthenticated || !token || !slug) return null;

  return (
    <div className="dark min-h-screen bg-background-deep text-on-surface font-body-md">
      <DashboardHeader
        slug={slug}
        t={t}
        onHome={() => setLocation("/")}
        onPreview={() => setLocation(`/?name=${encodeURIComponent(slug)}`)}
        onSignOut={() => {
          logout();
          setLocation("/login");
        }}
      />

      <div className="w-full px-6 lg:px-8 py-8 lg:pl-56">
        <div className="lg:flex lg:gap-8 lg:items-center">
          <DashboardSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            t={t}
          />

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
                <span className="text-sm">{t.loadingConfiguration}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="pb-28">
                <DashboardFormSections
                  form={form}
                  t={t}
                  update={update}
                  logoFile={logoFile}
                  onLogoFileChange={handleLogoFileChange}
                  onClearLogo={handleClearLogo}
                  sponsorFiles={sponsorFiles}
                  sponsorPreviewUrls={sponsorPreviewUrls}
                  onSponsorFileChange={handleSponsorFileChange}
                  onClearSponsorImage={handleClearSponsorImage}
                  addIqamah={addIqamah}
                  removeIqamah={removeIqamah}
                  setIqamah={setIqamah}
                  addSponsor={addSponsor}
                  removeSponsor={removeSponsor}
                  setSponsor={setSponsor}
                  addAdRailSlot={addAdRailSlot}
                  removeAdRailSlot={removeAdRailSlot}
                  setAdRailSlot={setAdRailSlot}
                  addExtraPrayer={addExtraPrayer}
                  removeExtraPrayer={removeExtraPrayer}
                  setExtraPrayer={setExtraPrayer}
                  addExtraPrayerTime={addExtraPrayerTime}
                  removeExtraPrayerTime={removeExtraPrayerTime}
                  setExtraPrayerTime={setExtraPrayerTime}
                  addExtraPrayerScheduleDate={addExtraPrayerScheduleDate}
                  removeExtraPrayerScheduleDate={removeExtraPrayerScheduleDate}
                  setExtraPrayerScheduleDate={setExtraPrayerScheduleDate}
                />

                <DashboardSaveBar
                  status={status}
                  hasChanges={hasChanges}
                  saving={saving}
                  t={t}
                  onDiscard={() => {
                    setForm(savedForm);
                    setLogoFile(null);
                    setSponsorFiles({});
                  }}
                />
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
