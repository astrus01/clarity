"use client";

import { useState } from "react";
import { ChevronLeft, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
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
  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()),
  );

  const grouped = groupByDay(filtered);

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
                  {items.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={() => onSelect(s.id)}
                      onDelete={() => onDelete(s.id)}
                    />
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-2 py-8 text-center text-sm text-foreground-muted italic">
                  No chats match "{query}"
                </div>
              )}
            </div>
          )}
        </nav>

      </div>
    </aside>
  );
}

function SessionRow({
  session,
  active,
  onClick,
  onDelete,
}: {
  session: ChatSession;
  active: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirming) {
      onDelete();
    } else {
      setConfirming(true);
      // reset if user doesn't confirm within 2.5s
      window.setTimeout(() => setConfirming(false), 2500);
    }
  };

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
        onClick={handleDelete}
        onMouseLeave={() => setConfirming(false)}
        aria-label={confirming ? "Click again to confirm delete" : "Delete chat"}
        title={confirming ? "Click again to confirm" : "Delete chat"}
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center transition-all",
          confirming
            ? "bg-red-500/15 text-red-400 opacity-100"
            : "opacity-0 group-hover:opacity-100 text-foreground-muted hover:bg-background/60 hover:text-foreground",
        )}
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

function groupByDay(sessions: ChatSession[]): [string, ChatSession[]][] {
  const groups: Record<string, ChatSession[]> = {};
  for (const s of sessions) {
    const key = s.subtitle.split("·")[0].trim();
    (groups[key] ||= []).push(s);
  }
  return Object.entries(groups);
}
