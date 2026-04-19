import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { setAuthToken } from "@/api";

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  myLeetcodeUsername?: string;
  reminderEmailEnabled?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "codestalk_token";
const USER_STORAGE_KEY = "codestalk_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const { data } = await api.get<AuthUser>("/auth/me");
    setUser(data);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      setAuthToken(token);
      
      // If we have cached user data, use it immediately
      if (user) {
        setLoading(false);
        // Refresh in background
        refreshMe().catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setAuthToken(null);
        });
      } else {
        // No cached user, fetch it
        refreshMe()
          .catch(() => {
            setUser(null);
            setToken(null);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            setAuthToken(null);
          })
          .finally(() => setLoading(false));
      }
    } else {
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token, refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/register", {
        email,
        password,
        displayName,
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshMe }),
    [user, token, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
