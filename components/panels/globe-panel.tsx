"use client";

import { PanelFrame } from "@/components/chat/panel-frame";

export type GlobeMarker = {
  label: string;
  value: string;
  lat: number;
  lng: number;
};

export type GlobeData = {
  title?: string;
  markers: GlobeMarker[];
};

const DEFAULT_DATA: GlobeData = {
  title: "Global AI investment, 2026 YTD",
  markers: [
    { label: "United States", value: "$48.2B", lat: 38, lng: -98 },
    { label: "China", value: "$22.7B", lat: 35, lng: 104 },
    { label: "United Kingdom", value: "$8.9B", lat: 54, lng: -2 },
    { label: "Germany", value: "$6.1B", lat: 51, lng: 10 },
    { label: "Israel", value: "$4.3B", lat: 31, lng: 35 },
    { label: "France", value: "$3.8B", lat: 46, lng: 2 },
  ],
};

function parseValue(v: string): number {
  const m = v.match(/([\d.]+)\s*([BMK])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const suffix = (m[2] ?? "").toUpperCase();
  if (suffix === "B") return n * 1_000_000_000;
  if (suffix === "M") return n * 1_000_000;
  if (suffix === "K") return n * 1_000;
  return n;
}

export function GlobePanel({ data }: { data?: GlobeData }) {
  const d = data ?? DEFAULT_DATA;
  const markers = d.markers?.length ? d.markers : DEFAULT_DATA.markers;
  const maxVal = Math.max(...markers.map((m) => parseValue(m.value)), 1);

  return (
    <PanelFrame
      eyebrow="Visualization · live data"
      title={d.title ?? "Global distribution"}
      meta={
        <span className="font-mono text-[0.7rem] text-foreground-muted">
          Scene3D · {markers.length} markers
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-5 items-stretch">
        <div className="relative h-72 rounded-md border border-border bg-background/30 overflow-hidden">
          <StarField />
          <GlobePlaceholder markers={markers} />
          <div className="absolute top-3 left-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted">
            Scene3D · preview
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[0.65rem] text-foreground-muted">
            drag · zoom · hover markers
          </div>
        </div>

        <ol className="flex flex-col gap-2.5">
          {markers.slice(0, 8).map((m, i) => {
            const weight = parseValue(m.value) / maxVal;
            return (
              <li key={`${m.label}-${i}`} className="flex items-center gap-3">
                <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-foreground w-36 truncate text-sm">
                  {m.label}
                </span>
                <div className="flex-1 h-[2px] rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.max(weight * 100, 4)}%` }}
                  />
                </div>
                <span className="font-mono text-[0.8rem] tabular-nums text-foreground shrink-0 w-16 text-right">
                  {m.value}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </PanelFrame>
  );
}

function GlobePlaceholder({ markers }: { markers: GlobeMarker[] }) {
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
        {[-60, -30, 0, 30, 60].map((lat) => (
          <div
            key={`lat-${lat}`}
            className="absolute left-0 right-0 border-t"
            style={{
              top: `${50 + Math.sin((lat * Math.PI) / 180) * 45}%`,
              borderColor: "oklch(0.20 0.02 255)",
              transform: `scaleX(${Math.cos((lat * Math.PI) / 180)})`,
            }}
          />
        ))}
        {[-60, -30, 0, 30, 60].map((lng) => (
          <div
            key={`lng-${lng}`}
            className="absolute top-0 bottom-0 border-l"
            style={{
              left: `${50 + Math.sin((lng * Math.PI) / 180) * 45}%`,
              borderColor: "oklch(0.20 0.02 255)",
              transform: `scaleY(${Math.cos((lng * Math.PI) / 180)})`,
            }}
          />
        ))}
        {markers.slice(0, 10).map((m, i) => {
          // simple equirectangular projection onto 180px globe circle
          const x = 50 + (m.lng / 180) * 45;
          const y = 50 - (m.lat / 90) * 45;
          return (
            <div
              key={`marker-${i}`}
              className="absolute rounded-full bg-primary"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: "6px",
                height: "6px",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 0 3px oklch(0.75 0.07 75 / 0.12)",
              }}
              title={`${m.label} · ${m.value}`}
            />
          );
        })}
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
