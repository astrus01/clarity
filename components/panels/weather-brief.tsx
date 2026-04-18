"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Cloud, CloudRain, Droplets, Sun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

type Day = {
  day: string;
  date: string;
  hi: number;
  lo: number;
  condition: "sunny" | "cloudy" | "rain";
  rainChance: number;
};

const WEEK: Day[] = [
  { day: "Mon", date: "Apr 20", hi: 68, lo: 54, condition: "sunny", rainChance: 5 },
  { day: "Tue", date: "Apr 21", hi: 71, lo: 56, condition: "sunny", rainChance: 10 },
  { day: "Wed", date: "Apr 22", hi: 65, lo: 55, condition: "cloudy", rainChance: 40 },
  { day: "Thu", date: "Apr 23", hi: 61, lo: 52, condition: "rain", rainChance: 80 },
  { day: "Fri", date: "Apr 24", hi: 63, lo: 53, condition: "rain", rainChance: 65 },
  { day: "Sat", date: "Apr 25", hi: 69, lo: 54, condition: "cloudy", rainChance: 30 },
  { day: "Sun", date: "Apr 26", hi: 74, lo: 58, condition: "sunny", rainChance: 5 },
];

const ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rain: CloudRain,
};

export function WeatherBriefPanel() {
  return (
    <PanelFrame
      eyebrow="Forecast · Tokyo, JP"
      title="7-day outlook"
    >
      <div className="flex flex-col gap-6">
        {/* Today hero */}
        <div className="flex items-center gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Sun className="h-12 w-12 text-foreground-muted" strokeWidth={1.2} />
            <div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted">
                Today · Saturday
              </div>
              <div className="font-serif text-[3rem] leading-none text-foreground tabular-nums mt-1">
                68°
              </div>
              <div className="text-sm text-foreground-muted mt-1">
                Feels like 66° · Clear & mild
              </div>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-6 text-sm">
            <Stat icon={Wind} label="Wind" value="8 mph" />
            <Stat icon={Droplets} label="Humidity" value="54%" />
            <Stat icon={CloudRain} label="Rain" value="5%" />
          </div>
        </div>

        {/* 7-day strip */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden border border-border">
          {WEEK.map((d, i) => {
            const Icon = ICONS[d.condition];
            return (
              <div
                key={d.day}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 px-2 bg-surface hover:bg-surface-highlight transition-colors",
                  i === 0 && "bg-surface-highlight",
                )}
              >
                <div
                  className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted"
                  style={{ letterSpacing: "0.12em" }}
                >
                  {d.day}
                </div>
                <Icon
                  className="h-5 w-5 text-foreground"
                  strokeWidth={1.4}
                />
                <div className="flex flex-col items-center text-center">
                  <span className="text-[0.95rem] tabular-nums text-foreground">
                    {d.hi}°
                  </span>
                  <span className="text-[0.7rem] tabular-nums text-foreground-muted">
                    {d.lo}°
                  </span>
                </div>
                <div className="font-mono text-[0.6rem] text-primary/80 tabular-nums">
                  {d.rainChance}%
                </div>
              </div>
            );
          })}
        </div>

        <p
          className="text-sm text-foreground-muted leading-relaxed"
          style={{ maxWidth: "70ch" }}
        >
          A calm start to the week gives way to a wet midweek — pack a light
          jacket for Thursday and Friday. The weekend clears, with Sunday the
          warmest day of the run.
        </p>
      </div>
    </PanelFrame>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-foreground-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <span className="text-foreground tabular-nums mt-0.5">{value}</span>
    </div>
  );
}
