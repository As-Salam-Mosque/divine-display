import { cn } from "../../utils/cn";
import { isWeekdayAbbr } from "../../utils/prayerSchedule";
import {
  AddRowBtn,
  DayOfWeekPicker,
  Field,
  FieldLabel,
  RemoveBtn,
  SectionCard,
  Toggle,
  inputCls,
  selectCls,
  textareaCls,
} from "./FormPrimitives";
import type {
  ExtraPrayerRow,
  FormState,
  RailSlotRow,
  SponsorRow,
  DashboardTranslations,
} from "./types";

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

interface DashboardFormSectionsProps {
  form: FormState;
  t: DashboardTranslations;
  update: (patch: Partial<FormState>) => void;
  logoFile: File | null;
  onLogoFileChange: (file: File | null) => void;
  onClearLogo: () => void;
  sponsorFiles: Record<string, File>;
  sponsorPreviewUrls: Record<string, string>;
  onSponsorFileChange: (index: number, file: File | null) => void;
  onClearSponsorImage: (index: number) => void;
  addIqamah: () => void;
  removeIqamah: (index: number) => void;
  setIqamah: (
    index: number,
    field: "prayerName" | "offsetMinutes",
    value: string,
  ) => void;
  addSponsor: () => void;
  removeSponsor: (index: number) => void;
  setSponsor: (index: number, field: keyof SponsorRow, value: string) => void;
  addAdRailSlot: () => void;
  removeAdRailSlot: (index: number) => void;
  setAdRailSlot: (
    index: number,
    field: keyof RailSlotRow,
    value: string | RailSlotRow["mode"],
  ) => void;
  addExtraPrayer: () => void;
  removeExtraPrayer: (index: number) => void;
  setExtraPrayer: <K extends keyof ExtraPrayerRow>(
    index: number,
    field: K,
    value: ExtraPrayerRow[K],
  ) => void;
  addExtraPrayerTime: (index: number) => void;
  removeExtraPrayerTime: (prayerIndex: number, timeIndex: number) => void;
  setExtraPrayerTime: (
    prayerIndex: number,
    timeIndex: number,
    value: string,
  ) => void;
  addExtraPrayerScheduleDate: (index: number) => void;
  removeExtraPrayerScheduleDate: (
    prayerIndex: number,
    scheduleIndex: number,
  ) => void;
  setExtraPrayerScheduleDate: (
    prayerIndex: number,
    scheduleIndex: number,
    value: string,
  ) => void;
}

