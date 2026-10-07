"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useSession";

// One EventSource per browser tab, shared by every feature (messages, navbar
// bell, notifications page). Consumers subscribe to named events through
// context instead of opening their own connection.

const EVENT_TYPES = [
  "new_message",
  "typing",
  "contract_update",
  "schedule_update",
  "read_update",
  "notification",
  "notification_count",
] as const;

export type SSEEventType = (typeof EVENT_TYPES)[number];

type Handler = (data: unknown) => void;

interface SSEContextValue {
  subscribe: (type: SSEEventType, handler: Handler) => () => void;
}

const SSEContext = createContext<SSEContextValue | null>(null);

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const listenersRef = useRef<Map<SSEEventType, Set<Handler>>>(new Map());

  const subscribe = useCallback((type: SSEEventType, handler: Handler) => {
    let set = listenersRef.current.get(type);
    if (!set) {
      set = new Set();
      listenersRef.current.set(type, set);
    }
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;

    function connect() {
      es = new EventSource(`${apiUrl}/api/sse`, { withCredentials: true });

      es.addEventListener("connected", () => {
        retryDelay = 1000;
      });

      for (const type of EVENT_TYPES) {
        es.addEventListener(type, (e: MessageEvent) => {
          let data: unknown;
          try {
            data = JSON.parse(e.data);
          } catch {
            return; // malformed event — ignore
          }
          listenersRef.current.get(type)?.forEach((handler) => handler(data));
        });
      }

      es.onerror = () => {
        es?.close();
        es = null;
        const delay = retryDelay;
        retryDelay = Math.min(retryDelay * 2, 30000);
        retryTimeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      es?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect only when the signed-in user changes
  }, [user?.id]);

  return <SSEContext.Provider value={{ subscribe }}>{children}</SSEContext.Provider>;
}

export function useSSEContext(): SSEContextValue | null {
  return useContext(SSEContext);
}
