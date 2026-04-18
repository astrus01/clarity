"use client";

import { useCallback, useRef, useState } from "react";
import { useChatStore, newExchangeId, nowTimestamp } from "@/lib/chat/store";
import type { ChatSession, PanelKind, ActivityLine } from "@/lib/chat/sessions";
import { readLocationSnapshot } from "@/lib/hooks/use-location";

type ChatEvent =
  | { type: "text"; text: string }
  | { type: "activity"; tool: string; detail: string }
  | { type: "panel"; panelKind: PanelKind; panelData: unknown }
  | { type: "done" }
  | { type: "error"; message: string };

function buildGist(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 48) return trimmed;
  return trimmed.slice(0, 46).trimEnd() + "…";
}

function toHistory(session: ChatSession | undefined) {
  if (!session) return [];
  const out: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const ex of session.exchanges) {
    out.push({ role: "user", content: ex.prompt });
    if (ex.text && ex.status === "complete") {
      out.push({ role: "assistant", content: ex.text });
    }
  }
  return out;
}

export function useClarityChat() {
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const store = useChatStore.getState();
    let sessionId = store.activeId;
    let session = store.sessions.find((s) => s.id === sessionId);

    if (!session || session.seeded) {
      sessionId = store.createSession({ title: buildGist(trimmed) });
      session = useChatStore.getState().sessions.find((s) => s.id === sessionId);
    }

    if (!session) return;

    const isFirstExchange = session.exchanges.length === 0;
    if (isFirstExchange) {
      store.updateSession(sessionId, { title: buildGist(trimmed) });
    }

    const history = toHistory(session);

    const exchangeId = newExchangeId();
    store.appendExchange(sessionId, {
      id: exchangeId,
      prompt: trimmed,
      gist: buildGist(trimmed),
      timestamp: nowTimestamp(),
      text: "",
      status: "streaming",
      activity: [],
    });

    setPending(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Accumulator mutations — keep a local snapshot so we dedupe append vs set.
    let textSoFar = "";
    const activity: ActivityLine[] = [];

    try {
      const loc = readLocationSnapshot();
      const location =
        loc.status === "granted" && loc.coords
          ? {
              label: loc.label,
              place: loc.place,
              neighborhood: loc.neighborhood,
              city: loc.city,
              region: loc.region,
              country: loc.country,
              lat: loc.coords.lat,
              lng: loc.coords.lng,
              timeZone: loc.timeZone,
            }
          : undefined;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history, location }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "Request failed");
        useChatStore.getState().updateExchange(sessionId, exchangeId, {
          status: "error",
          text: msg || "Request failed",
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const applyEvent = (event: ChatEvent) => {
        switch (event.type) {
          case "text":
            textSoFar += (textSoFar ? " " : "") + event.text;
            useChatStore.getState().updateExchange(sessionId, exchangeId, {
              text: textSoFar,
              status: "streaming",
            });
            break;
          case "activity":
            activity.push({ tool: event.tool, detail: event.detail });
            useChatStore.getState().updateExchange(sessionId, exchangeId, {
              activity: [...activity],
              status: "streaming",
            });
            break;
          case "panel":
            useChatStore.getState().updateExchange(sessionId, exchangeId, {
              panelKind: event.panelKind,
              panelData: event.panelData,
              status: "streaming",
            });
            break;
          case "error":
            useChatStore.getState().updateExchange(sessionId, exchangeId, {
              status: "error",
              text: textSoFar || event.message,
            });
            break;
          case "done":
            useChatStore.getState().updateExchange(sessionId, exchangeId, {
              status: "complete",
              text: textSoFar,
            });
            break;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const event = JSON.parse(line) as ChatEvent;
            applyEvent(event);
          } catch {
            // skip malformed line
          }
        }
      }
      // flush any final line
      const tail = buf.trim();
      if (tail) {
        try {
          applyEvent(JSON.parse(tail) as ChatEvent);
        } catch {
          // ignore
        }
      }

      // Ensure we're marked complete even if the server never emitted "done".
      const current = useChatStore
        .getState()
        .sessions.find((s) => s.id === sessionId)
        ?.exchanges.find((e) => e.id === exchangeId);
      if (current && current.status === "streaming") {
        useChatStore.getState().updateExchange(sessionId, exchangeId, {
          status: "complete",
          text: textSoFar,
        });
      }

      // Fire-and-forget title generation for the first exchange.
      if (isFirstExchange) {
        fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((payload: { title?: string } | null) => {
            const title = payload?.title?.trim();
            if (title && title.toLowerCase() !== "new chat") {
              useChatStore.getState().updateSession(sessionId, { title });
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      useChatStore.getState().updateExchange(sessionId, exchangeId, {
        status: "error",
        text: (err as Error).message ?? "Network error",
      });
    } finally {
      abortRef.current = null;
      setPending(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { send, cancel, pending };
}
