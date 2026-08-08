import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

const SIGNAL_TRANSITION_HALF_DURATION_MS = 1000;

export function Display() {
  const { settings } = useSettings();
  const t = useT(settings.language);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const clock = useClock(settings.language);
  const prayerStatus = usePrayerStatus(settings.mosque, settings.language);
  const [promoActive, setPromoActive] = useState(false);
  const [displayedPrayerStatus, setDisplayedPrayerStatus] =
    useState(prayerStatus);
  const [isSignalTransitioning, setIsSignalTransitioning] = useState(false);
  const [signalTransitionKey, setSignalTransitionKey] = useState(0);
  const wasCriticalSignal = useRef(prayerStatus.isCriticalSignal);
  const latestPrayerStatus = useRef(prayerStatus);
  const transitionTimer = useRef<number | null>(null);

  useLayoutEffect(() => {
    latestPrayerStatus.current = prayerStatus;
  }, [prayerStatus]);

  const renderedPrayerStatus = isSignalTransitioning
    ? displayedPrayerStatus
    : prayerStatus;
  const showAdRail =
    settings.showSponsors && !renderedPrayerStatus.isCriticalSignal;

  // Sync normal status updates into the currently displayed snapshot. The
  // signal-transition effect below intentionally skips this while the actual
  // layout is being covered by the black fade.
  useLayoutEffect(() => {
    if (
      isSignalTransitioning ||
      wasCriticalSignal.current !== prayerStatus.isCriticalSignal
    ) {
      return;
    }

    setDisplayedPrayerStatus(latestPrayerStatus.current);
  }, [
    isSignalTransitioning,
    prayerStatus.activePrayerIndex,
    prayerStatus.criticalSignal?.arabicName,
    prayerStatus.criticalSignal?.prayerName,
    prayerStatus.criticalSignal?.subtitle,
    prayerStatus.criticalSignal?.urgency,
    prayerStatus.error,
    prayerStatus.hijriDate,
    prayerStatus.isCriticalSignal,
    prayerStatus.loading,
    prayerStatus.nextPrayerIndex,
    prayerStatus.prayers,
    prayerStatus.statusMessage,
    prayerStatus.statusType,
  ]);

  useLayoutEffect(() => {
    if (wasCriticalSignal.current === prayerStatus.isCriticalSignal) return;

    wasCriticalSignal.current = prayerStatus.isCriticalSignal;
    setSignalTransitionKey((key) => key + 1);
    setIsSignalTransitioning(true);
    const transitionHalfDuration = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches
      ? 0
      : SIGNAL_TRANSITION_HALF_DURATION_MS;
    transitionTimer.current = window.setTimeout(() => {
      setDisplayedPrayerStatus(latestPrayerStatus.current);
      transitionTimer.current = null;
    }, transitionHalfDuration);

    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
        transitionTimer.current = null;
      }
    };
  }, [prayerStatus.isCriticalSignal]);

  return (
    <div
      lang={settings.language}
      className={cn(
        "min-h-screen lg:h-screen flex flex-col font-body-md overflow-y-auto lg:overflow-hidden",
        settings.theme === "dark"
          ? "dark bg-background-deep text-on-surface"
          : settings.theme === "classic"
            ? "classic bg-background-deep text-on-surface"
            : "light bg-background-deep text-on-surface",
      )}
    >
      <SkipLink href="#prayer-times" label={t.skipToPrayerTimes} />

      <main
        className="flex-1 min-h-0 grid grid-cols-1 gap-2 md:gap-3 tv:gap-stage-gap p-2 md:p-3 lg:p-5 tv:p-panel-padding lg:overflow-hidden lg:grid-cols-[minmax(0,1fr)_var(--adrail-width)]"
        style={
          {
            "--adrail-width": showAdRail ? "20vw" : "0px",
          } as CSSProperties
        }
      >
        <div className="col-span-1 flex-1 min-w-0 min-h-0 flex flex-col gap-2 md:gap-3 tv:gap-stage-gap lg:h-full">
          <div className="lg:flex-[0_1_65%] basis-auto min-w-0 min-h-0 flex items-stretch justify-center lg:overflow-hidden">
            <div
              className={cn(
                "relative w-full min-w-0 min-h-0 h-auto lg:h-full max-h-full overflow-hidden [--promo-rail-width:50%] md:flex md:items-stretch",
                promoActive &&
                  "md:transition-all md:duration-1000 md:flex-row md:justify-between",
              )}
            >
              <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center w-full h-auto lg:h-full overflow-hidden">
                <ClockPanel
                  clock={clock}
                  hijriDate={renderedPrayerStatus.hijriDate}
                  statusMessage={renderedPrayerStatus.statusMessage}
                  statusType={renderedPrayerStatus.statusType}
                  criticalSignal={renderedPrayerStatus.criticalSignal}
                  onOpenSettings={() => setSettingsOpen(true)}
                  promoActive={promoActive}
                />
              </div>
              <PromoRail
                isCriticalSignal={renderedPrayerStatus.isCriticalSignal}
                onActiveChange={setPromoActive}
              />
            </div>
          </div>

          {renderedPrayerStatus.loading ? (
            <div
              className="lg:flex-[0_1_35%] basis-auto min-h-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3"
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
              className="lg:flex-[0_1_35%] basis-auto min-h-0 min-w-0 overflow-hidden"
              id="prayer-times"
            >
              <PrayerTable
                prayers={renderedPrayerStatus.prayers}
                activePrayerIndex={renderedPrayerStatus.activePrayerIndex}
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

      {isSignalTransitioning && (
        <div
          key={signalTransitionKey}
          className="critical-signal-transition fixed inset-0 z-100 pointer-events-none bg-black"
          aria-hidden="true"
          onAnimationEnd={() => setIsSignalTransitioning(false)}
        />
      )}
    </div>
  );
}
