"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_SESSIONS, type ChatSession, type Exchange } from "./sessions";

type ChatStore = {
  sessions: ChatSession[];
  activeId: string;
  hiddenSeedIds: string[];

  setActive: (id: string) => void;
  createSession: (opts?: { title?: string; subtitle?: string }) => string;
  deleteSession: (id: string) => void;

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

function pickActiveFallback(sessions: ChatSession[], currentActiveId: string) {
  if (sessions.some((s) => s.id === currentActiveId)) return currentActiveId;
  return sessions[0]?.id ?? "";
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: SEED_SESSIONS,
      activeId: SEED_SESSIONS[0].id,
      hiddenSeedIds: [],

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

      deleteSession: (id) =>
        set((state) => {
          const target = state.sessions.find((s) => s.id === id);
          if (!target) return state;
          const sessions = state.sessions.filter((s) => s.id !== id);
          // Need at least one session so the app has something to render.
          if (sessions.length === 0) {
            const fresh: ChatSession = {
              id: `live-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              title: "New chat",
              subtitle: nowLabel().subtitle,
              exchanges: [],
              seeded: false,
            };
            sessions.push(fresh);
          }
          return {
            sessions,
            activeId: pickActiveFallback(sessions, state.activeId),
            hiddenSeedIds: target.seeded
              ? Array.from(new Set([...state.hiddenSeedIds, id]))
              : state.hiddenSeedIds,
          };
        }),

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
      // Only persist live (runtime-created) sessions + which seeds the user deleted.
      partialize: (state) => ({
        sessions: state.sessions.filter((s) => !s.seeded),
        activeId: state.activeId,
        hiddenSeedIds: state.hiddenSeedIds,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<ChatStore> | undefined) ?? {};
        const hidden = new Set(p.hiddenSeedIds ?? []);
        const liveSessions = (p.sessions ?? []).filter((s) => !s.seeded);
        const seeds = SEED_SESSIONS.filter((s) => !hidden.has(s.id));
        const sessions = [...liveSessions, ...seeds];
        const activeId =
          p.activeId && sessions.some((s) => s.id === p.activeId)
            ? p.activeId
            : sessions[0]?.id ?? current.activeId;
        return {
          ...current,
          sessions,
          activeId,
          hiddenSeedIds: Array.from(hidden),
        };
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
