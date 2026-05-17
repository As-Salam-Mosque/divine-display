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
  mosque: config,
};

function Display() {
  const { settings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clock = useClock(settings.language);
  const prayerTimes = usePrayerTimes(config, settings.language);

  return (
    <div className="dark bg-background-deep text-on-surface min-h-screen md:h-screen flex flex-col font-body-md overflow-y-auto md:overflow-hidden">
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter-grid p-4 md:p-margin-page md:overflow-hidden">
        {/* Left Stage */}
        <div
          className={`col-span-1 flex flex-col gap-4 md:gap-gutter-grid md:h-full ${
            settings.showSponsors ? "md:col-span-9" : "md:col-span-12"
          }`}
        >
          <ClockPanel
            clock={clock}
            hijriDate={prayerTimes.hijriDate}
            statusMessage={prayerTimes.statusMessage}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {prayerTimes.loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
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
        {settings.showSponsors && <AdRail slots={config.adSlots} />}
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
