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
  imageUrl?: string;
  faviconUrl?: string;
};

export type KeyFact = {
  label: string;
  value: string;
};

export type NewsBriefData = {
  eyebrow?: string;
  title?: string;
  stories: NewsStory[];
  intro?: string;
  keyFacts?: KeyFact[];
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

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function NewsBriefPanel({ data }: { data?: NewsBriefData }) {
  const d = data ?? DEFAULT_DATA;
  const stories = d.stories?.length ? d.stories : DEFAULT_DATA.stories;
  const intro = d.intro ?? (data ? undefined : DEFAULT_DATA.intro);
  const keyFacts = d.keyFacts ?? [];

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "Brief"}
      title={d.title ?? "Sources & synthesis"}
      meta={
        <Badge variant="success">
          <TrendingUp className="h-3 w-3" />
          Synthesized
        </Badge>
      }
    >
      <div className="flex flex-col gap-6">
        {intro && (
          <p
            className="text-foreground leading-[1.7] text-[0.95rem]"
            style={{ maxWidth: "65ch" }}
          >
            {intro}
          </p>
        )}

        {keyFacts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-md overflow-hidden border border-border">
            {keyFacts.slice(0, 8).map((f, i) => (
              <div
                key={`${f.label}-${i}`}
                className="bg-surface px-4 py-3 flex flex-col gap-1"
              >
                <div
                  className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
                  style={{ letterSpacing: "0.14em" }}
                >
                  {f.label}
                </div>
                <div className="font-serif text-[1.25rem] leading-tight text-foreground tabular-nums">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.slice(0, 6).map((s, i) => (
              <SourceCard key={`${s.url}-${i}`} story={s} index={i} />
            ))}
          </div>
        )}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            {stories.length} source{stories.length === 1 ? "" : "s"} · click a card to open
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function SourceCard({ story, index }: { story: NewsStory; index: number }) {
  const host = story.outlet || hostOf(story.url);
  return (
    <a
      href={story.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-md border border-border bg-surface overflow-hidden hover:border-[color:var(--primary)]/60 transition-colors"
    >
      {story.imageUrl ? (
        <div className="aspect-[16/9] bg-surface-highlight overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : null}

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2">
          {story.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={story.faviconUrl}
              alt=""
              className="h-3.5 w-3.5 rounded-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="font-mono text-[0.65rem] tabular-nums text-foreground-muted w-5">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <span
            className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted truncate"
            style={{ letterSpacing: "0.12em" }}
          >
            {host}
            {story.publishedAt ? ` · ${story.publishedAt}` : ""}
          </span>
        </div>

        <div className="text-foreground leading-snug font-serif text-[1.05rem] group-hover:text-primary transition-colors flex items-start gap-1.5">
          <span>{story.headline}</span>
          <ExternalLink className="h-3 w-3 mt-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {story.summary && (
          <p className="text-[0.82rem] text-foreground-muted leading-relaxed line-clamp-3">
            {story.summary}
          </p>
        )}
      </div>
    </a>
  );
}
