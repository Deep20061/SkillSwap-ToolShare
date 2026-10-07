"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, ApiError, readCsrfToken, type MeResponse } from "@/lib/api-client";

/**
 * The session user shape consumed across the app. Derived from the backend's
 * GET /api/users/me ({ id, email, name, emailConfirmed }). `emailVerified` is
 * kept as an alias of `emailConfirmed` so existing call sites keep working.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  emailConfirmed: boolean;
  emailVerified: boolean;
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  /** Logs in via the cookie backend, then refreshes session state. */
  login: (email: string, password: string) => Promise<void>;
  /** Logs out (CSRF-protected) and clears client session state. */
  logout: () => Promise<void>;
  /** Re-fetches GET /api/users/me — call after any flow that signs the user in. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toSessionUser(me: MeResponse): SessionUser {
  return {
    id: me.id,
    email: me.email,
    name: me.name,
    emailConfirmed: me.emailConfirmed,
    emailVerified: me.emailConfirmed,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    // The non-httpOnly `csrf_token` cookie is written and cleared in lockstep with the
    // httpOnly access/refresh cookies, so its absence means there's no session at all.
    // Skip the /users/me probe in that case — otherwise an anonymous visitor fires a
    // guaranteed 401 that cascades into a guaranteed 401 on /auth/refresh, on every load.
    if (!readCsrfToken()) {
      setUser(null);
      setError(null);
      return;
    }
    try {
      const me = await authApi.getMe();
      setUser(toSessionUser(me));
      setError(null);
    } catch (err) {
      // 401 (not authed) is expected for anonymous visitors — not an error.
      if (!(err instanceof ApiError) || err.status !== 401) {
        setError(err instanceof Error ? err : new Error("Session check failed"));
      }
      setUser(null);
    }
  }, []);

  // Resolve the session once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      await refresh();
      if (active) setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await authApi.login({ email, password });
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, error, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
