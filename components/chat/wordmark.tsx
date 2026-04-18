import { cn } from "@/lib/utils";

export function Wordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl md:text-7xl",
  };
  return (
    <span
      className={cn(
        "font-serif font-light tracking-tight text-foreground",
        sizes[size],
        className,
      )}
      style={{ letterSpacing: "-0.02em" }}
    >
      Clarity
    </span>
  );
}
