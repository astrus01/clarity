import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-surface-highlight rounded-md", className)}
      aria-hidden
    />
  );
}
