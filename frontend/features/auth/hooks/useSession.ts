"use client";

import { useAuth } from "../AuthProvider";

/**
 * Returns the current authenticated user and session state.
 *
 * Session state is derived from GET /api/users/me via the AuthProvider context
 * (cookie-based JWT backend). Prefer this over importing the auth client
 * directly in components. For login/logout actions, use `useAuth()` directly.
 *
 * Returns:
 * - user            — the authenticated user, or null if not signed in
 * - isLoading       — true while the initial session check is in flight
 * - isAuthenticated — true if a user is present
 * - error           — any non-401 session fetch error
 */
export function useSession() {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  return { user, isLoading, isAuthenticated, error };
}
