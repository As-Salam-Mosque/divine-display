import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthState {
  token: string | null;
  slug: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, slug: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = localStorage.getItem("divine-display-auth");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { token: null, slug: null };
      }
    }
    return { token: null, slug: null };
  });

  const login = (token: string, slug: string) => {
    const newState = { token, slug };
    setAuth(newState);
    localStorage.setItem("divine-display-auth", JSON.stringify(newState));
  };

  const logout = () => {
    setAuth({ token: null, slug: null });
    localStorage.removeItem("divine-display-auth");
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
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
