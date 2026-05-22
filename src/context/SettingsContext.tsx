/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings, MosqueConfig } from "../types";
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
  const baseSettings = defaults ?? DEFAULT_APP_SETTINGS;
  const [overrides, setOverrides] = useState<SettingsPatch>({});

  const settings = useMemo<AppSettings>(() => {
    const mergedMosque: MosqueConfig = {
      ...baseSettings.mosque,
      ...(overrides.mosque ?? {}),
    };

    return {
      ...baseSettings,
      ...overrides,
      mosque: mergedMosque,
    };
  }, [baseSettings, overrides]);

  const updateSettings = useCallback((patch: SettingsPatch) => {
    setOverrides((prev) => {
      const next: SettingsPatch = {
        ...prev,
        ...patch,
        mosque: { ...(prev.mosque ?? {}), ...(patch.mosque ?? {}) },
      };
      // Intentionally do not persist settings to localStorage.
      return next;
    });
  }, []);

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
