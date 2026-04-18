"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function PromptPill({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground",
        "transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        "hover:bg-surface-highlight hover:border-[color:var(--primary)]/60 hover:text-foreground",
        className,
      )}
      style={{ letterSpacing: "0.01em" }}
    >
      {Icon && (
        <Icon className="h-3.5 w-3.5 text-foreground-muted group-hover:text-primary transition-colors" />
      )}
      <span>{label}</span>
    </button>
  );
}
