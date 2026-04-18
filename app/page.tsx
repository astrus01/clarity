"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Newspaper, GitCompare, Utensils, Plane, CalendarClock, MapPin, ChefHat } from "lucide-react";
import { InputBar } from "@/components/chat/input-bar";
import { AgentActivity } from "@/components/chat/agent-activity";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { DotNav } from "@/components/chat/dot-nav";
import { PromptPill } from "@/components/chat/prompt-pill";
import { Wordmark } from "@/components/chat/wordmark";
import { NewsBriefPanel } from "@/components/panels/news-brief";
import { EmailDraftPanel } from "@/components/panels/email-draft";
import { InboxPanel } from "@/components/panels/inbox";
import { ComparisonTablePanel } from "@/components/panels/comparison-table";
import { CalendarPanel } from "@/components/panels/calendar-panel";
import { GlobePanel } from "@/components/panels/globe-panel";
import { StockWatchPanel } from "@/components/panels/stock-watch";
import { WeatherBriefPanel } from "@/components/panels/weather-brief";
import { TimelinePlanPanel } from "@/components/panels/timeline-plan";
import { MealPickPanel } from "@/components/panels/meal-pick";
import { FridgeScanPanel } from "@/components/panels/fridge-scan";
import { NutritionLogPanel } from "@/components/panels/nutrition-log";
import { OnTheRoadPanel } from "@/components/panels/on-the-road";
import { MealOptionsPanel } from "@/components/panels/meal-options";
import { MapPanel } from "@/components/panels/map-panel";
import { MealPlanPanel } from "@/components/panels/meal-plan-panel";
import type { ChatSession, Exchange, PanelKind } from "@/lib/chat/sessions";
import { useChatStore } from "@/lib/chat/store";
import { useClarityChat } from "@/lib/hooks/use-chat";
import { cn } from "@/lib/utils";

type PanelComponent = React.ComponentType<{ data?: unknown }>;

const PANEL_MAP: Record<PanelKind, PanelComponent> = {
  "news-brief": NewsBriefPanel as PanelComponent,
  "email-draft": EmailDraftPanel as PanelComponent,
  inbox: InboxPanel as PanelComponent,
  "comparison-table": ComparisonTablePanel as PanelComponent,
  calendar: CalendarPanel as PanelComponent,
  globe: GlobePanel as PanelComponent,
  "stock-watch": StockWatchPanel as PanelComponent,
  "weather-brief": WeatherBriefPanel as PanelComponent,
  "timeline-plan": TimelinePlanPanel as PanelComponent,
  "meal-pick": MealPickPanel as PanelComponent,
  "fridge-scan": FridgeScanPanel as PanelComponent,
  "nutrition-log": NutritionLogPanel as PanelComponent,
  "on-the-road": OnTheRoadPanel as PanelComponent,
  "meal-options": MealOptionsPanel as PanelComponent,
  map: MapPanel as PanelComponent,
  "meal-plan": MealPlanPanel as PanelComponent,
};

const SUGGESTED: { icon: typeof Newspaper; label: string; prompt: string }[] = [
  {
    icon: Newspaper,
    label: "Top tech news",
    prompt: "What's the most important tech news right now?",
  },
  {
    icon: GitCompare,
    label: "Compare AI coding tools",
    prompt: "Compare Cursor, Copilot, and Claude Code for a junior developer.",
  },
  {
    icon: CalendarClock,
    label: "Block off lunch + pick a spot",
    prompt:
      "Block off 45 minutes for lunch when I'm free today, then recommend a nearby spot.",
  },
  {
    icon: Utensils,
    label: "What should I eat now?",
    prompt: "What should I eat right now?",
  },
  {
    icon: MapPin,
    label: "Food spots near me",
    prompt:
      "Show me four lunch spots within walking distance of me on a map.",
  },
  {
    icon: ChefHat,
    label: "Plan my meals for Tuesday",
    prompt:
      "Plan my meals for Tuesday — look at my schedule, see what I've already had for breakfast and lunch, tailor dinner to what I need, and show me grocery deals nearby.",
  },
  {
    icon: Plane,
    label: "Plan a travel day",
    prompt: "I'm flying LAX to Heathrow tonight with 80 minutes before the flight. Plan my meals.",
  },
];

