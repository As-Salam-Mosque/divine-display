import { useEffect, useRef, useState } from "react";
import type { AdSlot, PromoConfig } from "../types";

type PromoPhase = "hidden" | "enter" | "visible" | "exit";

interface PromoTimerState {
  phase: PromoPhase;
  currentSlot: AdSlot | null;
}

interface PromoTimerOptions {
  slots: AdSlot[];
  promoConfig?: PromoConfig;
  enabled: boolean;
}

const EXIT_DURATION_MS = 2000;

/**
 * Picks a weighted-random slot from candidates.
 * Higher `weight` values increase selection probability.
 */
function pickWeightedSlot(candidates: AdSlot[]): AdSlot {
  const total = candidates.reduce((acc, s) => acc + (s.weight ?? 0), 0);
  if (total <= 0) return candidates[0];

  let r = Math.random() * total;
  for (const slot of candidates) {
    r -= slot.weight ?? 0;
    if (r <= 0) return slot;
  }
  return candidates[0];
}

/**
 * Manages the timed promo rotation lifecycle (enter → visible → exit → hidden).
 * Returns the current phase and active slot for rendering.
 */
export function usePromoTimer({
  slots,
  promoConfig,
  enabled,
}: PromoTimerOptions): PromoTimerState {
  const [phase, setPhase] = useState<PromoPhase>("hidden");
  const [currentSlot, setCurrentSlot] = useState<AdSlot | null>(null);
  const timersRef = useRef<{
    initial?: number;
    cycle?: number;
    display?: number;
    exit?: number;
    enterFrame?: number;
  }>({});

  useEffect(() => {
    const timers = timersRef.current;

    const clearAllTimers = () => {
      if (timers.initial) window.clearTimeout(timers.initial);
      if (timers.cycle) window.clearTimeout(timers.cycle);
      if (timers.display) window.clearTimeout(timers.display);
      if (timers.exit) window.clearTimeout(timers.exit);
      if (timers.enterFrame) window.cancelAnimationFrame(timers.enterFrame);
    };

    const reset = () => {
      clearAllTimers();
      setPhase("hidden");
      setCurrentSlot(null);
    };

    // Disable on small screens or when feature is turned off
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      reset();
      return;
    }

    if (!enabled) {
      reset();
      return;
    }

    const candidates = slots.filter((s) => !!s.image && (s.weight ?? 0) > 0);
    if (candidates.length === 0) {
      reset();
      return;
    }

    const displayDuration = promoConfig?.displayDurationMs ?? 10_000;
    const cycleInterval = promoConfig?.cycleMs ?? 120_000;
    const initialDelay = promoConfig?.initialDelayMs ?? 15_000;

    const runCycle = () => {
      // If the tab is hidden, postpone starting the animation until it's visible again
      if (typeof document !== "undefined" && document.hidden) {
        timers.cycle = window.setTimeout(runCycle, 1000);
        return;
      }

      const chosen = pickWeightedSlot(candidates);
      setCurrentSlot(chosen);
      setPhase("enter");

      // Transition to "visible" on next frame for CSS transition triggers
      timers.enterFrame = window.requestAnimationFrame(() => {
        setPhase("visible");
      });

      // After display duration, begin exit
      timers.display = window.setTimeout(() => {
        setPhase("exit");

        timers.exit = window.setTimeout(() => {
          setPhase("hidden");
          setCurrentSlot(null);
        }, EXIT_DURATION_MS);
      }, displayDuration);

      // Schedule next cycle
      timers.cycle = window.setTimeout(runCycle, cycleInterval);
    };

    timers.initial = window.setTimeout(runCycle, initialDelay);

    return clearAllTimers;
  }, [slots, promoConfig, enabled]);

  return { phase, currentSlot };
}
