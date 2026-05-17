/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings } from "../types";
import { DEFAULT_APP_SETTINGS } from "../types";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
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
  const [settings, setSettings] = useState<AppSettings>(
    () => defaults ?? DEFAULT_APP_SETTINGS,
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = {
        ...prev,
        ...patch,
        mosque: { ...prev.mosque, ...(patch.mosque ?? {}) },
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
