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

const STORAGE_KEY = "divine-display-settings";

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStoredOverrides(): SettingsPatch {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SettingsPatch) : {};
  } catch {
    return {};
  }
}

function persistSettings(settings: AppSettings): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
    // Ignore storage errors (quota exceeded, private browsing, etc.)
  }
}

function detectLanguage(): Language {
  return navigator.language?.startsWith("fr")
    ? "fr"
    : DEFAULT_APP_SETTINGS.language;
}

export function SettingsProvider({
  children,
  defaults,
}: {
  children: ReactNode;
  defaults?: AppSettings;
}) {
  const resolvedBaseSettings = useMemo<AppSettings>(() => {
    const base = {
      ...DEFAULT_APP_SETTINGS,
      ...(defaults ?? {}),
    } as AppSettings;
    if (!base.language) base.language = detectLanguage();
    return base;
  }, [defaults]);

  const [overrides, setOverrides] =
    useState<SettingsPatch>(readStoredOverrides);

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

        const merged: AppSettings = {
          ...resolvedBaseSettings,
          ...next,
          mosque: { ...resolvedBaseSettings.mosque, ...(next.mosque ?? {}) },
        };
        persistSettings(merged);

        return next;
      }),
    [resolvedBaseSettings],
  );

  const value = useMemo(
    () => ({ settings, updateSettings }),
    [settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
