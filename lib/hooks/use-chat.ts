"use client";

import { useCallback, useState } from "react";
import type { Spec } from "@/lib/render/types";

export type ClarityMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content?: string;
      spec?: Spec;
      activity?: string[];
    };

export function useClarityChat() {
  const [messages, setMessages] = useState<ClarityMessage[]>([]);
  const [pending, setPending] = useState(false);

  const send = useCallback(async (text: string) => {
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: text },
      { id: assistantId, role: "assistant", activity: [] },
    ]);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      // TODO: parse SSE stream, append activity lines + spec
      const data = await res.json().catch(() => null);
      if (data?.spec) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId ? { ...msg, spec: data.spec } : msg,
          ),
        );
      } else if (data?.text) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId ? { ...msg, content: data.text } : msg,
          ),
        );
      }
    } finally {
      setPending(false);
    }
  }, [messages]);

  return { messages, setMessages, send, pending };
}
