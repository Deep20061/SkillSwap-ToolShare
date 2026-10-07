"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useSession";
import { useSSE } from "@/features/conversations/hooks/useSSE";
import type { AppNotification, NotificationsResponse } from "../types";

/** Keeps the navbar badge in sync when notifications are read on the page. */
export function broadcastUnreadCount(total: number) {
  window.dispatchEvent(
    new CustomEvent("notification-unread-count", { detail: { total } }),
  );
}

export function useNotifications() {
  const { user } = useSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    api
      .get("api/notifications")
      .json<NotificationsResponse>()
      .then((d) => {
        setNotifications(d.notifications);
        setNextCursor(d.nextCursor);
        setUnreadCount(d.unreadCount);
        broadcastUnreadCount(d.unreadCount);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-fetch only when user id changes
  }, [user?.id]);

  // Live updates: a NEW_MESSAGE notification may be a bumped existing row
  // (deduped per conversation), so replace by id before prepending. The event
  // carries the authoritative unread count.
  useSSE(!!user, {
    onNotification: useCallback(
      ({ notification, unreadCount: count }: { notification: AppNotification; unreadCount: number }) => {
        setNotifications((prev) => [
          notification,
          ...prev.filter((n) => n.id !== notification.id),
        ]);
        if (typeof count === "number") setUnreadCount(count);
      },
      [],
    ),
    onNotificationCount: useCallback(({ unreadCount: count }: { unreadCount: number }) => {
      setUnreadCount(count);
      // Reflect read-state on already-loaded rows when another tab/the open
      // conversation cleared them server-side.
      if (count === 0) {
        const now = new Date().toISOString();
        setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
      }
    }, []),
  });

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const d = await api
        .get(`api/notifications?cursor=${encodeURIComponent(nextCursor)}`)
        .json<NotificationsResponse>();
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...d.notifications.filter((n) => !seen.has(n.id))];
      });
      setNextCursor(d.nextCursor);
    } catch {
      // keep current page on failure
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    try {
      const d = await api.patch(`api/notifications/${id}/read`).json<{ unreadCount: number }>();
      setUnreadCount(d.unreadCount);
      broadcastUnreadCount(d.unreadCount);
    } catch {
      // optimistic update stays — worst case the badge corrects on next poll
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    setUnreadCount(0);
    broadcastUnreadCount(0);
    try {
      await api.patch("api/notifications/read-all");
    } catch {
      // ignore — see markRead
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore: nextCursor !== null,
    loadMore,
    markRead,
    markAllRead,
  };
}
