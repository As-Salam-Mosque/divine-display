import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import type { AdSlot, ClockState, StatusType } from "../types";

interface ClockPanelProps {
  clock: ClockState;
  hijriDate: string;
  statusMessage: string;
  statusType: StatusType;
  onOpenSettings: () => void;
}

const MosqueSilhouette = () => (
  <div
    className="absolute bottom-0 w-full h-20 sm:h-24 md:h-40 lg:h-56 tv:h-72 opacity-10 bg-no-repeat bg-bottom bg-contain pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1000 300' xmlns='http://www.w3.org/2000/svg' fill='%23c5a059'><path d='M500 50 C450 150 400 200 400 300 L600 300 C600 200 550 150 500 50 Z M200 150 C180 200 150 250 150 300 L250 300 C250 250 220 200 200 150 Z M800 150 C780 200 750 250 750 300 L850 300 C850 250 820 200 800 150 Z M50 200 L70 300 L30 300 Z M950 200 L970 300 L930 300 Z'/></svg>")`,
    }}
    aria-hidden="true"
  />
);

export function ClockPanel({
  clock,
  hijriDate,
  statusMessage,
  statusType,
  onOpenSettings,
}: ClockPanelProps) {
  const { settings } = useSettings();
  const t = useT(settings.language);

  const is24h = settings.timeFormat === "24h";
  const displayHours = is24h ? clock.hours24 : clock.hours;
  const isCriticalSignal =
    statusType === "adhan-now" || statusType === "iqamah-now";

  // Promotional content toggle: show a promo panel for `promoDisplayDurationMs` every `promoCycleMs`.
  // Only enabled when sponsors are allowed in settings.
  const promoExitDurationMs = 400;
  const [promoPhase, setPromoPhase] = useState<
    "hidden" | "enter" | "visible" | "exit"
  >("hidden");
  const [currentPromoSlot, setCurrentPromoSlot] = useState<AdSlot | null>(null);
  const promoTimerRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const initialTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const resetPromo = () => {
      window.setTimeout(() => {
        setPromoPhase("hidden");
        setCurrentPromoSlot(null);
      }, 0);
    };

    if (!settings.showSponsors) {
      resetPromo();
      return;
    }

    // Read timing from mosque promo config, falling back to reasonable defaults
    const promoCfg = settings.mosque?.promo || {};
    const promoDisplayDurationMs = promoCfg.displayDurationMs ?? 10_000; // default 10s
    const promoCycleMs = promoCfg.cycleMs ?? 120_000; // default 120s
    const initialDelayMs = promoCfg.initialDelayMs ?? 15_000; // default 15s

    // build list of candidate slots (with images)
    const candidates = (settings.mosque?.adSlots || []).filter(
      (s) => !!s.image && (s.weight ?? 0) > 0,
    );
    if (candidates.length === 0) {
      resetPromo();
      return;
    }

    const pickWeightedSlot = () => {
      const total = candidates.reduce((acc, s) => acc + (s.weight ?? 0), 0);
      if (total <= 0) return candidates[0];
      let r = Math.random() * total;
      for (const s of candidates) {
        r -= s.weight ?? 0;
        if (r <= 0) return s;
      }
      // fallback
      return candidates[0];
    };

    const showCycle = () => {
      const chosen = pickWeightedSlot();
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      setCurrentPromoSlot(chosen);
      setPromoPhase("enter");
      if (enterFrameRef.current) {
        window.cancelAnimationFrame(enterFrameRef.current);
      }
      enterFrameRef.current = window.requestAnimationFrame(() => {
        setPromoPhase("visible");
      });

      if (promoTimerRef.current) {
        window.clearTimeout(promoTimerRef.current);
      }
      promoTimerRef.current = window.setTimeout(() => {
        setPromoPhase("exit");
        // keep a small timeout before clearing slot to allow slide-out
        exitTimerRef.current = window.setTimeout(() => {
          setPromoPhase("hidden");
          setCurrentPromoSlot(null);
        }, promoExitDurationMs);
      }, promoDisplayDurationMs);
    };

    // Stagger the first appearance slightly so it doesn't always show immediately on load.
    initialTimerRef.current = window.setTimeout(showCycle, initialDelayMs);

    // Start recurring cycle after the stagger.
    cycleTimerRef.current = window.setInterval(showCycle, promoCycleMs);

    return () => {
      if (promoTimerRef.current) window.clearTimeout(promoTimerRef.current);
      if (cycleTimerRef.current) window.clearInterval(cycleTimerRef.current);
      if (initialTimerRef.current) window.clearTimeout(initialTimerRef.current);
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      if (enterFrameRef.current)
        window.cancelAnimationFrame(enterFrameRef.current);
    };
  }, [settings.showSponsors, settings.mosque]);

  const promoSlot = currentPromoSlot;
  const promoImage = promoSlot?.image ?? null;
  const promoAlt = promoSlot?.label ?? "";
  const promoActive =
    !isCriticalSignal && settings.showSponsors && promoPhase !== "hidden";
  const promoSlideState =
    promoActive && promoPhase === "visible"
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";
  const showPromoRail =
    !isCriticalSignal && settings.showSponsors && promoImage;
  const panelClassName =
    "rounded-xl p-2 sm:p-4 md:p-6 lg:p-8 tv:p-10 md:flex-1 flex flex-col items-center justify-center relative overflow-hidden " +
    (isCriticalSignal
      ? "bg-background-deep border-2 border-primary shadow-[0_0_45px_rgba(233,193,118,0.6)]"
      : "bg-surface-panel ghost-border active-glow");

  return (
    <div className={panelClassName}>
      {!isCriticalSignal && <MosqueSilhouette />}

      {/* Gear icon */}
      {!isCriticalSignal && (
        <button
          onClick={onOpenSettings}
          aria-label={t.settings}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-30 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 tv:w-12 tv:h-12 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
        >
          <span
            className="material-symbols-outlined text-[18px] sm:text-[20px] lg:text-[24px] tv:text-[28px]"
            aria-hidden="true"
          >
            settings
          </span>
        </button>
      )}

      {isCriticalSignal ? (
        <div
          className="z-20 w-full h-full flex flex-col items-center justify-center text-center gap-4 sm:gap-6 md:gap-8"
          role="alert"
          aria-live="assertive"
        >
          <span
            className="material-symbols-outlined filled text-primary text-[32px] sm:text-[40px] md:text-[56px] lg:text-[72px] tv:text-[88px] animate-pulse"
            aria-hidden="true"
          >
            campaign
          </span>
          <div className="max-w-[90%] font-headline-lg text-primary text-[28px] sm:text-[36px] md:text-[56px] lg:text-[72px] tv:text-[88px] leading-tight">
            {statusMessage}
          </div>
          <div className="flex items-baseline gap-3 text-primary">
            <span className="font-clock-display text-[40px] sm:text-[52px] md:text-[84px] lg:text-[120px] tv:text-[160px] leading-none">
              {displayHours}:{clock.minutes}
            </span>
            <span className="font-tabular-nums text-[18px] sm:text-[22px] md:text-[30px] lg:text-[40px] tv:text-[52px] font-bold leading-tight">
              :{clock.seconds}
            </span>
            {!is24h && (
              <span className="font-tabular-nums text-[18px] sm:text-[22px] md:text-[30px] lg:text-[40px] tv:text-[52px] font-bold leading-tight">
                {clock.ampm}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            "z-10 w-full transition-all duration-500 max-md:flex-col max-md:items-center max-md:justify-center " +
            (promoActive
              ? "md:flex md:flex-row md:items-stretch md:justify-between"
              : "flex flex-col items-center justify-center")
          }
        >
          {/* Left/main content */}
          <div
            className={
              "flex flex-col transition-all duration-500 " +
              (promoActive
                ? "md:w-1/2 md:items-start md:pl-6 max-md:items-center max-md:w-full"
                : "items-center w-full")
            }
          >
            {/* Mosque Identity */}
            <div className="flex flex-col items-center mb-2 sm:mb-4 md:mb-6 md:items-start">
              <div className="flex flex-col items-center mb-1 sm:mb-2 md:mb-4 md:items-start">
                <span
                  className="material-symbols-outlined filled text-primary text-xl sm:text-2xl md:text-3xl lg:text-4xl tv:text-5xl mb-1"
                  aria-hidden="true"
                >
                  mosque
                </span>
                <h1 className="font-headline-md text-base sm:text-lg md:text-2xl lg:text-3xl tv:text-4xl font-semibold tracking-[0.2em] md:tracking-[0.25em] lg:tracking-[0.3em] tv:tracking-[0.35em] text-primary">
                  {settings.mosque.name}
                </h1>
                <p className="font-label-caps text-[9px] sm:text-[10px] md:text-xs lg:text-sm tv:text-base text-text-muted">
                  {settings.mosque.city}
                </p>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-[11px] sm:text-sm md:text-base lg:text-lg tv:text-xl text-on-surface">
                    {clock.gregorianDate}
                  </span>
                  <span className="font-label-caps text-[10px] sm:text-[11px] md:text-xs lg:text-sm tv:text-base text-text-muted">
                    {clock.dayName}
                  </span>
                </div>
                <div
                  className="w-[1px] h-6 sm:h-7 md:h-8 lg:h-10 tv:h-12 bg-primary/20"
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-[11px] sm:text-sm md:text-base lg:text-lg tv:text-xl text-on-surface">
                    {hijriDate || "—"}
                  </span>
                  <span className="font-label-caps text-[10px] sm:text-[11px] md:text-xs lg:text-sm tv:text-base text-text-muted">
                    {t.hijri}
                  </span>
                </div>
              </div>
            </div>

            {/* Clock */}
            <h2 className="font-label-caps text-[10px] sm:text-[11px] md:text-label-caps lg:text-base tv:text-lg text-primary tracking-widest z-10 mb-1 md:mb-1">
              {t.currentTime}
            </h2>
            <div
              className="flex items-baseline gap-2 md:gap-4 text-on-surface z-10"
              aria-label={`${displayHours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
              role="timer"
            >
              <span className="font-clock-display text-[44px] sm:text-[56px] md:text-[96px] lg:text-[140px] xl:text-[180px] tv:text-[220px] leading-none">
                {displayHours}:{clock.minutes}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-[16px] sm:text-[18px] md:text-[24px] lg:text-[32px] xl:text-[40px] tv:text-[48px] text-primary font-bold leading-tight">
                  :{clock.seconds}
                </span>
                {!is24h && (
                  <span className="text-[16px] sm:text-[18px] md:text-[24px] lg:text-[32px] xl:text-[40px] tv:text-[48px] text-primary font-bold leading-tight">
                    {clock.ampm}
                  </span>
                )}
              </div>
            </div>

            {/* Status Pill */}
            {statusMessage && (
              <div className="mt-2 sm:mt-4 md:mt-6 lg:mt-8 tv:mt-10 flex items-center gap-2 md:gap-3 status-pill rounded-full px-3 sm:px-4 md:px-5 lg:px-6 tv:px-7 py-1 md:py-2 lg:py-2.5 z-10">
                <span
                  className="material-symbols-outlined text-primary text-base sm:text-lg md:text-[22px] lg:text-[26px] tv:text-[30px]"
                  aria-hidden="true"
                >
                  campaign
                </span>
                <span className="font-body-md text-sm sm:text-base md:text-body-lg lg:text-[26px] tv:text-[30px] text-on-surface">
                  {statusMessage}
                </span>
              </div>
            )}
          </div>

          {/* Right/Promotional rail - rendered out of layout flow (absolute on md+) so it won't change the panel height when it slides in. */}
          {showPromoRail && (
            <aside
              className={`md:block hidden md:absolute md:top-0 md:bottom-0 md:right-0 md:w-1/2 pl-4 h-full z-10 transform transition-all duration-[400ms] ease-out ${promoSlideState}`}
              aria-hidden={promoAlt === ""}
            >
              <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-tr from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
                {/* If the ad slot includes a link, make the promo clickable. Include security attributes for external links. */}
                {promoSlot?.link ? (
                  <a
                    href={promoSlot.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full block"
                  >
                    <img
                      src={promoImage}
                      alt={promoAlt}
                      className="object-cover w-full h-full"
                    />
                  </a>
                ) : (
                  <img
                    src={promoImage}
                    alt={promoAlt}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
