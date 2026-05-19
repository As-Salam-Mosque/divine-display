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
    className="absolute bottom-0 w-full h-[clamp(5rem,12cqw,18rem)] opacity-10 bg-no-repeat bg-bottom bg-contain pointer-events-none"
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
    "clock-panel [--promo-rail-width:clamp(40%,45cqw,50%)] rounded-xl p-[clamp(0.5rem,2.2cqw,2.5rem)] md:flex-1 flex flex-col items-center justify-center relative overflow-hidden " +
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
          className="absolute top-[clamp(0.5rem,1.4cqw,1rem)] right-[clamp(0.5rem,1.4cqw,1rem)] z-30 w-[clamp(1.75rem,3.6cqw,3rem)] h-[clamp(1.75rem,3.6cqw,3rem)] flex items-center justify-center rounded-full text-text-muted hover:text-primary hover:bg-surface-container transition-colors"
        >
          <span
            className="material-symbols-outlined text-[clamp(1rem,2.2cqw,1.75rem)]"
            aria-hidden="true"
          >
            settings
          </span>
        </button>
      )}

      {isCriticalSignal ? (
        <div
          className="z-20 w-full h-full flex flex-col items-center justify-center text-center gap-[clamp(0.75rem,2.4cqw,2rem)]"
          role="alert"
          aria-live="assertive"
        >
          <span
            className="material-symbols-outlined filled text-primary text-[clamp(2rem,5.6cqw,5.5rem)] animate-pulse"
            aria-hidden="true"
          >
            campaign
          </span>
          <div className="max-w-[90%] font-headline-lg text-primary text-[clamp(1.75rem,5.2cqw,5.5rem)] leading-tight">
            {statusMessage}
          </div>
          <div className="flex items-baseline gap-3 text-primary">
            <span className="font-clock-display text-[clamp(2.5rem,10cqw,10rem)] leading-none">
              {displayHours}:{clock.minutes}
            </span>
            <span className="font-tabular-nums text-[clamp(1rem,3.2cqw,3.25rem)] font-bold leading-tight">
              :{clock.seconds}
            </span>
            {!is24h && (
              <span className="font-tabular-nums text-[clamp(1rem,3.2cqw,3.25rem)] font-bold leading-tight">
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
              "flex flex-col transition-all duration-500 min-w-0 " +
              (promoActive
                ? "md:w-[calc(100%-var(--promo-rail-width))] md:items-start md:pl-[clamp(0.75rem,2cqw,1.5rem)] max-md:items-center max-md:w-full"
                : "items-center w-full")
            }
          >
            {/* Mosque Identity */}
            <div className="flex flex-col items-center mb-[clamp(0.5rem,2cqw,1.5rem)] md:items-start">
              <div className="flex flex-col items-center mb-[clamp(0.25rem,1.2cqw,1rem)] md:items-start">
                <span
                  className="material-symbols-outlined filled text-primary text-[clamp(1.25rem,3.4cqw,3rem)] mb-[clamp(0.25rem,0.8cqw,0.5rem)]"
                  aria-hidden="true"
                >
                  mosque
                </span>
                <h1 className="font-headline-md text-[clamp(0.95rem,3.2cqw,2.25rem)] font-semibold tracking-[clamp(0.12em,0.6cqw,0.35em)] text-primary">
                  {settings.mosque.name}
                </h1>
                <p className="font-label-caps text-[clamp(0.55rem,1.2cqw,1rem)] text-text-muted">
                  {settings.mosque.city}
                </p>
              </div>

              {/* Dates */}
              <div className="clock-panel__dates flex items-center gap-[clamp(0.75rem,2.6cqw,2.5rem)]">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-[clamp(0.75rem,1.6cqw,1.25rem)] text-on-surface">
                    {clock.gregorianDate}
                  </span>
                  <span className="font-label-caps text-[clamp(0.6rem,1.2cqw,1rem)] text-text-muted">
                    {clock.dayName}
                  </span>
                </div>
                <div
                  className="w-[1px] h-[clamp(1.25rem,3cqw,3rem)] bg-primary/20"
                  aria-hidden="true"
                />
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-body-md text-[clamp(0.75rem,1.6cqw,1.25rem)] text-on-surface">
                    {hijriDate || "—"}
                  </span>
                  <span className="font-label-caps text-[clamp(0.6rem,1.2cqw,1rem)] text-text-muted">
                    {t.hijri}
                  </span>
                </div>
              </div>
            </div>

            {/* Clock */}
            <h2 className="font-label-caps text-[clamp(0.6rem,1.2cqw,1.1rem)] text-primary tracking-[clamp(0.2em,0.6cqw,0.35em)] z-10 mb-[clamp(0.25rem,0.8cqw,0.5rem)]">
              {t.currentTime}
            </h2>
            <div
              className="clock-panel__time flex items-baseline gap-[clamp(0.5rem,1.8cqw,1.5rem)] text-on-surface z-10"
              aria-label={`${displayHours}:${clock.minutes}${is24h ? "" : " " + clock.ampm}`}
              role="timer"
            >
              <span className="font-clock-display text-[clamp(3rem,15cqw,13.75rem)] leading-none">
                {displayHours}:{clock.minutes}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-[clamp(1rem,3.4cqw,3rem)] text-primary font-bold leading-tight">
                  :{clock.seconds}
                </span>
                {!is24h && (
                  <span className="text-[clamp(1rem,3.4cqw,3rem)] text-primary font-bold leading-tight">
                    {clock.ampm}
                  </span>
                )}
              </div>
            </div>

            {/* Status Pill */}
            {statusMessage && (
              <div className="clock-panel__status mt-[clamp(0.5rem,2.4cqw,2.5rem)] flex items-center gap-[clamp(0.5rem,1.4cqw,0.75rem)] status-pill rounded-full px-[clamp(0.75rem,2.2cqw,1.75rem)] py-[clamp(0.25rem,0.9cqw,0.75rem)] z-10 max-w-full">
                <span
                  className="material-symbols-outlined text-primary text-[clamp(1rem,2.2cqw,1.875rem)]"
                  aria-hidden="true"
                >
                  campaign
                </span>
                <span className="font-body-md text-[clamp(0.85rem,2.2cqw,1.875rem)] text-on-surface text-center">
                  {statusMessage}
                </span>
              </div>
            )}
          </div>

          {/* Right/Promotional rail - rendered out of layout flow (absolute on md+) so it won't change the panel height when it slides in. */}
          {showPromoRail && (
            <aside
              className={`md:block hidden md:absolute md:top-0 md:bottom-0 md:right-0 md:w-[var(--promo-rail-width)] pl-[clamp(0.75rem,2cqw,1.5rem)] h-full z-10 transform transition-all duration-[400ms] ease-out ${promoSlideState}`}
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
