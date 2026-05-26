import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useDominantColor } from "../hooks/useDominantColor";
import type { AdSlot } from "../types";

interface PromoRailProps {
  isCriticalSignal: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function PromoRail({ isCriticalSignal, onActiveChange }: PromoRailProps) {
  const { settings } = useSettings();

  const promoExitDurationMs = 2000;
  const [promoPhase, setPromoPhase] = useState<"hidden" | "enter" | "visible" | "exit">("hidden");
  const [currentPromoSlot, setCurrentPromoSlot] = useState<AdSlot | null>(null);

  const timersRef = useRef<{ initial?: number; cycle?: number; promo?: number; exit?: number; enterFrame?: number; }>({});

  useEffect(() => {
    const currentTimers = timersRef.current;

    const clearAllTimers = () => {
      if (currentTimers.initial) window.clearTimeout(currentTimers.initial);
      if (currentTimers.cycle) window.clearTimeout(currentTimers.cycle);
      if (currentTimers.promo) window.clearTimeout(currentTimers.promo);
      if (currentTimers.exit) window.clearTimeout(currentTimers.exit);
      if (currentTimers.enterFrame) window.cancelAnimationFrame(currentTimers.enterFrame);
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

    const candidates = (settings.mosque?.adSlots || []).filter((s) => !!s.image && (s.weight ?? 0) > 0);
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
  const promoActive = !isCriticalSignal && settings.showSponsors && promoPhase !== "hidden";
  // Notify parent when promo active state changes so layout can adapt
  useEffect(() => {
    if (onActiveChange) onActiveChange(promoActive);
  }, [promoActive, onActiveChange]);
  const promoSlideState = promoActive && promoPhase === "visible" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";
  const showPromoRail = !isCriticalSignal && settings.showSponsors && promoImage;

  const { imgRef: promoImgRef, bgCss: promoBgCss, handleImageLoad: handlePromoImageLoad } = useDominantColor();

  if (!showPromoRail) return null;

  return (
    <aside
      className={`hidden md:block md:absolute md:top-0 md:right-0 md:w-[var(--promo-rail-width)] pl-1 md:pl-2 md:h-full z-10 transform transition-all duration-[2000ms] ease-out ${promoSlideState}`}
      aria-hidden={promoAlt === ""}
    >
      <div
        className={`w-full h-full rounded-xl overflow-hidden flex items-center justify-center shadow-inner ${promoBgCss ? "" : "bg-linear-to-tr from-[rgba(var(--primary-rgb),0.2)] to-[rgba(var(--primary-rgb),0.1)]"}`}
        style={promoBgCss ? { backgroundColor: promoBgCss } : undefined}
      >
        {promoSlot?.link && promoAlt !== "" ? (
          <a href={promoSlot.link} target="_blank" rel="noopener noreferrer" className="w-full h-full block rounded-xl focus-ring">
            <img
              ref={promoImgRef}
              src={promoImage}
              alt={promoAlt}
              className="object-contain w-full h-full aspect-16-9"
              onLoad={handlePromoImageLoad}
              crossOrigin="anonymous"
              decoding="async"
              loading="lazy"
            />
          </a>
        ) : (
          <img
            ref={promoImgRef}
            src={promoImage}
            alt={promoAlt}
            className="object-contain w-full h-full aspect-16-9"
            onLoad={handlePromoImageLoad}
            crossOrigin="anonymous"
            decoding="async"
            loading="lazy"
          />
        )}
      </div>
    </aside>
  );
}

export default PromoRail;
