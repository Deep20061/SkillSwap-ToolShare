"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Conversation } from "../types";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    api
      .get("api/conversations")
      .json<{ conversations: Conversation[] }>()
      .then((d) => setConversations(d.conversations))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function updateLastMessage(
    conversationId: string,
    message: Conversation["lastMessage"],
  ) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, updatedAt: message?.createdAt ?? c.updatedAt }
          : c,
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    );
  }

  function updateContractStatus(
    conversationId: string,
    contractStatus: Conversation["contractStatus"],
  ) {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, contractStatus } : c)),
    );
  }

  function incrementUnread(conversationId: string) {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
      );
      const total = updated.reduce((s, c) => s + c.unreadCount, 0);
      setTimeout(() => window.dispatchEvent(new CustomEvent("unread-count", { detail: { total } })), 0);
      return updated;
    });
  }

  function clearUnread(conversationId: string) {
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      );
      const total = updated.reduce((s, c) => s + c.unreadCount, 0);
      setTimeout(() => window.dispatchEvent(new CustomEvent("unread-count", { detail: { total } })), 0);
      return updated;
    });
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return {
    conversations,
    isLoading,
    refresh,
    totalUnread,
    updateLastMessage,
    updateContractStatus,
    incrementUnread,
    clearUnread,
  };
}
