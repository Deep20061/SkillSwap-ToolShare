import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session-presence signal for the cookie-based JWT backend. The csrf_token cookie is set on login
// and cleared on logout, lives the refresh-token lifetime, and is scoped to Path "/" — so it's the
// one auth cookie reliably present on page-route requests (access_token/refresh_token are scoped to
// /api and never reach page navigations). Presence only — validity is enforced server-side.
const SESSION_COOKIE_NAME = "csrf_token";

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
// /profile (own profile) is protected; /profile/[id] (public profiles) is not
const PROTECTED_ROUTES = [
  "/settings",
  "/my-listings",
  "/profile/edit",
  "/listings/new",
  "/exchanges",
  "/saved",
  "/messages",
  "/notifications",
];

function isProtectedProfile(pathname: string): boolean {
  // Exactly "/profile" or "/profile/" — own profile page, requires auth
  return pathname === "/profile" || pathname === "/profile/";
}

function hasSessionCookie(request: NextRequest): boolean {
  return !!request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Next.js middleware — runs on the edge before every matched request.
 *
 * Two rules:
 * 1. Authenticated users hitting auth pages (/login, /register, etc.)
 *    are redirected to /.
 * 2. Unauthenticated users hitting protected pages (//*)
 *    are redirected to /login with a callbackUrl query param.
 *
 * This is a UX guard only — it checks for the presence of the session
 * cookie, not its validity. Real security is enforced server-side by
 * requireSession middleware on the backend.
 *
 * Keep SESSION_COOKIE_NAME in sync with the backend auth config.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Logged-in user hitting an auth page — send them to callbackUrl or home
  if (isAuthenticated && isAuthPage) {
    const cb = request.nextUrl.searchParams.get("callbackUrl");
    const dest = cb && cb.startsWith("/") && !cb.startsWith("//") ? cb : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Unauthenticated user hitting a protected page — send them to login
  const isProtected =
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) || isProtectedProfile(pathname);
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
