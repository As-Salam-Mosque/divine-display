/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings, MosqueConfig, Language } from "../types";
import { DEFAULT_APP_SETTINGS } from "../types";

type SettingsPatch = Partial<Omit<AppSettings, "mosque">> & {
  mosque?: Partial<MosqueConfig>;
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: SettingsPatch) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  children,
  defaults,
}: {
  children: ReactNode;
  // allow optional override, but fall back to hardcoded defaults
  defaults?: AppSettings;
}) {
  // Resolve base settings: merge provided defaults over app defaults and
  // pick a sensible language fallback (detect 'fr' prefix in navigator).
  const resolvedBaseSettings = useMemo<AppSettings>(() => {
    const detectedLanguage: Language =
      navigator.language?.startsWith('fr')
        ? 'fr'
        : DEFAULT_APP_SETTINGS.language;

    const base = { ...DEFAULT_APP_SETTINGS, ...(defaults ?? {}) } as AppSettings;
    if (!base.language) base.language = detectedLanguage;
    return base;
  }, [defaults]);
  const STORAGE_KEY = 'divine-display-settings';

  const [overrides, setOverrides] = useState<SettingsPatch>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SettingsPatch) : {};
    } catch {
      return {};
    }
  });

  const settings = useMemo<AppSettings>(() => {
    const mergedMosque: MosqueConfig = {
      ...resolvedBaseSettings.mosque,
      ...(overrides.mosque ?? {}),
    };

    return {
      ...resolvedBaseSettings,
      ...overrides,
      mosque: mergedMosque,
    };
  }, [resolvedBaseSettings, overrides]);

  const updateSettings = useCallback(
    (patch: SettingsPatch) =>
      setOverrides((prev) => {
        const next: SettingsPatch = {
          ...prev,
          ...patch,
          mosque: { ...(prev.mosque ?? {}), ...(patch.mosque ?? {}) },
        };

        try {
          if (typeof window !== 'undefined') {
            const merged: AppSettings = {
              ...resolvedBaseSettings,
              ...next,
              mosque: { ...resolvedBaseSettings.mosque, ...(next.mosque ?? {}) },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          }
        } catch {
          /* ignore */
        }

        return next;
      }),
    [resolvedBaseSettings],
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
