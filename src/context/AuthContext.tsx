import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthState {
  token: string | null;
  slug: string | null;
  expiresAt: string | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, slug: string, expiresAt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "divine-display-auth";

function isSessionValid(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry)) return false;
  return Date.now() < expiry;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        if (
          parsed?.token &&
          parsed?.slug &&
          parsed?.expiresAt &&
          isSessionValid(parsed.expiresAt)
        ) {
          return parsed;
        }
        localStorage.removeItem(STORAGE_KEY);
        return { token: null, slug: null, expiresAt: null };
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        return { token: null, slug: null, expiresAt: null };
      }
    }
    return { token: null, slug: null, expiresAt: null };
  });

  const login = useCallback((token: string, slug: string, expiresAt: string) => {
    const newState = { token, slug, expiresAt };
    setAuth(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, slug: null, expiresAt: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!auth.expiresAt) return;
    const expiresInMs = Date.parse(auth.expiresAt) - Date.now();
    if (!Number.isFinite(expiresInMs) || expiresInMs <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
    }, expiresInMs);

    return () => window.clearTimeout(timeoutId);
  }, [auth.expiresAt, logout]);

  const isAuthenticated = useMemo(
    () =>
      Boolean(auth.token && auth.slug && auth.expiresAt) &&
      isSessionValid(auth.expiresAt),
    [auth.token, auth.slug, auth.expiresAt],
  );

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
