"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession } from "@/features/auth/hooks/useSession";
import { authApi } from "@/lib/api-client";
import { useSSE } from "@/features/conversations/hooks/useSSE";
import { useCategories } from "@/features/listings/hooks/useCategories";
import { SearchResultRow } from "@/features/listings/components/SearchResultRow";
import type { ListingsResponse } from "@/features/listings/types";
import { Avatar } from "@/features/profile/components/Avatar";
import { api, apiUrl } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import {
  Search,
  Plus,
  MapIcon,
  Bell,
  Msg,
  ChevDown,
  Compass,
  Hand,
  Tools,
  Logout,
  User,
  Layers,
  ArrowSwap,
  Heart,
  Settings,
  CAT_ICONS,
} from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

// ── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({
  userName,
  userEmail,
  avatarSrc,
  onClose,
}: {
  userName: string;
  userEmail: string;
  avatarSrc: string | null;
  onClose: () => void;
}) {
  const router = useRouter();

  async function handleSignOut() {
    onClose();
    await authApi.logout();
    router.push("/login");
  }

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="absolute right-0 top-full z-[70] mt-2 w-64 animate-fadein overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
      <div className="flex items-center gap-3 border-b border-line p-3">
        <Avatar src={avatarSrc} name={userName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{userName}</div>
          <div className="truncate text-xs text-ink3">{userEmail}</div>
        </div>
      </div>
      <div className="py-1">
        {(
          [
            { l: "Your profile", ic: <User size={15} />, href: "/profile" },
            { l: "My listings", ic: <Layers size={15} />, href: "/my-listings" },
            { l: "Exchanges", ic: <ArrowSwap size={15} />, href: "/exchanges" },
            { l: "Saved", ic: <Heart size={15} />, href: "/saved" },
            { l: "Settings", ic: <Settings size={15} />, href: "/settings" },
          ] as const
        ).map((item) => (
          <button
            key={item.l}
            onClick={() => go(item.href)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink2 hover:bg-sunken hover:text-ink"
          >
            <span className="text-ink3">{item.ic}</span>
            {item.l}
          </button>
        ))}
      </div>
      <div className="border-t border-line py-1">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink2 hover:bg-sunken hover:text-ink"
        >
          <span className="text-ink3">
            <Logout size={15} />
          </span>
          Log out
        </button>
      </div>
    </div>
  );
}

// ── Icon button with badge ────────────────────────────────────────────────────

function IconBtn({
  children,
  badge,
  label,
  onClick,
}: {
  children: React.ReactNode;
  badge?: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-ink2 hover:bg-sunken hover:text-ink"
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-surface">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Category bar ─────────────────────────────────────────────────────────────

function CategoryBar() {
  const router = useRouter();
  const { categories } = useCategories();

  return (
    <div className="border-t border-line bg-surface">
      <div className="scroll-x w-full px-4 md:px-6 lg:px-8">
        <div className="flex min-w-max items-center gap-1 py-2">
          <button
            onClick={() => router.push("/listings")}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink"
          >
            <Compass size={14} /> Browse all
          </button>
          <button
            onClick={() => router.push("/listings?type=SKILL_OFFER")}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink"
          >
            <Hand size={14} /> Skills
          </button>
          <button
            onClick={() => router.push("/listings?type=TOOL_LISTING")}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink"
          >
            <Tools size={14} /> Tools
          </button>

          {categories.length > 0 && (
            <>
              <div className="mx-1 h-5 w-px bg-line" />
              {categories.map((cat) => {
                const icon = cat.icon?.toLowerCase() ?? "";
                const Ic = CAT_ICONS[icon] ?? Compass;
                return (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/listings?categoryId=${cat.id}`)}
                    className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink"
                  >
                    <Ic size={14} /> {cat.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Navbar search (isolated so useSearchParams is safe inside Suspense) ───────

function NavSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isListings = pathname === "/listings";
  const qFromUrl = isListings ? (searchParams.get("q") ?? "") : "";

  const [search, setSearch] = useState(qFromUrl);
  const [results, setResults] = useState<ListingsResponse["items"]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedSearch = useDebounce(search, 280);

  // Keep input in sync with URL when on the listings page
  useEffect(() => {
    setSearch(qFromUrl);
  }, [qFromUrl]);

  // Auto-fetch popup results after debounce
  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      abortRef.current?.abort();
      setResults([]);
      setTotal(0);
      setOpen(false);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    api
      .get(`api/listings?q=${encodeURIComponent(debouncedSearch.trim())}&limit=5`, {
        signal: abortRef.current.signal,
      })
      .json<ListingsResponse>()
      .then((d) => {
        setResults(d.items);
        setTotal(d.pagination.total);
        setOpen(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  // Close on outside click
  useEffect(() => {
    const off = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, []);

  // Close on Escape
  useEffect(() => {
    const off = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", off);
    return () => document.removeEventListener("keydown", off);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (isListings) {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");
      params.delete("page");
      router.push(`/listings?${params.toString()}`);
    } else {
      const q = search.trim();
      router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
    }
  }

  const showPopup = open && (loading || results.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3">
            <Search size={16} />
          </span>
          <input
            className={cx(
              "h-10 w-full border border-line2 bg-surface text-sm text-ink placeholder-ink3",
              "pl-9 pr-3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200",
              showPopup
                ? "rounded-t-lg rounded-b-none border-b-transparent ring-2 ring-brand-200 ring-b-0"
                : "rounded-lg"
            )}
            placeholder="Search skills, tools, neighbours…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
          />
          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-ink3 md:inline">
            <kbd className="rounded border border-line px-1 font-mono text-[10px] text-ink3">
              ⌘K
            </kbd>
          </span>
        </div>
      </form>

      {showPopup && (
        <div className="absolute left-0 right-0 top-full z-[1200] overflow-hidden rounded-b-xl border border-t-0 border-brand-400 bg-surface shadow-pop">
          {loading && results.length === 0 ? (
            <div className="space-y-px p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-lg bg-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-sunken" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-sunken" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="divide-y divide-line">
                {results.map((r) => (
                  <SearchResultRow key={r.id} listing={r} onSelect={() => setOpen(false)} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  const q = search.trim();
                  if (isListings) {
                    const params = new URLSearchParams(searchParams.toString());
                    if (q) params.set("q", q);
                    else params.delete("q");
                    params.delete("page");
                    router.push(`/listings?${params.toString()}`);
                  } else {
                    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
                  }
                }}
                className="flex w-full items-center justify-center gap-1 border-t border-line px-3 py-2.5 text-xs font-medium text-brand-600 hover:bg-sunken"
              >
                See all {total} result{total !== 1 ? "s" : ""} →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Top nav ───────────────────────────────────────────────────────────────────

export function AppNav({ hideCategoryBar = false }: { hideCategoryBar?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useSession();
  const [menu, setMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setUnreadCount(0);
      return;
    }
    api
      .get("api/profile/me")
      .json<{ profile: { avatarUrl: string | null } }>()
      .then((d) => setAvatarUrl(d.profile.avatarUrl ?? null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-fetch only when user id changes, not on every user object update
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () =>
      api
        .get("api/conversations/unread")
        .json<{ total: number }>()
        .then((d) => setUnreadCount(d.total))
        .catch(() => {});
    fetchUnread();
    const timer = setInterval(fetchUnread, 60000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: Event) => {
      setUnreadCount((e as CustomEvent<{ total: number }>).detail.total);
    };
    window.addEventListener("unread-count", handler);
    return () => window.removeEventListener("unread-count", handler);
  }, []);

  // Keep the navbar avatar in sync when the user changes their photo (no refresh needed).
  useEffect(() => {
    const handler = (e: Event) => {
      setAvatarUrl((e as CustomEvent<{ avatarUrl: string | null }>).detail?.avatarUrl ?? null);
    };
    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  // Bell badge: fetch on sign-in, poll as a fallback, live-update over SSE.
  useEffect(() => {
    if (!user) {
      setNotifCount(0);
      return;
    }
    const fetchNotifCount = () =>
      api
        .get("api/notifications/unread-count")
        .json<{ unreadCount: number }>()
        .then((d) => setNotifCount(d.unreadCount))
        .catch(() => {});
    fetchNotifCount();
    const timer = setInterval(fetchNotifCount, 60000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Both notification events carry the authoritative unread count, so the
  // badge is set directly — no refetch, and a conversation the user has open
  // clears itself when the server marks its notifications read.
  useSSE(!!user, {
    onNotification: ({ unreadCount }) => {
      if (typeof unreadCount === "number") setNotifCount(unreadCount);
    },
    onNotificationCount: ({ unreadCount }) => setNotifCount(unreadCount),
    // Keep the messages badge as live as the bell. Slightly delayed so that
    // when the conversation is open, its immediate mark-as-read wins and the
    // badge doesn't flash.
    onNewMessage: () => {
      setTimeout(() => {
        api
          .get("api/conversations/unread")
          .json<{ total: number }>()
          .then((d) => setUnreadCount(d.total))
          .catch(() => {});
      }, 600);
    },
  });

  // The notifications page broadcasts the new total after mark-read actions.
  useEffect(() => {
    const handler = (e: Event) => {
      setNotifCount((e as CustomEvent<{ total: number }>).detail.total);
    };
    window.addEventListener("notification-unread-count", handler);
    return () => window.removeEventListener("notification-unread-count", handler);
  }, []);

  useEffect(() => {
    const off = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, []);

  const avatarSrc = avatarUrl ? `${apiUrl}${avatarUrl}` : null;

  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-surface/85 backdrop-blur">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:gap-5 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex flex-shrink-0 items-center no-underline">
          <BrandLogo />
        </Link>

        {/* Search */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={
            <div className="h-10 w-full rounded-lg border border-line2 bg-surface" />
          }>
            <NavSearchBar />
          </Suspense>
        </div>

        {/* Right cluster */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => router.push("/listings?view=map")}
            className="hidden h-9 items-center gap-1.5 rounded-md px-3 text-sm text-ink2 hover:bg-sunken hover:text-ink md:inline-flex"
          >
            <MapIcon size={16} /> Map
          </button>

          {!isLoading && user && (
            <button
              onClick={() => router.push("/listings/new")}
              className="hidden h-8 items-center gap-1.5 rounded-md bg-ink px-3 text-xs font-medium text-surface transition-colors hover:opacity-90 md:inline-flex"
            >
              <Plus size={14} /> Post
            </button>
          )}

          {!isLoading &&
            (user ? (
              <>
                <IconBtn
                  label="Messages"
                  badge={unreadCount}
                  onClick={() => router.push("/messages")}
                >
                  <Msg size={18} />
                </IconBtn>
                <IconBtn
                  label="Notifications"
                  badge={notifCount}
                  onClick={() => router.push("/notifications")}
                >
                  <Bell size={18} />
                </IconBtn>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenu((v) => !v)}
                    className="ml-1 flex h-9 items-center gap-2 rounded-full pl-1 pr-2 hover:bg-sunken"
                  >
                    <Avatar src={avatarSrc} name={user.name} size="sm" />
                    <ChevDown size={14} className="text-ink3" />
                  </button>
                  {menu && (
                    <UserMenu
                      userName={user.name}
                      userEmail={user.email}
                      avatarSrc={avatarSrc}
                      onClose={() => setMenu(false)}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-ink2 no-underline transition-colors hover:bg-sunken hover:text-ink"
                >
                  Log in
                </Link>
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent(pathname)}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white no-underline shadow-sm transition-colors hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            ))}
        </nav>
      </div>

      {!hideCategoryBar && <CategoryBar />}
    </header>
  );
}
