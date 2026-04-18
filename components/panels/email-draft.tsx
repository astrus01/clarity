"use client";

import { useState } from "react";
import { PanelFrame } from "@/components/chat/panel-frame";
import { Send, RotateCcw } from "lucide-react";
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

export function EmailDraftPanel({ data }: { data?: EmailDraftData }) {
  const d = data ?? DEFAULT_DATA;
  const [tone, setTone] = useState("warm");
  const [subject, setSubject] = useState(d.subject);
  const [body, setBody] = useState(d.draft);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

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

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={Math.max(9, Math.min(18, body.split("\n").length + 2))}
          className="w-full resize-none rounded-md border border-border bg-background/40 px-4 py-3 text-foreground leading-[1.7] text-[0.95rem] focus:outline-none focus:border-primary transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted">
            Tone
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
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

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate
          </button>
          <button className="inline-flex items-center gap-2 h-10 rounded-md bg-primary text-background px-5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all">
            <Send className="h-3.5 w-3.5" />
            Send draft
          </button>
        </div>
      </div>
    </PanelFrame>
  );
}
