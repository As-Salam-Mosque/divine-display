import { type CSSProperties, useState } from "react";
import { useClock } from "../hooks/useClock";
import { usePrayerStatus } from "../hooks/usePrayerStatus";
import { ClockPanel } from "../components/ClockPanel";
import { PromoRail } from "../components/PromoRail";
import { PrayerTable } from "../components/PrayerTable";
import { AdRail } from "../components/AdRail";
import { AnnouncementTicker } from "../components/AnnouncementTicker";
import { SettingsPanel } from "../components/SettingsPanel";
import { SkipLink } from "../components/common/SkipLink";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import { cn } from "../utils/cn";

export function Display() {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clock = useClock(settings.language);
  const prayerStatus = usePrayerStatus(settings.mosque, settings.language);
  const showAdRail = settings.showSponsors && !prayerStatus.isCriticalSignal;
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
      <SkipLink href="#prayer-times" label={t.skipToPrayerTimes} />

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
                  hijriDate={prayerStatus.hijriDate}
                  statusMessage={prayerStatus.statusMessage}
                  statusType={prayerStatus.statusType}
                  criticalSignal={prayerStatus.criticalSignal}
                  onOpenSettings={() => setSettingsOpen(true)}
                  promoActive={promoActive}
                />
              </div>
              <PromoRail
                isCriticalSignal={prayerStatus.isCriticalSignal}
                onActiveChange={setPromoActive}
              />
            </div>
          </div>

          {prayerStatus.loading ? (
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
                prayers={prayerStatus.prayers}
                activePrayerIndex={prayerStatus.activePrayerIndex}
              />
            </div>
          )}
        </div>

        {showAdRail && (
          <div className="min-h-0 h-full overflow-hidden">
            <AdRail
              sponsors={settings.mosque.sponsors}
              railSlots={settings.mosque.adRailSlots}
            />
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
