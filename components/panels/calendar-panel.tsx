"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Block =
  | { kind: "event"; startHour: number; durationHours: number; title: string; attendees?: number }
  | { kind: "available"; startHour: number; durationHours: number };

const day: Block[] = [
  { kind: "event", startHour: 9, durationHours: 0.75, title: "Standup", attendees: 6 },
  { kind: "event", startHour: 10, durationHours: 1, title: "1:1 with Maria", attendees: 2 },
  { kind: "event", startHour: 11.25, durationHours: 0.75, title: "Design review", attendees: 4 },
  { kind: "event", startHour: 12.5, durationHours: 1, title: "Lunch · blocked" },
  { kind: "available", startHour: 13.5, durationHours: 2.5 },
  { kind: "event", startHour: 16, durationHours: 0.5, title: "Sync with Jess", attendees: 2 },
  { kind: "event", startHour: 17, durationHours: 0.5, title: "Wrap" },
];

const DAY_START = 9;
const DAY_END = 18;
const TOTAL_HOURS = DAY_END - DAY_START;

function formatHour(h: number) {
  const intH = Math.floor(h);
  const m = Math.round((h - intH) * 60);
  const suffix = intH >= 12 ? "pm" : "am";
  const displayH = ((intH + 11) % 12) + 1;
  return m === 0 ? `${displayH}${suffix}` : `${displayH}:${String(m).padStart(2, "0")}${suffix}`;
}

export function CalendarPanel() {
  return (
    <PanelFrame
      eyebrow="Calendar · today, Apr 18"
      title="You have a clean 2.5 hour window"
      meta={
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          1:30pm – 4:00pm
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Timeline scrubber */}
        <div className="relative">
          <div className="flex justify-between text-[0.65rem] font-mono text-foreground-muted mb-1.5 tabular-nums px-0.5">
            {[9, 11, 13, 15, 17].map((h) => (
              <span key={h}>{formatHour(h)}</span>
            ))}
          </div>
          <div className="relative h-11 rounded-md border border-border bg-background/30 overflow-hidden">
            {day.map((b, i) => {
              const left = ((b.startHour - DAY_START) / TOTAL_HOURS) * 100;
              const width = (b.durationHours / TOTAL_HOURS) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute top-0 bottom-0 flex items-center px-2",
                    b.kind === "event"
                      ? "bg-surface-highlight border-r border-border"
                      : "bg-primary/15 ring-1 ring-inset ring-[color:var(--primary)]/50",
                  )}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  title={b.kind === "event" ? b.title : "Available"}
                >
                  {b.kind === "available" && (
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-primary">
                      Free
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event list */}
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {day.map((b, i) => {
            const isEvent = b.kind === "event";
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  !isEvent && "bg-primary/5",
                )}
              >
                <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-24 shrink-0">
                  {formatHour(b.startHour)} – {formatHour(b.startHour + b.durationHours)}
                </span>
                {isEvent ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted shrink-0" />
                    <span className="text-foreground flex-1 truncate">
                      {b.title}
                    </span>
                    {b.attendees && (
                      <span className="font-mono text-[0.7rem] text-foreground-muted">
                        {b.attendees} people
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-foreground flex-1">
                      <span className="text-primary">Available</span> — 2 hr 30 min
                    </span>
                    <button className="inline-flex items-center gap-1 font-medium text-xs text-foreground hover:text-primary transition-colors">
                      <Plus className="h-3 w-3" />
                      Block this
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </PanelFrame>
  );
}
