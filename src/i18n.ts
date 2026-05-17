import type { Language } from "./types";
import en from "./translations/en";
import fr from "./translations/fr";

export const translations = { en, fr } as const;

export function useT(language: Language) {
  return translations[language];
}
