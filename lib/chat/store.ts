"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_SESSIONS, type ChatSession, type Exchange } from "./sessions";

type ChatStore = {
  sessions: ChatSession[];
  activeId: string;

  setActive: (id: string) => void;
  createSession: (opts?: { title?: string; subtitle?: string }) => string;

  appendExchange: (sessionId: string, exchange: Exchange) => void;
  updateExchange: (
    sessionId: string,
    exchangeId: string,
    patch: Partial<Exchange>,
  ) => void;
  updateSession: (sessionId: string, patch: Partial<Omit<ChatSession, "id">>) => void;
};

function nowLabel(): { timestamp: string; subtitle: string } {
  const d = new Date();
  const timestamp = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return { timestamp, subtitle: `Today · ${timestamp}` };
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: SEED_SESSIONS,
      activeId: SEED_SESSIONS[0].id,

      setActive: (id) => set({ activeId: id }),

      createSession: (opts) => {
        const id = `live-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const { subtitle } = nowLabel();
        const session: ChatSession = {
          id,
          title: opts?.title ?? "New chat",
          subtitle: opts?.subtitle ?? subtitle,
          exchanges: [],
          seeded: false,
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeId: id,
        }));
        return id;
      },

      appendExchange: (sessionId, exchange) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, exchanges: [...s.exchanges, exchange] }
              : s,
          ),
        })),

      updateExchange: (sessionId, exchangeId, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  exchanges: s.exchanges.map((ex) =>
                    ex.id === exchangeId ? { ...ex, ...patch } : ex,
                  ),
                }
              : s,
          ),
        })),

      updateSession: (sessionId, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, ...patch } : s,
          ),
        })),
    }),
    {
      name: "clarity-chat",
      storage: createJSONStorage(() => localStorage),
      // Only persist live (runtime-created) sessions. Seeds are re-injected on hydrate.
      partialize: (state) => ({
        sessions: state.sessions.filter((s) => !s.seeded),
        activeId: state.activeId,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<ChatStore> | undefined) ?? {};
        const liveSessions = (p.sessions ?? []).filter((s) => !s.seeded);
        const sessions = [...liveSessions, ...SEED_SESSIONS];
        const activeId =
          p.activeId && sessions.some((s) => s.id === p.activeId)
            ? p.activeId
            : current.activeId;
        return { ...current, sessions, activeId };
      },
    },
  ),
);

export function newExchangeId(): string {
  return `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nowTimestamp(): string {
  return nowLabel().timestamp;
}
