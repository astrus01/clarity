"use client";

import { cn } from "@/lib/utils";

export type ActivityLine = {
  tool: string;
  detail: string;
};

export function AgentActivity({
  lines,
  className,
  collapsed,
}: {
  lines: ActivityLine[];
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        "font-mono text-[0.75rem] leading-[1.7] text-foreground-muted italic",
        "space-y-0.5",
        collapsed && "opacity-60",
        className,
      )}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          className="flex gap-2 opacity-0 animate-[fade-in_250ms_cubic-bezier(0.25,0.1,0.25,1)_forwards]"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <span className="text-primary not-italic font-medium shrink-0">
            {l.tool}
          </span>
          <span className="truncate">{l.detail}</span>
        </div>
      ))}
    </div>
  );
}
