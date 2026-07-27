import { useEffect } from "react";
import type { Language } from "../types";

export const LANGUAGE_ROTATION_INTERVAL_MS = 5 * 60 * 1000;

interface UseLanguageRotationOptions {
  enabled: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

function nextLanguage(language: Language): Language {
  return language === "en" ? "fr" : "en";
}

/** Switches the display language on a fixed cadence while enabled. */
export function useLanguageRotation({
  enabled,
  language,
  onLanguageChange,
}: UseLanguageRotationOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      onLanguageChange(nextLanguage(language));
    }, LANGUAGE_ROTATION_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, language, onLanguageChange]);
}
