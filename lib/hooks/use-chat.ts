"use client";

import { useCallback, useRef, useState } from "react";
import { useChatStore, newExchangeId, nowTimestamp } from "@/lib/chat/store";
import type { ChatSession } from "@/lib/chat/sessions";

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

    // Snapshot store + get / create the active live session.
    const store = useChatStore.getState();
    let sessionId = store.activeId;
    let session = store.sessions.find((s) => s.id === sessionId);

    if (!session || session.seeded) {
      sessionId = store.createSession({ title: buildGist(trimmed) });
      session = useChatStore.getState().sessions.find((s) => s.id === sessionId);
    }

    if (!session) return;

    // Title-on-first-message.
    if (session.exchanges.length === 0) {
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
    });

    setPending(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
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

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        useChatStore.getState().updateExchange(sessionId, exchangeId, {
          text: buf,
          status: "streaming",
        });
      }

      useChatStore.getState().updateExchange(sessionId, exchangeId, {
        text: buf,
        status: "complete",
      });
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
