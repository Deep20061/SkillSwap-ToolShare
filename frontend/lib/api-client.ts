// Thin fetch-based auth API client for the C#/.NET cookie-based JWT backend.
//
// Auth model:
// - access_token / refresh_token are httpOnly cookies the browser manages
//   automatically — JS can NEVER read or write them. We only ever send
//   `credentials: "include"` so they ride along on every request.
// - A readable (non-httpOnly) `csrf_token` cookie is mirrored into the
//   `X-CSRF-Token` header on every state-changing request (see csrfHeaders).
// - On a 401 from an authenticated request we transparently attempt a single
//   token refresh and retry once (see fetchWithRefresh).

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Errors ─────────────────────────────────────────────────────────────────

/** Thrown for any non-2xx response. `status` lets callers branch on 401/403/etc. */
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ── CSRF ─────────────────────────────────────────────────────────────────────

/** Reads the value of the non-httpOnly `csrf_token` cookie, or null. */
export function readCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="));
  if (!match) return null;
  return decodeURIComponent(match.slice("csrf_token=".length));
}

/**
 * Returns the CSRF header for state-changing requests. Safe to attach
 * whenever the cookie is present — pre-auth endpoints simply ignore it.
 */
function csrfHeaders(): Record<string, string> {
  const token = readCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}

// ── Core fetch with 401 → refresh → retry ─────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** When true, a 401 triggers one refresh+retry. Off for pre-auth calls. */
  retryOnUnauthorized?: boolean;
  signal?: AbortSignal;
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Attempts to rotate the auth cookies via POST /api/auth/refresh.
 * De-dupes concurrent callers so a burst of 401s triggers a single refresh.
 * Returns true if refresh succeeded.
 */
async function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { ...csrfHeaders() },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function doFetch(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  const isStateChanging =
    opts.method != null && opts.method.toUpperCase() !== "GET";
  if (isStateChanging) Object.assign(headers, csrfHeaders());

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  return fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    credentials: "include",
    headers,
    body,
    signal: opts.signal,
  });
}

/**
 * Fetch wrapper that, on a 401 from an authenticated request, attempts a
 * single refresh and retries the original request once. Throws ApiError on
 * any non-2xx (after the retry).
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await doFetch(path, opts);

  if (res.status === 401 && opts.retryOnUnauthorized) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await doFetch(path, opts);
    }
  }

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.clone().json();
    } catch {
      parsed = await res.clone().text().catch(() => undefined);
    }
    // The legacy backend returned `{ error }`; the C# backend returns RFC-7807 ProblemDetails
    // (`{ title, detail }`). Accept all three so server messages aren't lost to the generic fallback.
    const pickMessage = (key: string): string | undefined =>
      parsed && typeof parsed === "object" && key in parsed
        ? String((parsed as Record<string, unknown>)[key])
        : undefined;
    const message =
      pickMessage("error") ??
      pickMessage("detail") ??
      pickMessage("title") ??
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined as T;
  return (await res.json()) as T;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  emailConfirmed: boolean;
}

export interface LoginResponse {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  register(input: { name: string; email: string; password: string }) {
    return request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: input,
    });
  },

  login(input: { email: string; password: string }) {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: input,
    });
  },

  logout() {
    // CSRF-protected; csrfHeaders() attaches the token automatically.
    return request<void>("/api/auth/logout", { method: "POST" });
  },

  // Change the signed-in user's password. Returns { error } (shaped like the old auth client)
  // so callers can branch without try/catch; the server verifies the current password.
  async changePassword(
    input: { currentPassword: string; newPassword: string },
  ): Promise<{ error?: { message: string } }> {
    try {
      await request<void>("/api/auth/change-password", { method: "POST", body: input });
      return {};
    } catch (err) {
      return { error: { message: err instanceof ApiError ? err.message : "Could not change password" } };
    }
  },

  refresh() {
    return refreshTokens();
  },

  // Cookie-authed — retry on 401 so a stale access token is transparently refreshed.
  getMe() {
    return request<MeResponse>("/api/users/me", {
      method: "GET",
      retryOnUnauthorized: true,
    });
  },

  verifyEmail(input: { email: string; code: string }) {
    return request<void>("/api/auth/verify-email", {
      method: "POST",
      body: input,
    });
  },

  resendVerification(input: { email: string }) {
    return request<void>("/api/auth/resend-verification", {
      method: "POST",
      body: input,
    });
  },

  forgotPassword(input: { email: string }) {
    return request<void>("/api/auth/forgot-password", {
      method: "POST",
      body: input,
    });
  },

  resetPassword(input: { email: string; code: string; newPassword: string }) {
    return request<void>("/api/auth/reset-password", {
      method: "POST",
      body: input,
    });
  },

  requestMagicLink(input: { email: string }) {
    return request<void>("/api/auth/magic-link", {
      method: "POST",
      body: input,
    });
  },

  verifyMagicLink(input: { code: string }) {
    return request<void>("/api/auth/magic-link/verify", {
      method: "POST",
      body: input,
    });
  },
};
