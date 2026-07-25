import { useMemo } from "react";
import { useMosqueConfig } from "../hooks/useMosqueConfig";
import { SettingsProvider } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import type { AppSettings } from "../types";
import { Display } from "./Display";

interface ClockPageProps {
  mosqueName: string;
}

function ClockPageContent({ mosqueName }: ClockPageProps) {
  const { language } = useLanguage();
  const t = useT(language);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const hasRequestedName = mosqueName.trim().length > 0;

  const { config, loading, error, source } = useMosqueConfig(
    hasRequestedName && backendUrl
      ? { apiBase: backendUrl, slug: mosqueName }
      : undefined,
  );

  const defaultSettings = useMemo<AppSettings>(
    () => ({
      language,
      timeFormat: "12h",
      showSponsors: true,
      theme: "dark",
      mosque: config,
      alternatePrayerCardColors: false,
    }),
    [language, config],
  );

  if (hasRequestedName) {
    if (loading) {
      return (
        <main className="min-h-screen bg-background-deep text-on-surface flex items-center justify-center p-6">
          <p className="text-lg font-body-md" role="status" aria-live="polite">
            {t.loadingMosqueConfiguration}
          </p>
        </main>
      );
    }

    if (source !== "remote" || error) {
      return (
        <main className="min-h-screen bg-background-deep text-on-surface flex items-center justify-center p-6">
          <section
            className="max-w-xl w-full bg-surface-panel ghost-border rounded-xl p-6 md:p-8"
            role="alert"
            aria-live="assertive"
          >
            <h1 className="font-headline-md text-primary mb-3">
              {t.mosqueNotFoundTitle}
            </h1>
            <p className="font-body-md text-on-surface/90">
              {t.mosqueNotFoundMessage(mosqueName)}
            </p>
          </section>
        </main>
      );
    }
  }

  return (
    <SettingsProvider defaults={defaultSettings}>
      <Display />
    </SettingsProvider>
  );
}

export function ClockPage(props: ClockPageProps) {
  return <ClockPageContent {...props} />;
}
