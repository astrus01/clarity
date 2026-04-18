"use client";

import { PanelFrame } from "@/components/chat/panel-frame";

type Country = { name: string; value: string; weight: number };

const countries: Country[] = [
  { name: "United States", value: "$48.2B", weight: 1.0 },
  { name: "China", value: "$22.7B", weight: 0.62 },
  { name: "United Kingdom", value: "$8.9B", weight: 0.36 },
  { name: "Germany", value: "$6.1B", weight: 0.28 },
  { name: "Israel", value: "$4.3B", weight: 0.22 },
  { name: "France", value: "$3.8B", weight: 0.2 },
];

export function GlobePanel() {
  return (
    <PanelFrame
      eyebrow="Visualization · live data"
      title="Global AI investment, 2026 YTD"
      meta={
        <span className="font-mono text-[0.7rem] text-foreground-muted">
          Scene3D · 48 countries
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5 items-stretch">
        {/* Placeholder 3D stage — real Scene3D wires in during hackathon */}
        <div className="relative h-72 rounded-md border border-border bg-background/30 overflow-hidden">
          <StarField />
          <GlobePlaceholder />
          <div className="absolute top-3 left-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted">
            Scene3D · preview
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[0.65rem] text-foreground-muted">
            drag · zoom · hover markers
          </div>
        </div>

        {/* Ranked bars */}
        <ol className="flex flex-col gap-2.5">
          {countries.map((c, i) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground w-36 truncate text-sm">
                {c.name}
              </span>
              <div className="flex-1 h-[2px] rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${c.weight * 100}%` }}
                />
              </div>
              <span className="font-mono text-[0.8rem] tabular-nums text-foreground shrink-0 w-16 text-right">
                {c.value}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </PanelFrame>
  );
}

function GlobePlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative rounded-full"
        style={{
          width: "180px",
          height: "180px",
          border: "1px solid oklch(0.30 0.02 255)",
          boxShadow:
            "inset 0 0 0 1px oklch(0.20 0.02 255), inset 30px -30px 60px oklch(0.12 0.01 255)",
        }}
      >
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <div
            key={lat}
            className="absolute left-0 right-0 border-t"
            style={{
              top: `${50 + Math.sin((lat * Math.PI) / 180) * 45}%`,
              borderColor: "oklch(0.20 0.02 255)",
              transform: `scaleX(${Math.cos((lat * Math.PI) / 180)})`,
            }}
          />
        ))}
        {/* Longitude lines */}
        {[-60, -30, 0, 30, 60].map((lng) => (
          <div
            key={lng}
            className="absolute top-0 bottom-0 border-l"
            style={{
              left: `${50 + Math.sin((lng * Math.PI) / 180) * 45}%`,
              borderColor: "oklch(0.20 0.02 255)",
              transform: `scaleY(${Math.cos((lng * Math.PI) / 180)})`,
            }}
          />
        ))}
        {/* Markers */}
        {[
          { x: 28, y: 38 },
          { x: 68, y: 42 },
          { x: 55, y: 30 },
          { x: 52, y: 52 },
          { x: 60, y: 38 },
          { x: 40, y: 48 },
        ].map((m, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: "6px",
              height: "6px",
              boxShadow: "0 0 0 3px oklch(0.75 0.07 75 / 0.12)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    left: (i * 37) % 100,
    top: (i * 61) % 100,
    size: ((i % 3) + 1) * 0.6,
    opacity: 0.25 + ((i % 4) * 0.12),
  }));
  return (
    <div className="absolute inset-0" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-foreground-muted"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}
