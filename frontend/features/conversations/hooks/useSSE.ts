"use client";

import { useEffect, useRef } from "react";
import { useSSEContext, type SSEEventType } from "@/components/SSEProvider";
import type { AppNotification } from "@/features/notifications/types";
import type { ConversationMessage, SerializedContract, ScheduleProposalData } from "../types";

interface SSENewMessageData {
  conversationId: string;
  message: ConversationMessage;
}

interface SSETypingData {
  conversationId: string;
  userId: string;
  name: string;
}

interface SSEContractUpdateData {
  conversationId: string;
  contract: SerializedContract;
}

interface SSEScheduleUpdateData {
  conversationId: string;
  messageId: string;
  scheduleProposal: ScheduleProposalData;
}

interface SSEReadUpdateData {
  conversationId: string;
  userId: string;
  lastReadAt: string;
}

interface SSENotificationData {
  notification: AppNotification;
  unreadCount: number;
}

interface SSENotificationCountData {
  unreadCount: number;
}

interface SSECallbacks {
  onNewMessage?: (data: SSENewMessageData) => void;
  onTyping?: (data: SSETypingData) => void;
  onContractUpdate?: (data: SSEContractUpdateData) => void;
  onScheduleUpdate?: (data: SSEScheduleUpdateData) => void;
  onReadUpdate?: (data: SSEReadUpdateData) => void;
  onNotification?: (data: SSENotificationData) => void;
  onNotificationCount?: (data: SSENotificationCountData) => void;
}

/**
 * Subscribes to server-sent events. The EventSource itself lives in
 * SSEProvider — this hook only registers callbacks on the shared connection,
 * so any number of components can use it without opening extra connections.
 */
export function useSSE(isAuthenticated: boolean, callbacks: SSECallbacks) {
  const ctx = useSSEContext();
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    if (!ctx || !isAuthenticated) return;

    const entries: Array<[SSEEventType, (data: unknown) => void]> = [
      ["new_message", (d) => callbacksRef.current.onNewMessage?.(d as SSENewMessageData)],
      ["typing", (d) => callbacksRef.current.onTyping?.(d as SSETypingData)],
      ["contract_update", (d) => callbacksRef.current.onContractUpdate?.(d as SSEContractUpdateData)],
      ["schedule_update", (d) => callbacksRef.current.onScheduleUpdate?.(d as SSEScheduleUpdateData)],
      ["read_update", (d) => callbacksRef.current.onReadUpdate?.(d as SSEReadUpdateData)],
      ["notification", (d) => callbacksRef.current.onNotification?.(d as SSENotificationData)],
      ["notification_count", (d) => callbacksRef.current.onNotificationCount?.(d as SSENotificationCountData)],
    ];

    const unsubscribes = entries.map(([type, handler]) => ctx.subscribe(type, handler));
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [ctx, isAuthenticated]);
}
