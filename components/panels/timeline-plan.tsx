"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { Clock, MapPin } from "lucide-react";

export type TimelineStop = {
  time: string;
  title: string;
  note?: string;
  duration?: string;
  neighborhood?: string;
};

export type TimelineDay = {
  label: string;
  theme: string;
  date?: string;
  stops: TimelineStop[];
};

export type TimelinePlanData = {
  title?: string;
  eyebrow?: string;
  days: TimelineDay[];
};

const DEFAULT_DATA: TimelinePlanData = {
  title: "Tokyo, for architects",
  eyebrow: "Itinerary · 4 days",
  days: [
    {
      label: "Day 1",
      date: "Sun · Apr 26",
      theme: "Metabolism & mega-structures",
      stops: [
        {
          time: "09:30",
          title: "Nakagin Capsule Tower site",
          neighborhood: "Shimbashi",
          note: "Demolished but heritage plaque + context",
          duration: "45m",
        },
        {
          time: "11:00",
          title: "Shizuoka Press & Broadcasting Tower",
          neighborhood: "Ginza",
          note: "Kenzo Tange · 1967",
          duration: "1h",
        },
        {
          time: "14:00",
          title: "St. Mary's Cathedral",
          neighborhood: "Bunkyo",
          note: "Tange · stainless steel hyperbolic paraboloid",
          duration: "1h 30m",
        },
      ],
    },
    {
      label: "Day 2",
      date: "Mon · Apr 27",
      theme: "Contemporary — Ando & Ito",
      stops: [
        { time: "10:00", title: "21_21 Design Sight", neighborhood: "Roppongi", note: "Tadao Ando · buried concrete prism", duration: "2h" },
        { time: "13:30", title: "Tod's Omotesando", neighborhood: "Aoyama", note: "Toyo Ito · tree-pattern concrete façade", duration: "45m" },
        { time: "15:00", title: "Prada Aoyama", neighborhood: "Aoyama", note: "Herzog & de Meuron · diamond glass crystal", duration: "1h" },
      ],
    },
    {
      label: "Day 3",
      date: "Tue · Apr 28",
      theme: "Public & civic",
      stops: [
        { time: "09:00", title: "Tokyo International Forum", neighborhood: "Yurakucho", note: "Rafael Viñoly · glass hall spine", duration: "1h 30m" },
        { time: "12:00", title: "National Art Center", neighborhood: "Roppongi", note: "Kisho Kurokawa · undulating glass", duration: "2h" },
        { time: "15:00", title: "Tokyo Midtown", neighborhood: "Roppongi", note: "SOM + Sakakura · tower complex", duration: "1h 15m" },
      ],
    },
    {
      label: "Day 4",
      date: "Wed · Apr 29",
      theme: "Residential & craft",
      stops: [
        { time: "10:00", title: "Reversible Destiny Lofts", neighborhood: "Mitaka", note: "Arakawa + Gins · experimental housing", duration: "1h 30m" },
        { time: "13:00", title: "Moriyama House (exterior only)", neighborhood: "Ota", note: "SANAA · dispersed white boxes", duration: "45m" },
        { time: "15:30", title: "Sumida Hokusai Museum", neighborhood: "Sumida", note: "SANAA · faceted aluminum", duration: "1h 15m" },
      ],
    },
  ],
};

export function TimelinePlanPanel({ data }: { data?: TimelinePlanData }) {
  const d = data ?? DEFAULT_DATA;
  const days = d.days?.length ? d.days : DEFAULT_DATA.days;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? `Itinerary · ${days.length} day${days.length === 1 ? "" : "s"}`}
      title={d.title ?? "Plan"}
    >
      <div className="flex flex-col gap-10">
        {days.map((day, di) => (
          <DaySection key={`${day.label}-${di}`} day={day} index={di} />
        ))}

        <PanelFooter>
          <button className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-[color:var(--primary)]/60 transition-all">
            Add to Calendar
          </button>
          <button className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground-muted hover:text-foreground hover:border-[color:var(--primary)]/60 transition-all">
            Export as PDF
          </button>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function DaySection({ day, index }: { day: TimelineDay; index: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-4 flex-wrap">
        <span
          className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted tabular-nums"
          style={{ letterSpacing: "0.14em" }}
        >
          {day.label}
        </span>
        <h4 className="font-serif text-[1.3rem] leading-tight text-foreground m-0">
          {day.theme}
        </h4>
        {day.date && (
          <span className="ml-auto text-xs text-foreground-muted tabular-nums">
            {day.date}
          </span>
        )}
      </div>

      <ol className="relative flex flex-col gap-0 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-border">
        {day.stops.map((stop, i) => (
          <li key={i} className="relative py-3 flex gap-6 group">
            <span
              className={`absolute left-[-1.25rem] top-4 h-2.5 w-2.5 rounded-full border border-border transition-colors ${
                index === 0 && i === 0
                  ? "bg-primary border-primary"
                  : "bg-surface group-hover:border-primary"
              }`}
              aria-hidden
            />
            <div className="flex flex-col items-end text-right shrink-0 w-16">
              <div className="font-mono text-[0.8rem] tabular-nums text-foreground">
                {stop.time}
              </div>
              {stop.duration && (
                <div className="flex items-center gap-1 text-[0.65rem] text-foreground-muted mt-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {stop.duration}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground leading-snug">{stop.title}</div>
              {stop.neighborhood && (
                <div className="flex items-center gap-1 text-xs text-foreground-muted mt-1">
                  <MapPin className="h-3 w-3" />
                  {stop.neighborhood}
                </div>
              )}
              {stop.note && (
                <div className="text-xs text-foreground-muted/80 italic mt-1">
                  {stop.note}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
