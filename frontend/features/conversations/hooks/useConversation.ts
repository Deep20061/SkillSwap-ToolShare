"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { ConversationMessage } from "../types";

export function useConversation(conversationId: string | null) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(
    (cursor?: string) => {
      if (!conversationId) return;
      setIsLoading(true);
      const searchParams = new URLSearchParams({ limit: "30" });
      if (cursor) searchParams.set("lastMessageId", cursor);
      api
        .get(`api/conversations/${conversationId}/messages?${searchParams}`)
        .json<{ messages: ConversationMessage[]; lastMessageId: string | null }>()
        .then((d) => {
          setMessages((prev) =>
            cursor ? [...d.messages, ...prev] : d.messages,
          );
          setLastMessageId(d.lastMessageId);
          setHasMore(!!d.lastMessageId);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    },
    [conversationId],
  );

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setLastMessageId(null);
    setHasMore(false);
    load();

    api.patch(`api/conversations/${conversationId}/read`).catch(() => {});
  }, [conversationId, load]);

  function appendMessage(msg: ConversationMessage) {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function updateMessage(messageId: string, updates: Partial<ConversationMessage>) {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
    );
  }

  async function send(content: string, file?: File): Promise<ConversationMessage | null> {
    if (!conversationId) return null;
    if (!content.trim() && !file) return null;

    setIsSending(true);
    try {
      let msg: ConversationMessage;
      if (file) {
        const formData = new FormData();
        if (content.trim()) formData.append("content", content.trim());
        formData.append("file", file);
        msg = await api
          .post(`api/conversations/${conversationId}/messages`, { body: formData })
          .json<ConversationMessage>();
      } else {
        msg = await api
          .post(`api/conversations/${conversationId}/messages`, {
            json: { content: content.trim() },
          })
          .json<ConversationMessage>();
      }
      appendMessage(msg);
      return msg;
    } finally {
      setIsSending(false);
    }
  }

  function sendTyping() {
    if (!conversationId) return;
    api.post(`api/conversations/${conversationId}/typing`).catch(() => {});
  }

  function loadMore() {
    if (lastMessageId) load(lastMessageId);
  }

  return {
    messages,
    isLoading,
    isSending,
    hasMore,
    bottomRef,
    send,
    sendTyping,
    appendMessage,
    updateMessage,
    loadMore,
  };
}
