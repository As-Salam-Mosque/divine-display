import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AppSettings } from "../types";

const STORAGE_KEY = "divine-display-settings";

function loadSettings(defaults: AppSettings): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...defaults,
        ...stored,
        mosque: { ...defaults.mosque, ...(stored.mosque ?? {}) },
      };
    }
  } catch {
    // ignore corrupt cache
  }
  return defaults;
}

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
  defaults: AppSettings;
}) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettings(defaults)
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = {
        ...prev,
        ...patch,
        mosque: { ...prev.mosque, ...(patch.mosque ?? {}) },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
