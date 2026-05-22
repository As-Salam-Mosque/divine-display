import { useState } from "react";
import { useClock } from "./hooks/useClock";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { ClockPanel } from "./components/ClockPanel";
import { PrayerTable } from "./components/PrayerTable";
import { AdRail } from "./components/AdRail";
import { AnnouncementTicker } from "./components/AnnouncementTicker";
import { SettingsPanel } from "./components/SettingsPanel";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import type { AppSettings } from "./types";
import config from "../mosque.config";

const defaultSettings: AppSettings = {
  language: "en",
  timeFormat: "12h",
  showSponsors: true,
  theme: "dark",
  mosque: config,
};

function Display() {
  const { settings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clock = useClock(settings.language);
  const prayerTimes = usePrayerTimes(config, settings.language);
  const isCriticalSignal =
    prayerTimes.statusType === "adhan-now" ||
    prayerTimes.statusType === "iqamah-now";

  const themeClasses =
    settings.theme === "dark"
      ? "dark bg-background-deep text-on-surface"
      : "bg-white text-black";

  const showAdRail = settings.showSponsors && !isCriticalSignal;

  return (
    <div
      className={`${themeClasses} min-h-screen lg:h-screen flex flex-col font-body-md overflow-y-auto lg:overflow-hidden`}
    >
      <main
        className={`flex-1 grid grid-cols-1 gap-1 sm:gap-2 md:gap-2 lg:gap-3 tv:gap-[20px] p-1 sm:p-2 md:p-3 lg:p-5 tv:p-[32px] lg:overflow-hidden ${
          showAdRail ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:grid-cols-1"
        }`}
      >
        {/* Left Stage */}
        <div className="col-span-1 flex-1 min-h-0 flex flex-col gap-1 sm:gap-2 md:gap-2 lg:gap-3 tv:gap-[20px] lg:h-full">
          <ClockPanel
            clock={clock}
            hijriDate={prayerTimes.hijriDate}
            statusMessage={prayerTimes.statusMessage}
            statusType={prayerTimes.statusType}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {prayerTimes.loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 md:h-48 bg-surface-panel ghost-border rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <PrayerTable
              prayers={prayerTimes.prayers}
              activePrayerIndex={prayerTimes.activePrayerIndex}
            />
          )}
        </div>

        {/* Right Ad Rail — conditionally shown */}
        {settings.showSponsors && !isCriticalSignal && (
          <AdRail slots={config.adSlots} />
        )}
      </main>

      {/* Footer — hidden on mobile */}
      <div className="hidden md:block">
        <AnnouncementTicker announcements={config.announcements} />
      </div>

      {/* Settings modal */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider defaults={defaultSettings}>
      <Display />
    </SettingsProvider>
  );
}
