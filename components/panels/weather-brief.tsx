"use client";

import { PanelFrame } from "@/components/chat/panel-frame";
import { Cloud, CloudRain, CloudSnow, Droplets, Sun, Wind, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherData } from "@/lib/tools/weather";

export type { WeatherData };

const DEFAULT_DATA: WeatherData = {
  location: "Tokyo, JP",
  today: {
    condition: "Clear",
    high: 68,
    low: 54,
    precipChance: 5,
    humidity: 54,
    wind: 8,
    description: "clear · high 68°",
  },
  week: [
    { day: "Mon", high: 68, low: 54, condition: "Clear", precipChance: 5 },
    { day: "Tue", high: 71, low: 56, condition: "Clear", precipChance: 10 },
    { day: "Wed", high: 65, low: 55, condition: "Partly cloudy", precipChance: 40 },
    { day: "Thu", high: 61, low: 52, condition: "Rain", precipChance: 80 },
    { day: "Fri", high: 63, low: 53, condition: "Rain", precipChance: 65 },
    { day: "Sat", high: 69, low: 54, condition: "Overcast", precipChance: 30 },
    { day: "Sun", high: 74, low: 58, condition: "Clear", precipChance: 5 },
  ],
};

function iconFor(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return Zap;
  if (c.includes("snow")) return CloudSnow;
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return CloudRain;
  if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) return Cloud;
  return Sun;
}

export function WeatherBriefPanel({ data }: { data?: WeatherData }) {
  const d = data ?? DEFAULT_DATA;
  const today = d.today ?? DEFAULT_DATA.today;
  const week = d.week?.length ? d.week : DEFAULT_DATA.week;
  const TodayIcon = iconFor(today.condition);

  return (
    <PanelFrame eyebrow={`Forecast · ${d.location}`} title="7-day outlook">
      <div className="flex flex-col gap-6">
        {/* Today hero */}
        <div className="flex items-center gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <TodayIcon
              className="h-12 w-12 text-foreground-muted"
              strokeWidth={1.2}
            />
            <div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-foreground-muted">
                Today
              </div>
              <div className="font-serif text-[3rem] leading-none text-foreground tabular-nums mt-1">
                {today.high}°
              </div>
              <div className="text-sm text-foreground-muted mt-1 capitalize">
                {today.condition.toLowerCase()} · low {today.low}°
              </div>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-6 text-sm">
            <Stat icon={Wind} label="Wind" value={`${today.wind} mph`} />
            <Stat icon={Droplets} label="Humidity" value={`${today.humidity}%`} />
            <Stat icon={CloudRain} label="Rain" value={`${today.precipChance}%`} />
          </div>
        </div>

        {/* 7-day strip */}
        <div
          className={cn(
            "grid gap-px bg-border rounded-md overflow-hidden border border-border",
            week.length >= 7
              ? "grid-cols-7"
              : week.length === 6
                ? "grid-cols-6"
                : week.length === 5
                  ? "grid-cols-5"
                  : "grid-cols-4",
          )}
        >
          {week.slice(0, 7).map((day, i) => {
            const Icon = iconFor(day.condition);
            return (
              <div
                key={`${day.day}-${i}`}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 px-2 bg-surface hover:bg-surface-highlight transition-colors",
                  i === 0 && "bg-surface-highlight",
                )}
              >
                <div
                  className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted"
                  style={{ letterSpacing: "0.12em" }}
                >
                  {day.day}
                </div>
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.4} />
                <div className="flex flex-col items-center text-center">
                  <span className="text-[0.95rem] tabular-nums text-foreground">
                    {day.high}°
                  </span>
                  <span className="text-[0.7rem] tabular-nums text-foreground-muted">
                    {day.low}°
                  </span>
                </div>
                <div className="font-mono text-[0.6rem] text-primary/80 tabular-nums">
                  {day.precipChance}%
                </div>
              </div>
            );
          })}
        </div>
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
