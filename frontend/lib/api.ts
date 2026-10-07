import ky, { HTTPError } from "ky";
import { readCsrfToken, authApi } from "@/lib/api-client";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Extracts a human-readable error message from a failed request. The backend returns
 * `{ error }` (or RFC-7807 `{ title, detail }`) on errors; this pulls the most specific
 * one so callers can show the real reason (e.g. "Image exceeds the 10 MB size limit.")
 * instead of ky's generic "Request failed with status code 400". Falls back to the
 * provided message when no server text is available.
 */
export async function apiErrorMessage(err: unknown, fallback: string): Promise<string> {
  if (err instanceof HTTPError) {
    try {
      const body = await err.response.clone().json();
      if (body && typeof body === "object") {
        const o = body as Record<string, unknown>;
        for (const key of ["error", "detail", "title", "message"]) {
          const v = o[key];
          if (typeof v === "string" && v.trim()) return v;
        }
      }
    } catch {
      /* non-JSON / empty body — fall through to the fallback */
    }
  }
  return fallback;
}

// Avoids importing next/navigation here (this module is used in non-component
// code too). On a definitive auth failure we hard-redirect to /login.
function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  const callback = encodeURIComponent(
    window.location.pathname + window.location.search
  );
  window.location.assign(`/login?callbackUrl=${callback}`);
}

/**
 * Pre-configured ky HTTP client for backend API calls against the cookie-based
 * JWT backend.
 *
 * - prefixUrl points to NEXT_PUBLIC_API_URL so all calls use relative paths.
 * - credentials: "include" sends the httpOnly auth cookies automatically.
 * - beforeRequest attaches the X-CSRF-Token header (read from the readable
 *   csrf_token cookie) on every state-changing request.
 * - afterResponse implements 401 → refresh → retry-once: on a 401 it calls
 *   POST /api/auth/refresh; if that succeeds it replays the original request,
 *   otherwise it clears client auth and redirects to /login.
 * - retry: still retries 429 responses transparently.
 */
export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  retry: {
    limit: 2,
    statusCodes: [429],
    backoffLimit: 3000,
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const method = request.method.toUpperCase();
        if (method !== "GET" && method !== "HEAD") {
          const token = readCsrfToken();
          if (token) request.headers.set("X-CSRF-Token", token);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // 401 → attempt a single refresh, then replay the original request.
        // The `context.retried` flag prevents an infinite loop if the replayed
        // request also 401s. ky re-runs hooks on the retried call, so we read
        // and set the flag on the shared `options.context` object.
        const ctx = (options.context ?? {}) as { retried?: boolean };
        if (response.status === 401 && !ctx.retried) {
          const refreshed = await authApi.refresh();
          if (refreshed) {
            // Re-issue the original request; the beforeRequest hook re-attaches
            // a fresh CSRF token. The `retried` context flag and retry:0 prevent
            // an infinite loop if the replayed request also 401s.
            return ky(request, { retry: 0, context: { retried: true } });
          }
          // Refresh failed. Only bounce to login if there was actually a session
          // to lose — an anonymous visitor whose page fires an optional authed
          // call (e.g. /api/geocode on public browse) must stay put, not get
          // redirected off a public page.
          if (readCsrfToken()) redirectToLogin();
        }

        if (!response.ok && process.env.NODE_ENV === "development") {
          let body: unknown;
          try {
            body = await response.clone().json();
          } catch {
            body = await response.clone().text();
          }
          console.error(`[api] ${response.status} ${response.url}`, body);
        }
        return response;
      },
    ],
    beforeError: [
      (error: HTTPError) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[api] request error:", error.message);
        }
        return error;
      },
    ],
  },
});
