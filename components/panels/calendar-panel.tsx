"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  title: string;
  start: string; // "9:00 AM"
  end: string;
  attendees?: number;
};

export type CalendarData = {
  date?: string;
  events: CalendarEvent[];
  gap?: { start: string; end: string };
};

const DAY_START = 9; // 9am
const DAY_END = 18; // 6pm
const TOTAL_HOURS = DAY_END - DAY_START;

function toFractionalHour(label: string): number {
  const m = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) {
    const simple = label.match(/(\d{1,2})\s*(AM|PM)/i);
    if (!simple) return DAY_START;
    let h = parseInt(simple[1], 10);
    const pm = simple[2].toUpperCase() === "PM";
    if (pm && h !== 12) h += 12;
    if (!pm && h === 12) h = 0;
    return h;
  }
  let h = parseInt(m[1], 10);
  const mins = parseInt(m[2], 10) / 60;
  const pm = m[3].toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h + mins;
}

function formatHour(h: number) {
  const intH = Math.floor(h);
  const m = Math.round((h - intH) * 60);
  const suffix = intH >= 12 ? "pm" : "am";
  const displayH = ((intH + 11) % 12) + 1;
  return m === 0
    ? `${displayH}${suffix}`
    : `${displayH}:${String(m).padStart(2, "0")}${suffix}`;
}

function formatDuration(hrs: number): string {
  if (hrs <= 0) return "";
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h === 1 ? "" : ""}`;
  return `${h} hr ${m} min`;
}

const DEFAULT_DATA: CalendarData = {
  date: "today",
  events: [
    { title: "Standup", start: "9:00 AM", end: "9:45 AM", attendees: 6 },
    { title: "1:1 with Maria", start: "10:00 AM", end: "11:00 AM", attendees: 2 },
    { title: "Design review", start: "11:15 AM", end: "12:00 PM", attendees: 4 },
    { title: "Lunch · blocked", start: "12:30 PM", end: "1:30 PM" },
    { title: "Sync with Jess", start: "4:00 PM", end: "4:30 PM", attendees: 2 },
    { title: "Wrap", start: "5:00 PM", end: "5:30 PM" },
  ],
  gap: { start: "1:30 PM", end: "4:00 PM" },
};

export function CalendarPanel({ data }: { data?: CalendarData }) {
  const d = data ?? DEFAULT_DATA;
  const events = d.events?.length ? d.events : DEFAULT_DATA.events;
  const gap = d.gap;

  const gapStartH = gap ? toFractionalHour(gap.start) : 0;
  const gapEndH = gap ? toFractionalHour(gap.end) : 0;
  const gapDur = gap ? gapEndH - gapStartH : 0;

  const eventBlocks = events.map((e) => {
    const sh = toFractionalHour(e.start);
    const eh = toFractionalHour(e.end);
    return { ...e, sh, eh };
  });

  return (
    <PanelFrame
      eyebrow={`Calendar · ${d.date ?? "today"}`}
      title={
        gap
          ? `You have a clean ${formatDuration(gapDur)} window`
          : "Today's schedule"
      }
      meta={
        gap ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {gap.start.toLowerCase()} – {gap.end.toLowerCase()}
          </span>
        ) : null
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
            {eventBlocks.map((b, i) => {
              const left = ((b.sh - DAY_START) / TOTAL_HOURS) * 100;
              const width = ((b.eh - b.sh) / TOTAL_HOURS) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 bg-surface-highlight border-r border-border"
                  style={{
                    left: `${Math.max(0, left)}%`,
                    width: `${Math.max(1, width)}%`,
                  }}
                  title={b.title}
                />
              );
            })}
            {gap && (
              <div
                className="absolute top-0 bottom-0 bg-primary/15 ring-1 ring-inset ring-[color:var(--primary)]/50 flex items-center px-2"
                style={{
                  left: `${((gapStartH - DAY_START) / TOTAL_HOURS) * 100}%`,
                  width: `${(gapDur / TOTAL_HOURS) * 100}%`,
                }}
              >
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-primary">
                  Free
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Event list */}
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {eventBlocks.map((b, i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3">
              <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-24 shrink-0">
                {b.start.toLowerCase()} – {b.end.toLowerCase()}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted shrink-0" />
              <span className="text-foreground flex-1 truncate">{b.title}</span>
              {b.attendees && (
                <span className="font-mono text-[0.7rem] text-foreground-muted">
                  {b.attendees} people
                </span>
              )}
            </li>
          ))}
          {gap && (
            <li className="flex items-center gap-4 px-4 py-3 bg-primary/5">
              <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-24 shrink-0">
                {gap.start.toLowerCase()} – {gap.end.toLowerCase()}
              </span>
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-foreground flex-1">
                <span className="text-primary">Available</span> —{" "}
                {formatDuration(gapDur)}
              </span>
              <button className="inline-flex items-center gap-1 font-medium text-xs text-foreground hover:text-primary transition-colors">
                <Plus className="h-3 w-3" />
                Block this
              </button>
            </li>
          )}
        </ul>
      </div>
    </PanelFrame>
  );
}
