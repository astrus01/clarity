"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp } from "lucide-react";

export type NewsStory = {
  outlet: string;
  headline: string;
  url: string;
  summary?: string;
  publishedAt?: string;
};

export type NewsBriefData = {
  eyebrow?: string;
  title?: string;
  stories: NewsStory[];
  intro?: string;
};

const DEFAULT_DATA: NewsBriefData = {
  eyebrow: "News Brief · Today, 8:42 AM",
  title: "Today in AI",
  stories: [
    {
      outlet: "The Verge",
      headline: "Anthropic launches new Claude capabilities for agentic workflows",
      url: "https://www.theverge.com",
    },
    {
      outlet: "TechCrunch",
      headline: "Enterprises double their AI infrastructure budgets in Q2",
      url: "https://techcrunch.com",
    },
    {
      outlet: "Wired",
      headline: "The generative UI movement: when chatbots stop being text-first",
      url: "https://www.wired.com",
    },
  ],
  intro:
    "Three stories shaped the AI narrative overnight. Anthropic announced deeper agentic tooling, enterprise budgets continued their steep climb, and a growing chorus of product teams started abandoning plain text in favor of rendered, interactive responses — the same shift that sits at the center of Clarity.",
};

const followUps = [
  "Compare sentiment across outlets",
  "Expand on the second story",
  "Brief me tomorrow at 8am",
];

export function NewsBriefPanel({ data }: { data?: NewsBriefData }) {
  const d = data ?? DEFAULT_DATA;
  const stories = d.stories?.length ? d.stories : DEFAULT_DATA.stories;
  const intro = d.intro ?? (data ? undefined : DEFAULT_DATA.intro);

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "News Brief"}
      title={d.title ?? "Today's stories"}
      meta={
        <Badge variant="success">
          <TrendingUp className="h-3 w-3" />
          Synthesized
        </Badge>
      }
    >
      <div className="flex flex-col gap-5">
        {intro && (
          <p
            className="text-foreground leading-[1.7] text-[0.95rem]"
            style={{ maxWidth: "65ch" }}
          >
            {intro}
          </p>
        )}

        <ol className="flex flex-col divide-y divide-border rounded-md border border-border overflow-hidden">
          {stories.slice(0, 6).map((s, i) => (
            <li
              key={`${s.url}-${i}`}
              className="group flex items-start gap-4 px-4 py-3.5 hover:bg-surface-highlight transition-colors"
            >
              <span
                className="font-mono text-[0.7rem] tabular-nums text-foreground-muted pt-0.5 w-5 shrink-0"
                style={{ letterSpacing: "0.02em" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted mb-1"
                  style={{ letterSpacing: "0.1em" }}
                >
                  {s.outlet}
                  {s.publishedAt ? ` · ${s.publishedAt}` : ""}
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground leading-snug hover:text-primary transition-colors inline-flex items-start gap-1.5"
                >
                  <span>{s.headline}</span>
                  <ExternalLink className="h-3 w-3 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                {s.summary && (
                  <p className="text-[0.85rem] text-foreground-muted leading-relaxed mt-1.5">
                    {s.summary}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <PanelFooter>
          {followUps.map((f) => (
            <button
              key={f}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-[color:var(--primary)]/60 transition-all"
            >
              {f}
            </button>
          ))}
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}
