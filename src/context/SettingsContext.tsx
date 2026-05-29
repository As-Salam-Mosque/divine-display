import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings, Language } from "../types";
import { DEFAULT_APP_SETTINGS } from "../types";

/** Only user-adjustable preferences are persisted — mosque config is never cached. */
type SettingsPatch = Partial<Omit<AppSettings, "mosque">>;

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
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Strip `mosque` if it was previously stored (migration from older versions)
    delete parsed.mosque;
    return parsed as SettingsPatch;
  } catch {
    return {};
  }
}

function persistSettings(patch: SettingsPatch): void {
  try {
    if (typeof window !== "undefined") {
      // Only persist user preferences — never mosque config
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patch));
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
    return {
      ...resolvedBaseSettings,
      ...overrides,
      // mosque always comes fresh from defaults (useMosqueConfig), never from cache
      mosque: resolvedBaseSettings.mosque,
    };
  }, [resolvedBaseSettings, overrides]);

  const updateSettings = useCallback(
    (patch: SettingsPatch) =>
      setOverrides((prev) => {
        const next: SettingsPatch = {
          ...prev,
          ...patch,
        };

        persistSettings(next);

        return next;
      }),
    [],
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
