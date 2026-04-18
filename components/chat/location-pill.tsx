"use client";

import { MapPin, MapPinOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "@/lib/hooks/use-location";

export function LocationPill({ collapsed }: { collapsed: boolean }) {
  const { data, request, clear } = useLocation();

  const granted = data.status === "granted";
  const busy = data.status === "prompting";
  const denied = data.status === "denied";
  const unsupported = data.status === "unsupported";

  const display = (() => {
    if (granted)
      return (
        data.place ??
        data.neighborhood ??
        data.city ??
        data.label ??
        "Located"
      );
    if (busy) return "Locating…";
    if (denied) return "Location denied";
    if (unsupported) return "Unavailable";
    if (data.status === "error") return "Retry location";
    return "Share location";
  })();

  const handleClick = () => {
    if (busy) return;
    if (granted) {
      clear();
      return;
    }
    request();
  };

  const title = granted
    ? `Using ${data.label ?? "your location"}${data.timeZone ? ` · ${data.timeZone}` : ""} — click to revoke`
    : denied
      ? "You denied location. Re-enable in browser site settings, then retry."
      : unsupported
        ? "Geolocation isn't available in this browser."
        : "Share your location for better nearby answers. Permission-based.";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || unsupported}
      title={title}
      className={cn(
        "relative w-full flex items-center justify-center gap-2.5 h-9 rounded-md border text-sm font-medium transition-colors",
        granted
          ? "border-[color:var(--primary)]/40 text-foreground bg-surface-highlight/50 hover:bg-surface-highlight"
          : "border-border text-foreground-muted hover:text-foreground hover:border-[color:var(--primary)]/50 hover:bg-surface-highlight",
        (busy || unsupported) && "opacity-60 cursor-not-allowed",
        collapsed ? "px-0" : "px-3",
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      ) : granted ? (
        <MapPin className="h-4 w-4 shrink-0 text-[color:var(--primary)]" />
      ) : denied || unsupported ? (
        <MapPinOff className="h-4 w-4 shrink-0" />
      ) : (
        <MapPin className="h-4 w-4 shrink-0" />
      )}
      {!collapsed && <span className="truncate">{display}</span>}
      {collapsed && granted && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--primary)]"
        />
      )}
    </button>
  );
}
