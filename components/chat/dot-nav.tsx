"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Exchange } from "@/lib/chat/sessions";

export function DotNav({
  exchanges,
  activeIndex,
  onSelect,
}: {
  exchanges: Exchange[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-3"
      onMouseLeave={() => setHovered(null)}
    >
      {exchanges.map((ex, i) => {
        const isActive = i === activeIndex;
        const isHovered = hovered === i;
        return (
          <button
            key={ex.id}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHovered(i)}
            aria-label={`Exchange ${i + 1}: ${ex.gist}`}
            className="group relative flex items-center gap-3 transition-all duration-200"
          >
            <span
              className={cn(
                "font-mono text-[0.7rem] tracking-[0.04em] px-3 py-1 rounded-full bg-surface/90 backdrop-blur-sm border border-border/60 text-foreground whitespace-nowrap transition-all duration-200",
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 pointer-events-none",
              )}
            >
              {ex.gist}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-200 shrink-0",
                isActive
                  ? "h-2.5 w-2.5 bg-primary ring-2 ring-[color:var(--primary)]/25"
                  : "h-2 w-2 bg-foreground-muted/70 border border-foreground/40 group-hover:bg-foreground group-hover:border-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
