"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { PageHeader } from "@/components/ui/PageHeader";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  NotificationRow,
  notificationKind,
} from "@/features/notifications/components/NotificationRow";
import type { AppNotification } from "@/features/notifications/types";
import { cx } from "@/lib/utils";

const TABS = [
  { v: "all", l: "All" },
  { v: "unread", l: "Unread" },
  { v: "message", l: "Messages" },
  { v: "contract", l: "Contracts" },
  { v: "review", l: "Reviews" },
] as const;

type TabValue = (typeof TABS)[number]["v"];

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();
  const [tab, setTab] = useState<TabValue>("all");

  // Opening the inbox marks everything read (clears the bell badge) — once, after the first load.
  // Rows stay visible; they just lose the unread dot, so you don't have to click each one.
  const autoCleared = useRef(false);
  useEffect(() => {
    if (!isLoading && !autoCleared.current) {
      autoCleared.current = true;
      if (unreadCount > 0) markAllRead();
    }
  }, [isLoading, unreadCount, markAllRead]);

  const filtered = notifications.filter(
    (n) =>
      tab === "all" ||
      (tab === "unread" && !n.readAt) ||
      notificationKind(n.type) === tab,
  );

  function handleOpen(notification: AppNotification) {
    if (!notification.readAt) markRead(notification.id);
    if (notification.link) router.push(notification.link);
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[900px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PageHeader kicker="Inbox" title="Notifications">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
            >
              Mark all as read
            </button>
          )}
        </PageHeader>

        <div className="mb-4 flex items-center gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={cx(
                "-mb-px flex h-10 items-center gap-1.5 border-b-2 px-3 text-sm font-medium",
                tab === t.v
                  ? "border-ink text-ink"
                  : "border-transparent text-ink2 hover:text-ink",
              )}
            >
              {t.l}
              {t.v === "unread" && unreadCount > 0 && (
                <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-700">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {isLoading ? (
            <div className="space-y-px p-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-sunken" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-sunken" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-ink3">All caught up.</div>
          ) : (
            filtered.map((n) => (
              <NotificationRow key={n.id} notification={n} onOpen={handleOpen} />
            ))
          )}
        </div>

        {hasMore && !isLoading && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex h-9 items-center rounded-lg border border-line2 px-4 text-sm font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink disabled:opacity-60"
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}
