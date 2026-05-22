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

// Reusable Campaign SVG with your custom path data
const CampaignIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" />
  </svg>
);

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

  const promoExitDurationMs = 400;
  const [promoPhase, setPromoPhase] = useState<
    "hidden" | "enter" | "visible" | "exit"
  >("hidden");
  const [currentPromoSlot, setCurrentPromoSlot] = useState<AdSlot | null>(null);

  const timersRef = useRef<{
    initial?: number;
    cycle?: number;
    promo?: number;
    exit?: number;
    enterFrame?: number;
  }>({});

  useEffect(() => {
    const currentTimers = timersRef.current;

    const clearAllTimers = () => {
      if (currentTimers.initial) window.clearTimeout(currentTimers.initial);
      if (currentTimers.cycle) window.clearTimeout(currentTimers.cycle);
      if (currentTimers.promo) window.clearTimeout(currentTimers.promo);
      if (currentTimers.exit) window.clearTimeout(currentTimers.exit);
      if (currentTimers.enterFrame)
        window.cancelAnimationFrame(currentTimers.enterFrame);
    };

    const resetPromoState = () => {
      clearAllTimers();
      setPromoPhase("hidden");
      setCurrentPromoSlot(null);
    };

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resetPromoState();
      return;
    }

    if (!settings.showSponsors) {
      resetPromoState();
      return;
    }

    const promoCfg = settings.mosque?.promo || {};
    const promoDisplayDurationMs = promoCfg.displayDurationMs ?? 10_000;
    const promoCycleMs = promoCfg.cycleMs ?? 120_000;
    const initialDelayMs = promoCfg.initialDelayMs ?? 15_000;

    const candidates = (settings.mosque?.adSlots || []).filter(
      (s) => !!s.image && (s.weight ?? 0) > 0,
    );
    if (candidates.length === 0) {
      resetPromoState();
      return;
    }

    const pickWeightedSlot = (): AdSlot => {
      const total = candidates.reduce((acc, s) => acc + (s.weight ?? 0), 0);
      if (total <= 0) return candidates[0];
      let r = Math.random() * total;
      for (const s of candidates) {
        r -= s.weight ?? 0;
        if (r <= 0) return s;
      }
      return candidates[0];
    };

    const runPromoCycle = () => {
      const chosen = pickWeightedSlot();
      setCurrentPromoSlot(chosen);
      setPromoPhase("enter");

      currentTimers.enterFrame = window.requestAnimationFrame(() => {
        setPromoPhase("visible");
      });

      currentTimers.promo = window.setTimeout(() => {
        setPromoPhase("exit");

        currentTimers.exit = window.setTimeout(() => {
          setPromoPhase("hidden");
          setCurrentPromoSlot(null);
        }, promoExitDurationMs);
      }, promoDisplayDurationMs);

      currentTimers.cycle = window.setTimeout(runPromoCycle, promoCycleMs);
    };

    currentTimers.initial = window.setTimeout(runPromoCycle, initialDelayMs);

    return () => clearAllTimers();
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
      ? "bg-background-deep border-2 border-primary shadow-[0_0_45px_rgba(var(--primary-rgb),0.6)]"
      : "bg-surface-panel ghost-border active-glow");

  return (
    <div className={panelClassName}>
      {!isCriticalSignal && <MosqueSilhouette />}

      {/* Settings Gear */}
      {!isCriticalSignal && (
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t.settings}
          className="absolute top-2 md:top-3 lg:top-4 right-2 md:right-3 lg:right-4 z-30 w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-[rgba(var(--primary-rgb),0.18)] focus-visible:text-primary focus-visible:bg-[rgba(var(--primary-rgb),0.18)] transition-colors focus-ring"
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
          className="z-20 w-full h-full flex flex-col items-center justify-center text-center gap-6 md:gap-10 lg:gap-12"
          role="alert"
          aria-live="assertive"
        >
          {/* CRITICAL IMMERSIVE SVG ICON - ENORMOUS SIZING FOR TV PANELS */}
          <CampaignIcon className="text-primary motion-safe:animate-pulse w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-64 lg:h-64 tv:w-[22rem] tv:h-[22rem]" />

          <div className="max-w-[90%] font-headline-lg text-primary text-xl md:text-4xl lg:text-6xl leading-tight font-bold">
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
          {/* Main Display / Left Column */}
          <div
            className={
              "flex flex-col transition-all duration-500 min-w-0 " +
              (promoActive
                ? "md:w-[calc(100%-var(--promo-rail-width))] md:items-start pl-3 md:pl-6 max-md:items-center max-md:w-full"
                : "items-center w-full")
            }
          >
            {/* Mosque Branding */}
            <div className="flex flex-col items-center mb-2 md:mb-4 lg:mb-6 md:items-start">
              <div className="flex flex-col items-center mb-1 md:mb-3 lg:mb-4 md:items-start">
                <span
                  className="material-symbols-outlined filled text-primary text-xl md:text-3xl lg:text-4xl mb-1 md:mb-2"
                  aria-hidden="true"
                >
                  mosque
                </span>
                <h1 className="font-headline-md text-sm md:text-xl lg:text-3xl tv:text-4xl font-semibold tracking-[0.18em] md:tracking-[0.28em] lg:tracking-[0.35em] text-primary">
                  {settings.mosque?.name}
                </h1>
                <p className="font-label-caps text-xs md:text-sm lg:text-base text-text-muted">
                  {settings.mosque?.city}
                </p>
              </div>

              {/* Calendar Row */}
              <div className="clock-panel__dates flex items-center gap-3 md:gap-6 lg:gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-sm md:text-base lg:text-lg text-on-surface font-medium">
                    {clock.gregorianDate}
                  </span>
                  <span className="font-label-caps text-xs md:text-sm lg:text-sm text-text-muted">
                    {clock.dayName}
                  </span>
                </div>
                <div
                  className="w-px h-5 md:h-8 lg:h-12 bg-primary-20"
                  aria-hidden="true"
                ></div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-sm md:text-base lg:text-lg text-on-surface font-medium">
                    {hijriDate || "—"}
                  </span>
                  <span className="font-label-caps text-xs md:text-sm lg:text-sm text-text-muted">
                    {t.hijri}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Metrics */}
            <h2 className="font-label-caps text-xs md:text-sm lg:text-sm text-primary tracking-wide md:tracking-wider z-10 mb-1 md:mb-2 lg:mb-3">
              {t.currentTime}
            </h2>
            <div
              className="clock-panel__time flex items-baseline gap-2 md:gap-6 lg:gap-8 text-on-surface z-10"
              aria-label={`${displayHours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
              role="timer"
            >
              <span className="font-clock-display text-8xl sm:text-7xl md:text-8xl lg:text-[10rem] tv:text-[11rem] leading-none">
                {displayHours}:{clock.minutes}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-lg sm:text-xl md:text-3xl lg:text-4xl tv:text-5xl text-primary font-bold leading-tight">
                  :{clock.seconds}
                </span>
                {!is24h && (
                  <span className="text-lg sm:text-xl md:text-3xl lg:text-4xl tv:text-5xl text-primary font-bold leading-tight">
                    {clock.ampm}
                  </span>
                )}
              </div>
            </div>

            {/* STANDARD PILL STATUS BAR - DRIVEN BY SVG SCALING */}
            {statusMessage && (
              <div
                className="clock-panel__status mt-2 md:mt-4 lg:mt-6 flex items-center gap-3 md:gap-5 status-pill rounded-full px-4 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 z-10 max-w-full"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <CampaignIcon className="text-primary w-6 h-6 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0" />
                <span className="font-body-md text-base md:text-xl lg:text-2xl text-on-surface text-center font-semibold">
                  {statusMessage}
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Promotional Side Rail Component */}
          {showPromoRail && (
            <aside
              className={`md:block hidden md:absolute md:top-0 md:bottom-0 md:right-0 md:w-(--promo-rail-width) pl-3 md:pl-6 h-full z-10 transform transition-all duration-400 ease-out ${promoSlideState}`}
              aria-hidden={promoAlt === ""}
            >
              <div
                className={`w-full h-full rounded-xl overflow-hidden flex items-center justify-center shadow-inner ${
                  promoBgCss
                    ? ""
                    : "bg-linear-to-tr from-[rgba(var(--primary-rgb),0.2)] to-[rgba(var(--primary-rgb),0.1)]"
                }`}
                style={promoBgCss ? { backgroundColor: promoBgCss } : undefined}
              >
                {promoSlot?.link && promoAlt !== "" ? (
                  <a
                    href={promoSlot.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full block rounded-xl focus-ring"
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
