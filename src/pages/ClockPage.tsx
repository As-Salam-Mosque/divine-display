import { type CSSProperties, useMemo, useState } from "react";
import { useClock } from "../hooks/useClock";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useMosqueConfig } from "../hooks/useMosqueConfig";
import { ClockPanel } from "../components/ClockPanel";
import { PromoRail } from "../components/PromoRail";
import { PrayerTable } from "../components/PrayerTable";
import { AdRail } from "../components/AdRail";
import { AnnouncementTicker } from "../components/AnnouncementTicker";
import { SettingsPanel } from "../components/SettingsPanel";
import { SettingsProvider, useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";
import type { AppSettings } from "../types";

function Display() {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clock = useClock(settings.language);
  const prayerTimes = usePrayerTimes(settings.mosque, settings.language);
  const isCriticalSignal =
    prayerTimes.statusType === "adhan-now" ||
    prayerTimes.statusType === "iqamah-now";

  const showAdRail = settings.showSponsors && !isCriticalSignal;
  const [promoActive, setPromoActive] = useState(false);

  return (
    <div
      lang={settings.language}
      className={cn(
        "min-h-screen lg:h-screen flex flex-col font-body-md overflow-y-auto lg:overflow-hidden",
        settings.theme === "dark"
          ? "dark bg-background-deep text-on-surface"
          : "light bg-background-deep text-on-surface",
      )}
    >
      <a
        href="#prayer-times"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:rounded-lg focus:font-semibold"
      >
        {t.skipToPrayerTimes}
      </a>

      <main
        className="flex-1 grid grid-cols-1 gap-2 md:gap-3 tv:gap-stage-gap p-2 md:p-3 lg:p-5 tv:p-panel-padding lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_var(--adrail-width)]"
        style={
          {
            "--adrail-width": showAdRail ? "20vw" : "0px",
          } as CSSProperties
        }
      >
        <div className="col-span-1 flex-1 min-h-0 flex flex-col gap-2 md:gap-3 tv:gap-stage-gap lg:h-full">
          <div className="lg:basis-[65%] basis-auto min-h-0 flex items-stretch justify-center">
            <div
              className={cn(
                "relative w-full h-auto max-h-full [--promo-rail-width:50%] md:flex md:items-stretch",
                promoActive &&
                  "md:transition-all md:duration-1000 md:flex-row md:justify-between",
              )}
            >
              <div className="flex-1 flex items-center justify-center w-full h-auto">
                <ClockPanel
                  clock={clock}
                  hijriDate={prayerTimes.hijriDate}
                  statusMessage={prayerTimes.statusMessage}
                  statusType={prayerTimes.statusType}
                  criticalSignal={prayerTimes.criticalSignal}
                  onOpenSettings={() => setSettingsOpen(true)}
                  promoActive={promoActive}
                />
              </div>
              <PromoRail
                isCriticalSignal={isCriticalSignal}
                onActiveChange={setPromoActive}
              />
            </div>
          </div>

          {prayerTimes.loading ? (
            <div
              className="basis-[35%] min-h-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3"
              aria-busy="true"
              aria-label={t.loadingPrayerTimes}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 md:h-48 bg-surface-panel ghost-border rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div
              className="lg:basis-[35%] basis-auto min-h-0"
              id="prayer-times"
            >
              <PrayerTable
                prayers={prayerTimes.prayers}
                activePrayerIndex={prayerTimes.activePrayerIndex}
              />
            </div>
          )}
        </div>

        {showAdRail && (
          <div className="min-h-0 h-full overflow-hidden">
            <AdRail slots={settings.mosque.adSlots} />
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <AnnouncementTicker />
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

interface ClockPageProps {
  mosqueName: string;
}

function ClockPageContent({ mosqueName }: ClockPageProps) {
  const { language } = useLanguage();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

  const { config } = useMosqueConfig(
    backendUrl ? { apiBase: backendUrl, slug: mosqueName } : undefined,
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

  return (
    <SettingsProvider defaults={defaultSettings}>
      <Display />
    </SettingsProvider>
  );
}

export function ClockPage(props: ClockPageProps) {
  return <ClockPageContent {...props} />;
}