export default function Page() {
  const [view, setView] = useState<"home" | "chat">("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sessions = useChatStore((s) => s.sessions);
  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);
  const createSession = useChatStore((s) => s.createSession);
  const deleteSession = useChatStore((s) => s.deleteSession);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? sessions[0],
    [sessions, activeId],
  );

  const { send, pending } = useClarityChat();

  const handleNew = () => {
    setView("home");
  };

  const handleSelect = (id: string) => {
    setActive(id);
    setView("chat");
  };

  const handlePromptFromHome = async (prompt: string) => {
    // Each prompt from home starts a fresh live session.
    createSession();
    setView("chat");
    await send(prompt);
  };

  return (
    <div className="flex min-h-dvh">
      <ChatSidebar
        sessions={sessions}
        activeId={activeSession.id}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={deleteSession}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {view === "home" ? (
          <HomeView onPrompt={handlePromptFromHome} />
        ) : (
          <ChatView
            key={activeSession.id}
            session={activeSession}
            pending={pending}
            onSubmit={send}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Home / empty state
// ============================================================================

function HomeView({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/60">
        <div
          className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-foreground-muted"
          style={{ letterSpacing: "0.2em" }}
        >
          The Internet, Rendered for You
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[46rem] flex flex-col items-center text-center gap-12 animate-[fade-in_400ms_ease-out]">
          <div className="flex flex-col items-center gap-5">
            <div
              className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-foreground-muted"
              style={{ letterSpacing: "0.24em" }}
            >
              ⌘ Clarity · v0.2
            </div>
            <h1
              className="font-serif text-[3.25rem] md:text-[4.5rem] leading-[1.03] text-foreground m-0"
              style={{ letterSpacing: "-0.035em", fontWeight: 300 }}
            >
              The Internet,
              <br />
              <span className="italic text-foreground-muted">
                Rendered for You.
              </span>
            </h1>
            <p
              className="text-foreground-muted max-w-xl mt-2"
              style={{ lineHeight: 1.6 }}
            >
              Clarity browses the web autonomously, reads and drafts your
              Gmail, checks your calendar, and plans your day — then hands
              back an interactive panel instead of another wall of text.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 font-mono text-[0.62rem] uppercase text-foreground-muted pt-1"
              style={{ letterSpacing: "0.18em" }}
            >
              <span>Exa + Stagehand browsing</span>
              <span className="text-border">·</span>
              <span>Gmail read &amp; send</span>
              <span className="text-border">·</span>
              <span>Calendar</span>
              <span className="text-border">·</span>
              <span>Weather</span>
              <span className="text-border">·</span>
              <span>Real-time food</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED.map((s, i) => (
              <div
                key={s.label}
                className="opacity-0 animate-[rise-in_300ms_cubic-bezier(0.25,0.1,0.25,1)_forwards]"
                style={{ animationDelay: `${200 + i * 80}ms` }}
              >
                <PromptPill
                  icon={s.icon}
                  label={s.label}
                  onClick={() => onPrompt(s.prompt)}
                />
              </div>
            ))}
          </div>

          <div className="w-full max-w-[38rem] mt-2">
            <InputBar onSubmit={onPrompt} />
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted mt-3 text-center"
              style={{ letterSpacing: "0.14em" }}
            >
              Enter to send · ⇧ Enter for newline · ⌘ K for voice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Chat / conversation
// ============================================================================

function ChatView({
  session,
  pending,
  onSubmit,
}: {
  session: ChatSession;
  pending: boolean;
  onSubmit: (prompt: string) => Promise<void>;
}) {
  const [activeExchange, setActiveExchange] = useState(0);
  const exchangeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastExchangeCountRef = useRef<number>(session.exchanges.length);

  // Observe which exchange is in view
  useEffect(() => {
    const refs = exchangeRefs.current.filter(Boolean) as HTMLDivElement[];
    if (refs.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = refs.findIndex((r) => r === visible[0].target);
          if (idx !== -1) setActiveExchange(idx);
        }
      },
      { threshold: [0.3, 0.6, 0.9], rootMargin: "-20% 0px -40% 0px" },
    );
    refs.forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, [session.id, session.exchanges.length]);

  // Auto-scroll to the newest exchange whenever a new one appends.
  useEffect(() => {
    const n = session.exchanges.length;
    if (n > lastExchangeCountRef.current) {
      exchangeRefs.current[n - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    lastExchangeCountRef.current = n;
  }, [session.exchanges.length]);

  const scrollToExchange = (i: number) => {
    exchangeRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const isEmpty = session.exchanges.length === 0;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md border-b border-border/60">
        <div className="flex items-baseline justify-between gap-6 px-8 lg:px-12 py-5">
          <div className="flex items-baseline gap-4 min-w-0">
            <Wordmark size="sm" className="shrink-0" />
            <span className="text-foreground-muted text-sm">/</span>
            <h1
              className="font-serif text-[1.4rem] leading-none text-foreground truncate m-0"
              style={{ letterSpacing: "-0.01em" }}
            >
              {session.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted hidden sm:inline"
              style={{ letterSpacing: "0.14em" }}
            >
              {session.subtitle}
            </span>
            <span className="font-mono text-[0.65rem] tabular-nums text-foreground-muted">
              {session.exchanges.length} turn
              {session.exchanges.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </header>

      {/* Scrollable canvas */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-8 lg:px-12 py-10 flex flex-col gap-16 pb-40 max-w-[84rem] mx-auto">
          {isEmpty ? (
            <EmptyChatHint title={session.title} />
          ) : (
            session.exchanges.map((ex, i) => (
              <div
                key={ex.id}
                ref={(el) => {
                  exchangeRefs.current[i] = el;
                }}
                data-active={i === activeExchange}
                className={cn(
                  "opacity-0 animate-[msg-in_360ms_cubic-bezier(0.25,0.1,0.25,1)_forwards] transition-opacity duration-500",
                  i !== activeExchange && "opacity-60 hover:opacity-100",
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ExchangeBlock index={i} exchange={ex} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dot nav */}
      {session.exchanges.length > 0 && (
        <DotNav
          exchanges={session.exchanges}
          activeIndex={activeExchange}
          onSelect={scrollToExchange}
        />
      )}

      {/* Sticky input */}
      <div className="sticky bottom-0 z-20 bg-background border-t border-border/60 pt-5">
        <div className="px-8 lg:px-12 pb-6 max-w-[56rem] mx-auto">
          <InputBar
            placeholder={
              isEmpty
                ? "Ask Clarity anything…"
                : pending
                  ? "Clarity is writing…"
                  : "Ask a follow-up…"
            }
            onSubmit={(text) => {
              void onSubmit(text);
            }}
          />
        </div>
      </div>
    </>
  );
}

function EmptyChatHint({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-start gap-3 py-16 max-w-[60ch]">
      <div
        className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
        style={{ letterSpacing: "0.14em" }}
      >
        {title}
      </div>
      <h2
        className="font-serif text-[2rem] leading-tight text-foreground m-0"
        style={{ letterSpacing: "-0.02em" }}
      >
        What would you like to see?
      </h2>
      <p className="text-foreground-muted leading-relaxed">
        Ask Clarity anything — news, research, a comparison, your schedule, a
        meal, a travel day. It will hand back a rendered panel.
      </p>
    </div>
  );
}

function ExchangeBlock({ index, exchange }: { index: number; exchange: Exchange }) {
  const Panel = exchange.panelKind ? PANEL_MAP[exchange.panelKind] : null;

  return (
    <section className="flex flex-col gap-6">
      {/* Prompt header */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <span
          className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted tabular-nums"
          style={{ letterSpacing: "0.14em" }}
        >
          {String(index + 1).padStart(2, "0")} · {exchange.timestamp}
        </span>
        <span className="h-px flex-1 bg-border/60 min-w-12" />
        <span
          className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted italic"
          style={{ letterSpacing: "0.12em" }}
        >
          {exchange.gist}
        </span>
      </div>

      {/* User prompt */}
      <h2
        className="font-serif text-[1.75rem] md:text-[2rem] leading-[1.2] text-foreground m-0"
        style={{ letterSpacing: "-0.02em", maxWidth: "50ch" }}
      >
        {exchange.prompt}
      </h2>

      {/* Agent activity (seed sessions) */}
      {exchange.activity && exchange.activity.length > 0 && (
        <AgentActivity lines={exchange.activity} />
      )}

      {/* Live status — thinking before any tool has fired */}
      {!Panel &&
        exchange.status === "streaming" &&
        !exchange.text &&
        (!exchange.activity || exchange.activity.length === 0) && (
          <StreamingHint />
        )}

      {/* Panel composing — tools have fired, waiting on the render_panel emission */}
      {!Panel &&
        exchange.status === "streaming" &&
        exchange.activity &&
        exchange.activity.length > 0 && (
          <PanelComposingHint
            rendering={exchange.activity.some((a) => a.tool === "render_panel")}
          />
        )}

      {/* Text body (live streaming) — full body when there's no panel */}
      {!Panel && exchange.text && (
        <div
          className={cn(
            "text-foreground leading-[1.7] text-[1.05rem] whitespace-pre-wrap",
            exchange.status === "error" && "text-red-400",
          )}
          style={{ maxWidth: "72ch" }}
        >
          {exchange.text}
          {exchange.status === "streaming" && <Caret />}
        </div>
      )}

      {/* Panel (seed sessions or live render_panel emissions) */}
      {Panel && (
        <div className="mt-2 opacity-0 translate-y-2 animate-[panel-in_420ms_cubic-bezier(0.25,0.1,0.25,1)_120ms_forwards]">
          <Panel data={exchange.panelData} />
        </div>
      )}

      {/* Caption — the model's one-line follow-up written alongside / after
          the panel. Rendered below in muted italic so the panel stays the
          focus but confirmations (e.g. "Added to your calendar · 11:30 AM")
          don't get dropped. */}
      {Panel && exchange.text && (
        <p
          className={cn(
            "text-foreground-muted italic text-[0.95rem] leading-relaxed max-w-[68ch] whitespace-pre-wrap",
            exchange.status === "error" && "text-red-400 not-italic",
          )}
        >
          {exchange.text}
          {exchange.status === "streaming" && <Caret />}
        </p>
      )}
    </section>
  );
}

function StreamingHint() {
  return (
    <div
      className="font-mono text-[0.75rem] italic text-foreground-muted flex items-center gap-2"
      aria-live="polite"
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-primary"
        style={{ animation: "pulse 1.4s ease-in-out infinite" }}
      />
      claude.haiku · composing…
    </div>
  );
}

function PanelComposingHint({ rendering }: { rendering: boolean }) {
  const label = rendering ? "rendering panel…" : "composing panel…";
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div
        className="font-mono text-[0.75rem] italic text-foreground-muted flex items-center gap-2"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-primary"
          style={{ animation: "pulse 1.4s ease-in-out infinite" }}
        />
        {label}
      </div>
      <div
        aria-hidden
        className="relative w-full max-w-[44rem] overflow-hidden rounded-lg border border-border bg-surface/60"
      >
        <div className="flex flex-col gap-3 p-5 pb-6">
          <div className="h-3 w-24 rounded-sm bg-surface-highlight" />
          <div className="h-5 w-3/5 rounded-sm bg-surface-highlight" />
          <div className="mt-2 flex flex-col gap-2">
            <div className="h-3 w-11/12 rounded-sm bg-surface-highlight/80" />
            <div className="h-3 w-9/12 rounded-sm bg-surface-highlight/80" />
            <div className="h-3 w-10/12 rounded-sm bg-surface-highlight/80" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
            animation: "shimmer 1.8s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="inline-block align-[-0.15em] ml-0.5 h-[1em] w-[0.5ch] bg-primary/80"
      style={{ animation: "pulse 1s ease-in-out infinite" }}
    />
  );
}
