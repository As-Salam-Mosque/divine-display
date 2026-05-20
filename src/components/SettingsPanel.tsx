import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import type { Language, TimeFormat } from "../types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="font-label-caps text-[11px] tracking-widest text-primary border-b border-primary/20 pb-2 mb-4">
      {label}
    </h3>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-caps text-[10px] tracking-wider text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-primary text-on-primary shadow-[0_0_8px_rgba(233,193,118,0.4)]"
              : "bg-surface-container-low text-text-muted hover:text-on-surface border border-outline-variant"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full group"
    >
      <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
        {label}
      </span>
      <span
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-surface-container-highest"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const t = useT(settings.language);

  // updateMosque helper removed — SettingsPanel currently displays info only
  // and uses `updateSettings` directly for display toggles.

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.settings}
        className={`fixed z-50 inset-x-3 top-[4vh] sm:inset-x-4 sm:top-[5vh] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-auto md:w-[480px] lg:w-[560px] xl:w-[640px] tv:w-[720px] max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-surface-panel border border-primary/25 rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(233,193,118,0.08)] transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              aria-hidden="true"
            >
              settings
            </span>
            <h2 className="font-headline-md text-base font-semibold text-on-surface tracking-wide">
              {t.settings}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-7">
          {/* ── Display ── */}
          <section>
            <SectionHeader label={t.sectionDisplay} />
            <div className="space-y-5">
              <Field label={t.language}>
                <PillGroup<Language>
                  value={settings.language}
                  onChange={(v) => updateSettings({ language: v })}
                  options={[
                    { value: "en", label: t.langEn },
                    { value: "fr", label: t.langFr },
                  ]}
                />
              </Field>
              <Field label={t.timeFormat}>
                <PillGroup<TimeFormat>
                  value={settings.timeFormat}
                  onChange={(v) => updateSettings({ timeFormat: v })}
                  options={[
                    { value: "12h", label: t.format12h },
                    { value: "24h", label: t.format24h },
                  ]}
                />
              </Field>
              {/* Theme toggle */}
              <Toggle
                checked={settings.theme === "light"}
                onChange={(v) =>
                  updateSettings({ theme: v ? "light" : "dark" })
                }
                label={t.lightTheme}
              />
            </div>
          </section>

          {/* ── Visibility ── */}
          <section>
            <SectionHeader label={t.sectionVisibility} />
            <Toggle
              checked={settings.showSponsors}
              onChange={(v) => updateSettings({ showSponsors: v })}
              label={t.showSponsors}
            />
          </section>

          {/* ── Mosque Information ── */}
          <section>
            <SectionHeader label={t.sectionMosqueInfo} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.mosqueName}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.name || t.notAvailable}
                </span>
              </Field>
              <Field label={t.city}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.city || t.notAvailable}
                </span>
              </Field>
              <Field label={t.location}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.location || t.notAvailable}
                </span>
              </Field>
              <Field label={t.website}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.website || t.notAvailable}
                </span>
              </Field>
              <Field label={t.capacity}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.capacity || t.notAvailable}
                </span>
              </Field>
              <Field label={t.openingHours}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.openingHours || t.notAvailable}
                </span>
              </Field>
              <Field label={t.email}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.email || t.notAvailable}
                </span>
              </Field>
              <Field label={t.phone}>
                <span className="text-sm text-on-surface">
                  {settings.mosque.phone || t.notAvailable}
                </span>
              </Field>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
