"use client";

import { useEffect, useState } from "react";
import { PanelFrame } from "@/components/chat/panel-frame";
import { Send, RotateCcw, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmailDraftData = {
  from: string;
  subject: string;
  thread?: string;
  draft: string;
};

const DEFAULT_DATA: EmailDraftData = {
  from: "Sarah Chen <sarah@example.com>",
  subject: "Re: Q3 brief — revised timeline",
  draft: `Hi Sarah,

Apologies for the delay on the Q3 brief — I know you were counting on it by Friday. I've reviewed the outstanding items and I'll have a revised version in your inbox by end of day Monday, with the three sections you flagged rewritten.

Happy to hop on a quick call in the morning if that's easier.

— T`,
};

const tones = [
  { value: "warm", label: "Warm" },
  { value: "formal", label: "Formal" },
  { value: "direct", label: "Direct" },
  { value: "apologetic", label: "Apologetic" },
];

function extractEmail(from: string): string | null {
  const bracket = from.match(/<([^>]+@[^>]+)>/);
  if (bracket?.[1]) return bracket[1].trim();
  const bare = from.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return bare?.[0] ?? null;
}

type SendState = "idle" | "opening" | "sent" | "no-address";

export function EmailDraftPanel({ data }: { data?: EmailDraftData }) {
  const d = data ?? DEFAULT_DATA;
  const [tone, setTone] = useState("warm");
  const [subject, setSubject] = useState(d.subject);
  const [body, setBody] = useState(d.draft);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<SendState>("idle");

  // Reset local edits when a new draft arrives via props (e.g. fresh panel).
  useEffect(() => {
    setSubject(d.subject);
    setBody(d.draft);
    setSendState("idle");
  }, [d.subject, d.draft]);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const recipientEmail = extractEmail(d.from);

  async function handleRegenerate() {
    if (regenerating) return;
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: d.from,
          subject,
          thread: d.thread,
          tone,
          previousDraft: body,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? `HTTP ${res.status}`);
      }
      const payload = (await res.json()) as { draft?: string };
      if (payload.draft) {
        setBody(payload.draft);
      } else {
        throw new Error("empty draft");
      }
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : "regenerate failed");
    } finally {
      setRegenerating(false);
    }
  }

  function handleSend() {
    if (!recipientEmail) {
      setSendState("no-address");
      return;
    }
    const params = new URLSearchParams({
      subject,
      body,
    });
    // URLSearchParams encodes + as space-substitute; mail clients want %20. Swap.
    const qs = params.toString().replace(/\+/g, "%20");
    const href = `mailto:${recipientEmail}?${qs}`;
    setSendState("opening");
    if (typeof window !== "undefined") {
      window.location.href = href;
    }
    // After a short beat, show "sent" feedback. Real delivery is out-of-band.
    window.setTimeout(() => setSendState("sent"), 600);
  }

  return (
    <PanelFrame
      eyebrow={`Email draft · reply to ${d.from.split("<")[0].trim()}`}
      title="Draft ready to send"
      meta={
        <div className="font-mono text-[0.7rem] text-foreground-muted">
          {wordCount} words
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-baseline text-sm">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted">
            To
          </span>
          <span className="text-foreground">{d.from}</span>

          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted">
            Subject
          </span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-transparent text-foreground focus:outline-none focus:border-primary border-b border-transparent hover:border-border transition-colors pb-0.5"
          />
        </div>

        {d.thread && (
          <div className="rounded-md border border-border/60 bg-surface/60 px-4 py-3 text-[0.85rem] text-foreground-muted leading-relaxed whitespace-pre-wrap">
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.1em] mb-1.5">
              Thread
            </div>
            {d.thread}
          </div>
        )}

        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={Math.max(9, Math.min(18, body.split("\n").length + 2))}
            disabled={regenerating}
            className={cn(
              "w-full resize-none rounded-md border border-border bg-background/40 px-4 py-3 text-foreground leading-[1.7] text-[0.95rem] focus:outline-none focus:border-primary transition-colors",
              regenerating && "opacity-60",
            )}
            style={{ fontFamily: "var(--font-sans)" }}
          />
          {regenerating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 text-sm text-foreground-muted bg-surface/90 border border-border rounded-md px-3 py-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Rewriting in {tone} tone…
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted">
            Tone
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                disabled={regenerating}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all disabled:opacity-50",
                  tone === t.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-foreground-muted hover:text-foreground hover:border-[color:var(--primary)]/60",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {regenError && (
          <div className="text-xs text-red-400 font-mono">
            Regenerate failed: {regenError}
          </div>
        )}

        {sendState === "no-address" && (
          <div className="text-xs text-amber-400 font-mono">
            No email address found in "To" field — can't open mail client.
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
          <button
            onClick={handleSend}
            disabled={regenerating || sendState === "opening"}
            className={cn(
              "inline-flex items-center gap-2 h-10 rounded-md px-5 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60",
              sendState === "sent"
                ? "bg-emerald-500/90 text-background"
                : "bg-primary text-background hover:opacity-90",
            )}
          >
            {sendState === "sent" ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Opened in mail client
              </>
            ) : sendState === "opening" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Opening…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Send draft
              </>
            )}
          </button>
        </div>
      </div>
    </PanelFrame>
  );
}
