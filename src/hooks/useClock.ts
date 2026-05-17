import { useState, useEffect } from "react";
import type { ClockState, Language } from "../types";

function buildClockState(now: Date, language: Language): ClockState {
  const locale = language === "fr" ? "fr-CA" : "en-US";
  const h = now.getHours();
  const hours12 = h % 12 || 12;
  return {
    hours: String(hours12),
    hours24: String(h).padStart(2, "0"),
    minutes: String(now.getMinutes()).padStart(2, "0"),
    seconds: String(now.getSeconds()).padStart(2, "0"),
    ampm: h < 12 ? "AM" : "PM",
    gregorianDate: now.toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    dayName: now
      .toLocaleDateString(locale, { weekday: "long" })
      .toUpperCase(),
  };
}

export function useClock(language: Language = "en"): ClockState {
  const [state, setState] = useState<ClockState>(() =>
    buildClockState(new Date(), language)
  );

  useEffect(() => {
    setState(buildClockState(new Date(), language));
    const id = setInterval(
      () => setState(buildClockState(new Date(), language)),
      1000
    );
    return () => clearInterval(id);
  }, [language]);

  return state;
}