export function DashboardFormSections({
  form,
  t,
  update,
  logoFile,
  onLogoFileChange,
  onClearLogo,
  sponsorFiles,
  sponsorPreviewUrls,
  onSponsorFileChange,
  onClearSponsorImage,
  addIqamah,
  removeIqamah,
  setIqamah,
  addSponsor,
  removeSponsor,
  setSponsor,
  addAdRailSlot,
  removeAdRailSlot,
  setAdRailSlot,
  addExtraPrayer,
  removeExtraPrayer,
  setExtraPrayer,
  addExtraPrayerTime,
  removeExtraPrayerTime,
  setExtraPrayerTime,
  addExtraPrayerScheduleDate,
  removeExtraPrayerScheduleDate,
  setExtraPrayerScheduleDate,
}: DashboardFormSectionsProps) {
  const handleUseCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      update({
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
      });
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── 1. Mosque Information ──────────────────────────── */}
      <SectionCard
        id="mosque-info"
        icon="mosque"
        title={t.mosqueInformation}
        description={t.mosqueInformationDesc}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cfg-name" label={t.mosqueNameLabel}>
            <input
              id="cfg-name"
              className={inputCls}
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder={t.mosaicPlaceholder}
              autoComplete="organization"
            />
          </Field>
          <Field id="cfg-city" label={t.cityLabel}>
            <input
              id="cfg-city"
              className={inputCls}
              value={form.city}
              onChange={(e) => update({ city: e.target.value })}
              placeholder={t.cityPlaceholder}
              autoComplete="address-level2"
            />
          </Field>
        </div>
        <Field id="cfg-location" label={t.fullAddressLabel}>
          <input
            id="cfg-location"
            className={inputCls}
            value={form.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder={t.fullAddressPlaceholder}
            autoComplete="street-address"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cfg-website" label={t.websiteLabel}>
            <input
              id="cfg-website"
              type="url"
              className={inputCls}
              value={form.website}
              onChange={(e) => update({ website: e.target.value })}
              placeholder={t.websitePlaceholder}
              autoComplete="url"
            />
          </Field>
          <Field id="cfg-capacity" label={t.capacityLabel}>
            <input
              id="cfg-capacity"
              className={inputCls}
              value={form.capacity}
              onChange={(e) => update({ capacity: e.target.value })}
              placeholder={t.capacityPlaceholder}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cfg-email" label={t.emailLabel}>
            <input
              id="cfg-email"
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
            />
          </Field>
          <Field id="cfg-phone" label={t.phoneLabel}>
            <input
              id="cfg-phone"
              type="tel"
              className={inputCls}
              value={form.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder={t.phonePlaceholder}
              autoComplete="tel"
            />
          </Field>
        </div>
        <Field id="cfg-hours" label={t.openingHoursLabel}>
          <input
            id="cfg-hours"
            className={inputCls}
            value={form.openingHours}
            onChange={(e) => update({ openingHours: e.target.value })}
            placeholder={t.openingHoursPlaceholder}
          />
        </Field>
        <Field id="cfg-logo" label={t.logoLabel}>
          <div className="flex items-center gap-2">
            <input
              id="cfg-logo"
              className={cn(
                inputCls,
                "flex-1",
                logoFile && "opacity-70 cursor-not-allowed",
              )}
              value={logoFile ? logoFile.name : form.logo}
              onChange={(e) => update({ logo: e.target.value })}
              placeholder={t.logoPlaceholder}
              readOnly={Boolean(logoFile)}
            />
            <button
              type="button"
              aria-label={t.uploadLogoLabel}
              onClick={() =>
                (
                  document.getElementById(
                    "cfg-logo-file",
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
              aria-label={t.clearLogoLabel}
              onClick={onClearLogo}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
              style={{ border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18 }}
                aria-hidden="true"
              >
                delete
              </span>
            </button>
            {(logoFile ||
              (form.logo &&
                (form.logo.startsWith("data:") ||
                  form.logo.startsWith("http")))) && (
              <span
                className="material-symbols-outlined text-emerald-400"
                style={{ fontSize: 20 }}
                aria-hidden="true"
              >
                check_circle
              </span>
            )}
            <input
              id="cfg-logo-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onLogoFileChange(file);
                e.target.value = "";
              }}
            />
          </div>
        </Field>
      </SectionCard>

      {/* ── 2. Location & Calculation ──────────────────────── */}
      <SectionCard
        id="location"
        icon="location_on"
        title={t.locationCalculation}
        description={t.locationCalculationDesc}
      >
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field id="cfg-lat" label={t.latitudeLabel}>
            <input
              id="cfg-lat"
              type="number"
              step="any"
              className={inputCls}
              value={form.latitude}
              onChange={(e) => update({ latitude: e.target.value })}
              placeholder={t.latitudePlaceholder}
            />
          </Field>
          <Field id="cfg-lng" label={t.longitudeLabel}>
            <input
              id="cfg-lng"
              type="number"
              step="any"
              className={inputCls}
              value={form.longitude}
              onChange={(e) => update({ longitude: e.target.value })}
              placeholder={t.longitudePlaceholder}
            />
          </Field>
          <Field id="cfg-method" label={t.calculationMethodLabel}>
            <select
              id="cfg-method"
              className={selectCls}
              value={form.calculationMethod}
              onChange={(e) => update({ calculationMethod: e.target.value })}
            >
              {CALC_METHODS.map(([value, label]) => (
                <option key={value} value={value}>
                  {value} — {label}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            aria-label="Use current location"
            onClick={handleUseCurrentLocation}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 focus-ring"
            style={{ border: "1px solid rgba(var(--primary-rgb), 0.3)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
              aria-hidden="true"
            >
              gps_fixed
            </span>
          </button>
        </div>
      </SectionCard>

      {/* ── 3. Iqamah Offsets ──────────────────────────────── */}
      <SectionCard
        id="iqamah"
        icon="schedule"
        title={t.iqamahOffsets}
        description={t.iqamahOffsetsDesc}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {form.iqamahOffsets.length === 0
              ? t.noOffsetsConfigured
              : t.offsetsConfigured(form.iqamahOffsets.length)}
          </p>
          <AddRowBtn onClick={addIqamah}>{t.addPrayer}</AddRowBtn>
        </div>
        {form.iqamahOffsets.length > 0 && (
          <div className="space-y-3">
            {form.iqamahOffsets.map((row, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-xl p-3 ghost-border bg-surface-container sm:grid-cols-[1fr_1fr_auto] items-end"
              >
                <Field id={`iq-name-${i}`} label={t.prayerNameLabel}>
                  <input
                    id={`iq-name-${i}`}
                    className={inputCls}
                    value={row.prayerName}
                    onChange={(e) => setIqamah(i, "prayerName", e.target.value)}
                    placeholder={t.prayerNamePlaceholder}
                  />
                </Field>
                <Field id={`iq-offset-${i}`} label={t.offsetMinutesLabel}>
                  <input
                    id={`iq-offset-${i}`}
                    type="number"
                    min="0"
                    className={inputCls}
                    value={row.offsetMinutes}
                    onChange={(e) =>
                      setIqamah(i, "offsetMinutes", e.target.value)
                    }
                    placeholder={t.offsetMinutesPlaceholder}
                  />
                </Field>
                <div className="pb-0.5">
                  <RemoveBtn
                    onClick={() => removeIqamah(i)}
                    label={t.removeLabel}
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
        title={t.announcements}
        description={t.announcementsDesc}
      >
        <Field id="cfg-ann-en" label={t.englishAnnouncementsLabel}>
          <textarea
            id="cfg-ann-en"
            className={textareaCls}
            rows={4}
            value={form.announcementsEn}
            onChange={(e) => update({ announcementsEn: e.target.value })}
            placeholder={t.englishAnnouncementsPlaceholder}
            aria-describedby="ann-help"
          />
        </Field>
        <Field id="cfg-ann-fr" label={t.frenchAnnouncementsLabel}>
          <textarea
            id="cfg-ann-fr"
            className={textareaCls}
            rows={4}
            value={form.announcementsFr}
            onChange={(e) => update({ announcementsFr: e.target.value })}
            placeholder={t.frenchAnnouncementsPlaceholder}
            aria-describedby="ann-help"
          />
        </Field>
        <p id="ann-help" className="text-xs text-text-muted -mt-1">
          {t.announcementsHelp}
        </p>
      </SectionCard>

      {/* ── 5. Sponsors ────────────────────────────────────── */}
      <SectionCard
        id="sponsors"
        icon="storefront"
        title={t.sponsors}
        description={t.sponsorsDesc}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {form.sponsors.length === 0
              ? t.noSponsorsConfigured
              : t.sponsorCount(form.sponsors.length)}
          </p>
          <AddRowBtn onClick={addSponsor}>{t.addSponsor}</AddRowBtn>
        </div>
        {form.sponsors.length > 0 && (
          <div className="space-y-4">
            {form.sponsors.map((slot, i) => (
              <div
                key={i}
                className="rounded-xl p-5 ghost-border bg-surface-container"
              >
                <div className="flex gap-4 items-stretch">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
                      <Field id={`ad-id-${i}`} label={t.idLabel}>
                        <input
                          id={`ad-id-${i}`}
                          type="number"
                          min="0"
                          className={inputCls}
                          value={slot.id}
                          onChange={(e) => setSponsor(i, "id", e.target.value)}
                        />
                      </Field>
                      <Field id={`ad-label-${i}`} label={t.sponsorNameLabel}>
                        <input
                          id={`ad-label-${i}`}
                          className={inputCls}
                          value={slot.label}
                          onChange={(e) =>
                            setSponsor(i, "label", e.target.value)
                          }
                          placeholder={t.sponsorNamePlaceholder}
                        />
                      </Field>
                    </div>

                    <Field id={`ad-image-${i}`} label={t.imageLabel}>
                      <div className="flex items-center gap-2">
                        <input
                          id={`ad-image-${i}`}
                          className={cn(
                            inputCls,
                            "flex-1",
                            sponsorFiles[slot.id] &&
                              "opacity-70 cursor-not-allowed",
                          )}
                          value={
                            sponsorFiles[slot.id]
                              ? sponsorFiles[slot.id].name
                              : slot.image
                          }
                          onChange={(e) =>
                            setSponsor(i, "image", e.target.value)
                          }
                          placeholder={t.imagePlaceholder}
                          readOnly={Boolean(sponsorFiles[slot.id])}
                          aria-describedby={
                            sponsorFiles[slot.id]
                              ? `ad-image-pending-hint-${i}`
                              : undefined
                          }
                        />
                        <button
                          type="button"
                          aria-label={t.uploadImageLabel}
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
                          aria-label={t.clearImageLabel}
                          onClick={() => onClearSponsorImage(i)}
                          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
                          style={{ border: "1px solid rgba(239,68,68,0.3)" }}
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
                            onSponsorFileChange(i, file);
                            e.target.value = "";
                          }}
                        />
                      </div>
                      {sponsorFiles[slot.id] && (
                        <p
                          id={`ad-image-pending-hint-${i}`}
                          className="text-xs text-text-muted"
                        >
                          {t.pendingImageUploadHint}
                        </p>
                      )}
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
                      <Field id={`ad-link-${i}`} label={t.linkUrlLabel}>
                        <input
                          id={`ad-link-${i}`}
                          type="url"
                          className={inputCls}
                          value={slot.link}
                          onChange={(e) =>
                            setSponsor(i, "link", e.target.value)
                          }
                          placeholder={t.linkUrlPlaceholder}
                        />
                      </Field>
                      <Field
                        id={`ad-weight-${i}`}
                        label={t.priorityLabel}
                      >
                        <input
                          id={`ad-weight-${i}`}
                          type="number"
                          min="0"
                          className={inputCls}
                          value={slot.weight}
                          onChange={(e) =>
                            setSponsor(i, "weight", e.target.value)
                          }
                          placeholder={t.priorityPlaceholder}
                        />
                      </Field>
                      <div className="pb-0.5">
                        <RemoveBtn
                          onClick={() => removeSponsor(i)}
                          label={t.removeSponsorLabel}
                        />
                      </div>
                    </div>
                  </div>

                  {(sponsorPreviewUrls[slot.id] ||
                    (slot.image &&
                      (slot.image.startsWith("data:") ||
                        slot.image.startsWith("http")))) && (
                    <div className="hidden sm:flex shrink-0 w-1/4 self-center h-60 items-center justify-center overflow-hidden rounded-lg ghost-border bg-white/10">
                      <img
                        src={sponsorPreviewUrls[slot.id] ?? slot.image}
                        alt={`${t.previewLabel.replace("{label}", slot.label || t.adSlotPreview)}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── 6. Ad Rail Slots ───────────────────────────────── */}
      <SectionCard
        id="ad-rail-slots"
        icon="view_column"
        title={t.adRailSlots}
        description={t.adRailSlotsDesc}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {form.adRailSlots.length === 0
              ? t.noAdRailSlotsConfigured
              : t.adRailSlotCount(form.adRailSlots.length)}
          </p>
          <AddRowBtn onClick={addAdRailSlot}>{t.addAdRailSlot}</AddRowBtn>
        </div>
        {form.adRailSlots.length > 0 && (
          <div className="space-y-4">
            {form.adRailSlots.map((slot, i) => {
              const selectedInOtherFixedSlots = new Set(
                form.adRailSlots
                  .filter(
                    (otherSlot, otherIndex) =>
                      otherIndex !== i &&
                      otherSlot.mode === "fixed" &&
                      otherSlot.sponsorId.trim() !== "",
                  )
                  .map((otherSlot) => otherSlot.sponsorId),
              );

              return (
                <div
                  key={i}
                  className="rounded-xl p-5 ghost-border bg-surface-container"
                >
                  <div className="grid gap-3 sm:grid-cols-[90px_180px_1fr_auto] sm:items-end">
                    <Field id={`ad-rail-id-${i}`} label={t.idLabel}>
                      <input
                        id={`ad-rail-id-${i}`}
                        type="number"
                        min="0"
                        className={inputCls}
                        value={slot.id}
                        onChange={(e) => setAdRailSlot(i, "id", e.target.value)}
                      />
                    </Field>
                    <Field id={`ad-rail-mode-${i}`} label={t.slotModeLabel}>
                      <select
                        id={`ad-rail-mode-${i}`}
                        className={selectCls}
                        value={slot.mode}
                        onChange={(e) =>
                          setAdRailSlot(
                            i,
                            "mode",
                            e.target.value as RailSlotRow["mode"],
                          )
                        }
                      >
                        <option value="fixed">{t.slotModeFixed}</option>
                        <option value="dynamic">{t.slotModeDynamic}</option>
                      </select>
                    </Field>
                    <Field
                      id={`ad-rail-sponsor-${i}`}
                      label={t.linkedSponsorLabel}
                    >
                      <select
                        id={`ad-rail-sponsor-${i}`}
                        className={cn(
                          selectCls,
                          slot.mode !== "fixed" &&
                            "cursor-not-allowed bg-background-deep/40 text-text-muted opacity-60",
                        )}
                        value={slot.sponsorId}
                        onChange={(e) =>
                          setAdRailSlot(i, "sponsorId", e.target.value)
                        }
                        disabled={slot.mode !== "fixed"}
                      >
                        <option value="">{t.linkedSponsorPlaceholder}</option>
                        {form.sponsors
                          .filter((sponsor) => sponsor.id.trim() !== "")
                          .map((sponsor) => {
                            const isTakenInAnotherFixedSlot =
                              sponsor.id !== slot.sponsorId &&
                              selectedInOtherFixedSlots.has(sponsor.id);

                            return (
                              <option
                                key={sponsor.id}
                                value={sponsor.id}
                                disabled={
                                  slot.mode === "fixed" &&
                                  isTakenInAnotherFixedSlot
                                }
                              >
                                {sponsor.label || `#${sponsor.id}`}
                              </option>
                            );
                          })}
                      </select>
                    </Field>
                    <div className="pb-0.5">
                      <RemoveBtn
                        onClick={() => removeAdRailSlot(i)}
                        label={t.removeSlotLabel}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── 7. Promo Timing ────────────────────────────────── */}
      <SectionCard
        id="promo"
        icon="timer"
        title={t.promoTiming}
        description={t.promoTimingDesc}
      >
        <Field id="cfg-ad-rail-rotation" label={t.adRailRotationMsLabel}>
          <input
            id="cfg-ad-rail-rotation"
            type="number"
            min="0"
            className={inputCls}
            value={form.adRailRotationMs}
            onChange={(e) => update({ adRailRotationMs: e.target.value })}
            placeholder={t.adRailRotationMsPlaceholder}
          />
        </Field>
        <div className="rounded-xl p-4 ghost-border bg-surface-container space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-caps text-[10px] md:text-label-caps text-text-muted uppercase tracking-widest">
                {t.promoRailSettings}
              </p>
              <p className="text-on-surface">{t.enablePromoRail}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="font-label-caps text-xs tracking-widest text-primary uppercase">
                {form.promoEnabled ? t.promoToggleOn : t.promoToggleOff}
              </span>
              <Toggle
                id="promo-enabled"
                checked={form.promoEnabled}
                onChange={(v) => update({ promoEnabled: v })}
                label=""
              />
            </div>
          </div>
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-3",
              !form.promoEnabled && "opacity-60",
            )}
          >
            <Field id="promo-duration" label={t.displayDurationLabel}>
              <input
                id="promo-duration"
                type="number"
                min="0"
                className={inputCls}
                value={form.promoDisplayDurationMs}
                onChange={(e) =>
                  update({ promoDisplayDurationMs: e.target.value })
                }
                placeholder={t.displayDurationPlaceholder}
                disabled={!form.promoEnabled}
              />
            </Field>
            <Field id="promo-cycle" label={t.cycleIntervalLabel}>
              <input
                id="promo-cycle"
                type="number"
                min="0"
                className={inputCls}
                value={form.promoCycleMs}
                onChange={(e) => update({ promoCycleMs: e.target.value })}
                placeholder={t.cycleIntervalPlaceholder}
                disabled={!form.promoEnabled}
              />
            </Field>
            <Field id="promo-delay" label={t.initialDelayLabel}>
              <input
                id="promo-delay"
                type="number"
                min="0"
                className={inputCls}
                value={form.promoInitialDelayMs}
                onChange={(e) =>
                  update({ promoInitialDelayMs: e.target.value })
                }
                placeholder={t.initialDelayPlaceholder}
                disabled={!form.promoEnabled}
              />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── 8. Extra Prayers ───────────────────────────────── */}
      <SectionCard
        id="extra-prayers"
        icon="add_circle"
        title={t.extraPrayers}
        description={t.extraPrayersDesc}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            {form.extraPrayers.length === 0
              ? t.noExtraPrayersConfigured
              : t.extraPrayerCount(form.extraPrayers.length)}
          </p>
          <AddRowBtn onClick={addExtraPrayer}>{t.addExtraPrayer}</AddRowBtn>
        </div>
        {form.extraPrayers.length > 0 && (
          <div className="space-y-4">
            {form.extraPrayers.map((prayer, i) => (
              <div
                key={i}
                className="rounded-xl p-4 space-y-4 ghost-border bg-surface-container"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <Field id={`ep-name-${i}`} label={t.prayerNameLatinLabel}>
                    <input
                      id={`ep-name-${i}`}
                      className={inputCls}
                      value={prayer.name}
                      onChange={(e) =>
                        setExtraPrayer(i, "name", e.target.value)
                      }
                      placeholder={t.prayerNameLatinPlaceholder}
                    />
                  </Field>
                  <Field id={`ep-arabic-${i}`} label={t.arabicNameLabel}>
                    <input
                      id={`ep-arabic-${i}`}
                      lang="ar"
                      dir="rtl"
                      className={inputCls}
                      value={prayer.arabicName}
                      onChange={(e) =>
                        setExtraPrayer(i, "arabicName", e.target.value)
                      }
                      placeholder={t.arabicNamePlaceholder}
                    />
                  </Field>
                  <div className="sm:pb-0.5">
                    <RemoveBtn
                      onClick={() => removeExtraPrayer(i)}
                      label={t.removePrayerLabel}
                    />
                  </div>
                </div>

                <DayOfWeekPicker
                  idPrefix={`ep-days-${i}`}
                  label={t.daysOfWeekLabel}
                  description={t.daysOfWeekDesc}
                  selectedDays={prayer.schedule.filter(isWeekdayAbbr)}
                  dayAbbreviations={t.dayAbbreviations}
                  onChange={(days) =>
                    setExtraPrayer(i, "schedule", [
                      ...days,
                      ...prayer.schedule.filter((s) => !isWeekdayAbbr(s)),
                    ])
                  }
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>{t.datesLabel}</FieldLabel>
                    <AddRowBtn onClick={() => addExtraPrayerScheduleDate(i)}>
                      {t.addDateLabel}
                    </AddRowBtn>
                  </div>
                  {prayer.schedule.filter((s) => !isWeekdayAbbr(s)).length ===
                  0 ? (
                    <p className="text-xs text-text-muted italic">
                      {t.noDatesConfigured}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {prayer.schedule.map((entry, si) =>
                        isWeekdayAbbr(entry) ? null : (
                          <div key={si} className="flex items-center gap-2">
                            <input
                              type="date"
                              className={cn(inputCls, "flex-1 min-w-0")}
                              value={entry}
                              onChange={(e) =>
                                setExtraPrayerScheduleDate(
                                  i,
                                  si,
                                  e.target.value,
                                )
                              }
                              aria-label={t.dateLabel(si, prayer.name)}
                            />
                            <button
                              type="button"
                              aria-label={t.removeDateLabel}
                              onClick={() =>
                                removeExtraPrayerScheduleDate(i, si)
                              }
                              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
                              style={{ border: "1px solid rgba(239,68,68,0.3)" }}
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
                        ),
                      )}
                    </div>
                  )}
                  <p className="text-xs text-text-muted">{t.datesDesc}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={`ep-adhan-${i}`} label={t.adhanTimeLabel}>
                    <input
                      id={`ep-adhan-${i}`}
                      className={inputCls}
                      value={prayer.adhan}
                      onChange={(e) =>
                        setExtraPrayer(i, "adhan", e.target.value)
                      }
                      placeholder={t.adhanTimePlaceholder}
                    />
                  </Field>
                  <Field id={`ep-iqamah-${i}`} label={t.iqamahTimeLabel}>
                    <input
                      id={`ep-iqamah-${i}`}
                      className={inputCls}
                      value={prayer.iqamah}
                      onChange={(e) =>
                        setExtraPrayer(i, "iqamah", e.target.value)
                      }
                      placeholder={t.iqamahTimePlaceholder}
                    />
                  </Field>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel>{t.sessionTimesLabel}</FieldLabel>
                    <AddRowBtn onClick={() => addExtraPrayerTime(i)}>
                      {t.addTimeLabel}
                    </AddRowBtn>
                  </div>
                  {prayer.times.length === 0 ? (
                    <p className="text-xs text-text-muted italic">
                      {t.noSessionTimes}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {prayer.times.map((time, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <input
                            className={cn(inputCls, "flex-1 min-w-0")}
                            value={time}
                            onChange={(e) =>
                              setExtraPrayerTime(i, ti, e.target.value)
                            }
                            placeholder={t.sessionTimePlaceholder}
                            aria-label={t.sessionTimeLabel(ti, prayer.name)}
                          />
                          <button
                            type="button"
                            aria-label={t.removeTimeLabel}
                            onClick={() => removeExtraPrayerTime(i, ti)}
                            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg transition-colors focus-ring text-red-400 hover:bg-red-500/10"
                            style={{ border: "1px solid rgba(239,68,68,0.3)" }}
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
  );
}
