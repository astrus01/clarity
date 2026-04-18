"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { cn } from "@/lib/utils";

export type InboxThread = {
  id?: string;
  from: string;
  subject: string;
  snippet?: string;
  receivedAt?: string;
  urgency?: "low" | "medium" | "high";
};

export type InboxData = {
  eyebrow?: string;
  title?: string;
  threads: InboxThread[];
  accountLabel?: string;
};

const DEFAULT_DATA: InboxData = {
  eyebrow: "Inbox · 4 recent threads",
  title: "Your mail, ranked by urgency",
  threads: [
    {
      from: "Sarah Chen <sarah@acme.co>",
      subject: "Q3 product brief — need your eyes today",
      snippet:
        "Pulled the deck together and would love your read before the 11am sync.",
      receivedAt: "Today · 8:12 AM",
      urgency: "high",
    },
    {
      from: "GitHub",
      subject: "[astrus01/clarity] CI failed on main",
      snippet: "The workflow 'Test & Lint' failed on commit 78fcf8c.",
      receivedAt: "Today · 7:44 AM",
      urgency: "medium",
    },
    {
      from: "Danny Park",
      subject: "Coffee next week?",
      snippet: "Would love to catch up if you have a window…",
      receivedAt: "Yesterday · 4:21 PM",
      urgency: "low",
    },
    {
      from: "Amex",
      subject: "Statement available",
      snippet: "Your April statement is ready to view.",
      receivedAt: "Yesterday · 10:02 AM",
      urgency: "low",
    },
  ],
};

function initial(from: string): string {
  const match = from.match(/^([A-Za-z])/);
  return (match?.[1] ?? "?").toUpperCase();
}

function displayName(from: string): string {
  const bracket = from.indexOf("<");
  if (bracket > 0) return from.slice(0, bracket).trim();
  return from;
}

const URGENCY_CHROME: Record<
  NonNullable<InboxThread["urgency"]>,
  { dot: string; label: string; text: string }
> = {
  high: {
    dot: "bg-red-400",
    label: "High",
    text: "text-red-400",
  },
  medium: {
    dot: "bg-amber-400",
    label: "Medium",
    text: "text-amber-400",
  },
  low: {
    dot: "bg-foreground-muted/50",
    label: "Low",
    text: "text-foreground-muted",
  },
};

export function InboxPanel({ data }: { data?: InboxData }) {
  const d = data ?? DEFAULT_DATA;
  const threads = d.threads?.length ? d.threads : DEFAULT_DATA.threads;
  const count = threads.length;
  const highCount = threads.filter((t) => t.urgency === "high").length;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? `Inbox · ${count} recent thread${count === 1 ? "" : "s"}`}
      title={d.title ?? "Your inbox"}
      meta={
        <div className="flex items-center gap-3 font-mono text-[0.7rem] text-foreground-muted">
          {highCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              {highCount} urgent
            </span>
          )}
          <span>{count} total</span>
        </div>
      }
    >
      <ul className="flex flex-col divide-y divide-border rounded-md border border-border overflow-hidden">
        {threads.map((t, i) => {
          const chrome = URGENCY_CHROME[t.urgency ?? "low"];
          return (
            <li
              key={t.id ?? i}
              className="group flex items-start gap-4 px-4 py-3.5 hover:bg-surface-highlight/60 transition-colors"
            >
              <div
                className={cn(
                  "h-9 w-9 shrink-0 rounded-full border border-border bg-background/50 flex items-center justify-center",
                  "font-serif text-sm text-foreground-muted",
                )}
                aria-hidden
              >
                {initial(displayName(t.from))}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm text-foreground truncate font-medium">
                    {displayName(t.from)}
                  </span>
                  {t.urgency && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] shrink-0",
                        chrome.text,
                      )}
                      style={{ letterSpacing: "0.14em" }}
                    >
                      <span className={cn("h-1 w-1 rounded-full", chrome.dot)} />
                      {chrome.label}
                    </span>
                  )}
                </div>
                <div className="text-[0.9rem] text-foreground leading-snug truncate">
                  {t.subject}
                </div>
                {t.snippet && (
                  <div className="text-[0.8rem] text-foreground-muted leading-snug line-clamp-1">
                    {t.snippet}
                  </div>
                )}
              </div>

              {t.receivedAt && (
                <div className="font-mono text-[0.65rem] text-foreground-muted tabular-nums shrink-0 pt-1">
                  {t.receivedAt}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PanelFrame>
  );
}
