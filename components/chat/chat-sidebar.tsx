"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Search, Trash2, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
import { LocationPill } from "./location-pill";
import type { ChatSession } from "@/lib/chat/sessions";

export function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  collapsed,
  onToggle,
}: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const results = sessions
    .map((s) => matchSession(s, trimmedQuery))
    .filter((r): r is SessionMatch => r !== null);

  const grouped = groupByDay(results);

  return (
    <aside
      className={cn(
        "shrink-0 h-dvh sticky top-0 border-r border-border/60 bg-surface/40 backdrop-blur-sm",
        "transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        collapsed ? "w-[60px]" : "w-[280px]",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Brand row */}
        <div className="flex items-center justify-between px-4 h-[60px] border-b border-border/60">
          {!collapsed && <Wordmark size="sm" />}
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-highlight transition-colors",
              collapsed && "mx-auto",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* New chat */}
        <div className="p-3">
          <button
            onClick={onNew}
            className={cn(
              "w-full flex items-center gap-2.5 h-9 rounded-md border border-border bg-background/40 text-foreground text-sm font-medium",
              "hover:border-[color:var(--primary)]/50 hover:bg-surface-highlight transition-colors",
              collapsed ? "justify-center px-0" : "px-3",
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>New chat</span>}
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search chats…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-md bg-background/60 border border-border/60 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-[color:var(--primary)]/40 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Session list */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {collapsed ? (
            <CollapsedList
              sessions={sessions}
              activeId={activeId}
              onSelect={onSelect}
            />
          ) : (
            <div className="flex flex-col gap-5">
              {grouped.map(([label, items]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <div
                    className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted px-2 mb-1.5"
                    style={{ letterSpacing: "0.14em" }}
                  >
                    {label}
                  </div>
                  {items.map((m) => (
                    <SessionRow
                      key={m.session.id}
                      session={m.session}
                      snippet={m.snippet}
                      active={m.session.id === activeId}
                      onClick={() => onSelect(m.session.id)}
                      onDelete={() => onDelete(m.session.id)}
                    />
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <div className="px-2 py-8 text-center text-sm text-foreground-muted italic">
                  No chats match "{query}"
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="px-3 pt-3">
          <LocationPill collapsed={collapsed} />
        </div>
        <GoogleConnect collapsed={collapsed} />
      </div>
    </aside>
  );
}

function GoogleConnect({ collapsed }: { collapsed: boolean }) {
  const [status, setStatus] = useState<
    { connected: boolean; email?: string; name?: string } | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google?action=status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setStatus(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const connected = !!status?.connected;
  const label = connected
    ? (status?.name ?? status?.email ?? "Connected").split(" ")[0]
    : "Connect Google";

  return (
    <div className="p-3 border-t border-border/60">
      <a
        href={connected ? "/api/google?action=logout" : "/api/google?action=login"}
        title={
          connected
            ? `Disconnect ${status?.email ?? "Google"}`
            : "Connect Gmail + Calendar"
        }
        className={cn(
          "relative w-full flex items-center justify-center gap-2.5 h-9 rounded-md border border-border text-sm font-medium transition-colors",
          "hover:border-[color:var(--primary)]/50 hover:bg-surface-highlight",
          connected
            ? "text-foreground"
            : "text-foreground-muted hover:text-foreground",
          collapsed ? "px-0" : "px-3",
        )}
      >
        {connected ? (
          <LogOut className="h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <LogIn className="h-4 w-4 shrink-0" />
        )}
        {!collapsed && <span className="truncate">{label}</span>}
        {collapsed && connected && (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
        )}
      </a>
    </div>
  );
}

function SessionRow({
  session,
  snippet,
  active,
  onClick,
  onDelete,
}: {
  session: ChatSession;
  snippet?: string;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-md transition-colors",
        active
          ? "bg-surface-highlight text-foreground"
          : "text-foreground-muted hover:bg-surface-highlight/60 hover:text-foreground",
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex flex-col gap-0.5 px-2.5 py-2 pr-9 text-left"
      >
        <div className="text-[0.85rem] leading-snug line-clamp-1">
          {session.title}
        </div>
        {snippet && (
          <div
            className={cn(
              "text-[0.72rem] leading-snug line-clamp-1 italic transition-colors",
              active ? "text-foreground/70" : "text-foreground-muted/80",
            )}
          >
            {snippet}
          </div>
        )}
        <div
          className={cn(
            "font-mono text-[0.65rem] tracking-[0.04em] transition-colors",
            active ? "text-primary/80" : "text-foreground-muted/70",
          )}
        >
          {session.subtitle} · {session.exchanges.length} turn
          {session.exchanges.length === 1 ? "" : "s"}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete chat"
        title="Delete chat"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 text-foreground-muted hover:bg-red-500/15 hover:text-red-400 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} />
      </button>
    </div>
  );
}

function CollapsedList({
  sessions,
  activeId,
  onSelect,
}: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 items-center pt-1">
      {sessions.map((s) => {
        const initial = s.title.charAt(0).toUpperCase();
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            title={s.title}
            className={cn(
              "h-9 w-9 rounded-md flex items-center justify-center font-serif text-sm transition-colors",
              active
                ? "bg-surface-highlight text-primary"
                : "text-foreground-muted hover:bg-surface-highlight/60 hover:text-foreground",
            )}
          >
            {initial}
          </button>
        );
      })}
    </div>
  );
}

type SessionMatch = { session: ChatSession; snippet?: string };

function groupByDay(matches: SessionMatch[]): [string, SessionMatch[]][] {
  const groups: Record<string, SessionMatch[]> = {};
  for (const m of matches) {
    const key = m.session.subtitle.split("·")[0].trim();
    (groups[key] ||= []).push(m);
  }
  return Object.entries(groups);
}

/**
 * Match a query against a session's title, subtitle, and each exchange
 * (prompt, gist, streamed text). Returns null if no match. When the title
 * itself contains the query we skip the snippet so the row stays clean.
 */
function matchSession(session: ChatSession, query: string): SessionMatch | null {
  if (!query) return { session };
  const q = query.toLowerCase();

  if (session.title.toLowerCase().includes(q)) return { session };
  if (session.subtitle.toLowerCase().includes(q)) {
    return { session, snippet: session.subtitle };
  }

  for (const ex of session.exchanges) {
    const hit =
      firstMatch(ex.prompt, q) ??
      firstMatch(ex.gist, q) ??
      firstMatch(ex.text, q);
    if (hit) return { session, snippet: hit };
  }
  return null;
}

function firstMatch(text: string | undefined, q: string): string | undefined {
  if (!text) return undefined;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return undefined;
  // Window ~60 chars around the hit.
  const start = Math.max(0, idx - 24);
  const end = Math.min(text.length, idx + q.length + 36);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return (prefix + text.slice(start, end) + suffix).replace(/\s+/g, " ");
}
