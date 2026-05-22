import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useT } from "../i18n";
import type { AdSlot, ClockState, StatusType } from "../types";
import { useDominantColor } from "../hooks/useDominantColor";

interface ClockPanelProps {
  clock: ClockState;
  hijriDate: string;
  statusMessage: string;
  statusType: StatusType;
  onOpenSettings: () => void;
}

const MosqueSilhouette = () => (
  <div
    className="absolute bottom-0 w-full h-20 md:h-36 lg:h-44 opacity-10 bg-no-repeat bg-bottom bg-contain pointer-events-none"
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

  const {
    imgRef: promoImgRef,
    bgCss: promoBgCss,
    handleImageLoad: handlePromoImageLoad,
  } = useDominantColor();

  const panelClassName =
    "clock-panel [--promo-rail-width:50%] rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 tv:p-8 md:flex-1 flex flex-col items-center justify-center relative overflow-hidden " +
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
          className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-30 w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
        >
          <span
            className="material-symbols-outlined text-base md:text-xl lg:text-2xl"
            aria-hidden="true"
          >
            settings
          </span>
        </button>
      )}

      {isCriticalSignal ? (
        <div
          className="z-20 w-full h-full flex flex-col items-center justify-center text-center gap-3 md:gap-6 lg:gap-8"
          role="alert"
          aria-live="assertive"
        >
          <span
            className="material-symbols-outlined filled text-primary text-4xl md:text-6xl lg:text-7xl animate-pulse"
            aria-hidden="true"
          >
            campaign
          </span>
          <div className="max-w-[90%] font-headline-lg text-primary text-xl md:text-4xl lg:text-6xl leading-tight">
            {statusMessage}
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
              "flex flex-col transition-all duration-500 min-w-0 " +
              (promoActive
                ? "md:w-[calc(100%-var(--promo-rail-width))] md:items-start pl-3 md:pl-6 max-md:items-center max-md:w-full"
                : "items-center w-full")
            }
          >
            {/* Mosque Identity */}
            <div className="flex flex-col items-center mb-2 md:mb-4 lg:mb-6 md:items-start">
              <div className="flex flex-col items-center mb-1 md:mb-3 lg:mb-4 md:items-start">
                <span
                  className="material-symbols-outlined filled text-primary text-xl md:text-3xl lg:text-4xl mb-1 md:mb-2"
                  aria-hidden="true"
                >
                  mosque
                </span>
                <h1 className="font-headline-md text-sm md:text-xl lg:text-3xl tv:text-4xl font-semibold tracking-[0.18em] md:tracking-[0.28em] lg:tracking-[0.35em] text-primary">
                  {settings.mosque.name}
                </h1>
                <p className="font-label-caps text-xs md:text-sm lg:text-base text-text-muted">
                  {settings.mosque.city}
                </p>
              </div>

              {/* Dates */}
              <div className="clock-panel__dates flex items-center gap-3 md:gap-6 lg:gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-sm md:text-base lg:text-lg text-on-surface">
                    {clock.gregorianDate}
                  </span>
                  <span className="font-label-caps text-xs md:text-sm lg:text-sm text-text-muted">
                    {clock.dayName}
                  </span>
                </div>
                <div
                  className="w-[1px] h-5 md:h-8 lg:h-12 bg-primary/20"
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-sm md:text-base lg:text-lg text-on-surface">
                    {hijriDate || "—"}
                  </span>
                  <span className="font-label-caps text-xs md:text-sm lg:text-sm text-text-muted">
                    {t.hijri}
                  </span>
                </div>
              </div>
            </div>

            {/* Clock */}
            <h2 className="font-label-caps text-xs md:text-sm lg:text-sm text-primary tracking-wide md:tracking-wider z-10 mb-1 md:mb-2 lg:mb-3">
              {t.currentTime}
            </h2>
            <div
              className="clock-panel__time flex items-baseline gap-2 md:gap-6 lg:gap-8 text-on-surface z-10"
              aria-label={`${displayHours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
              role="timer"
            >
              <span className="font-clock-display text-5xl sm:text-6xl md:text-7xl lg:text-[9rem] tv:text-[10rem] leading-none">
                {displayHours}:{clock.minutes}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg md:text-2xl lg:text-3xl tv:text-4xl text-primary font-bold leading-tight">
                  :{clock.seconds}
                </span>
                {!is24h && (
                  <span className="text-base sm:text-lg md:text-2xl lg:text-3xl tv:text-4xl text-primary font-bold leading-tight">
                    {clock.ampm}
                  </span>
                )}
              </div>
            </div>

            {/* Status Pill */}
            {statusMessage && (
              <div className="clock-panel__status mt-2 md:mt-4 lg:mt-6 flex items-center gap-2 md:gap-4 status-pill rounded-full px-3 md:px-6 lg:px-8 py-1 md:py-2 lg:py-3 z-10 max-w-full">
                <span
                  className="material-symbols-outlined text-primary text-base md:text-xl lg:text-2xl"
                  aria-hidden="true"
                >
                  campaign
                </span>
                <span className="font-body-md text-sm md:text-lg lg:text-xl text-on-surface text-center">
                  {statusMessage}
                </span>
              </div>
            )}
          </div>

          {/* Right/Promotional rail - rendered out of layout flow (absolute on md+) so it won't change the panel height when it slides in. */}
          {showPromoRail && (
            <aside
              className={`md:block hidden md:absolute md:top-0 md:bottom-0 md:right-0 md:w-[var(--promo-rail-width)] pl-3 md:pl-6 h-full z-10 transform transition-all duration-[400ms] ease-out ${promoSlideState}`}
              aria-hidden={promoAlt === ""}
            >
              <div
                className={`${"w-full h-full rounded-xl overflow-hidden flex items-center justify-center shadow-inner"} ${
                  promoBgCss
                    ? ""
                    : "bg-gradient-to-tr from-primary/20 to-primary/10"
                }`}
                style={promoBgCss ? { backgroundColor: promoBgCss } : undefined}
              >
                {/* If the ad slot includes a link, make the promo clickable. Include security attributes for external links. */}
                {promoSlot?.link ? (
                  <a
                    href={promoSlot.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full block"
                  >
                    <img
                      ref={promoImgRef}
                      src={promoImage}
                      alt={promoAlt}
                      className="object-contain w-full h-full"
                      onLoad={handlePromoImageLoad}
                      crossOrigin="anonymous"
                      decoding="async"
                    />
                  </a>
                ) : (
                  <img
                    ref={promoImgRef}
                    src={promoImage}
                    alt={promoAlt}
                    className="object-contain w-full h-full"
                    onLoad={handlePromoImageLoad}
                    crossOrigin="anonymous"
                    decoding="async"
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
