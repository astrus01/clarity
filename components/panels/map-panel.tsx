"use client";

import dynamic from "next/dynamic";
import { MapPin, Navigation } from "lucide-react";
import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { cn } from "@/lib/utils";

export type MapMarker = {
  id?: string;
  label: string;
  description?: string;
  url?: string;
  lat: number;
  lng: number;
};

export type MapCenter = {
  lat: number;
  lng: number;
  zoom?: number;
};

export type MapComparisonRow = {
  feature: string;
  cells: string[]; // length === markers.length
};

export type MapComparison = {
  /**
   * Column labels for the comparison table. If omitted, falls back to each
   * marker's label (the pin number + marker name reads naturally).
   */
  columns?: string[];
  rows: MapComparisonRow[];
  recommendedIndex?: number;
};

export type MapPanelData = {
  eyebrow?: string;
  title?: string;
  summary?: string;
  center?: MapCenter;
  markers?: MapMarker[];
  userLocation?: { lat: number; lng: number; label?: string };
  comparison?: MapComparison;
  footer?: {
    anchorLabel?: string;
    directionsUrl?: string;
  };
};

// Leaflet touches `window` at import time — defer to the client.
const MapView = dynamic(
  () => import("./map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-md border border-border bg-surface-highlight/30" />
    ),
  },
);

const DEFAULT_DATA: MapPanelData = {
  eyebrow: "Nearby · Georgia Tech",
  title: "Lunch spots within a 10-min walk",
  summary: "Four places ranked by rating — tap a pin for hours and directions.",
  center: { lat: 33.7756, lng: -84.3963, zoom: 15 },
  userLocation: { lat: 33.7756, lng: -84.3963, label: "Georgia Tech" },
  markers: [
    {
      id: "1",
      label: "Tin Drum Asian Kitchen",
      description: "Fast pan-Asian · ~$12 · 4 min walk",
      url: "https://www.google.com/maps/search/Tin+Drum+Asian+Kitchen+Georgia+Tech",
      lat: 33.7766,
      lng: -84.3987,
    },
    {
      id: "2",
      label: "Moe's Original BBQ",
      description: "Southern BBQ · ~$14 · 6 min walk",
      url: "https://www.google.com/maps/search/Moes+Original+BBQ+Atlanta",
      lat: 33.7747,
      lng: -84.3911,
    },
    {
      id: "3",
      label: "Ferst Place",
      description: "Campus dining hall · ~$10 · 2 min walk",
      lat: 33.7749,
      lng: -84.3966,
    },
  ],
};

export function MapPanel({ data }: { data?: MapPanelData }) {
  const d = (data && Object.keys(data).length > 0 ? data : DEFAULT_DATA) as MapPanelData;
  const markers = d.markers ?? [];
  const user = d.userLocation;

  return (
    <PanelFrame eyebrow={d.eyebrow} title={d.title}>
      <div className="flex flex-col gap-4">
        {d.summary && (
          <p className="text-[0.95rem] leading-[1.55] text-foreground-muted max-w-[62ch]">
            {d.summary}
          </p>
        )}

        <MapView
          center={d.center}
          markers={markers}
          userLocation={user ? { lat: user.lat, lng: user.lng } : undefined}
        />

        {markers.length > 0 && (
          <ol className="flex flex-col gap-2 mt-1">
            {markers.map((m, i) => (
              <li
                key={m.id ?? `${m.lat},${m.lng},${i}`}
                className="flex items-start gap-3 rounded-md border border-border/70 bg-surface/60 px-3 py-2.5"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.7rem] font-bold"
                  style={{
                    background: "oklch(0.75 0.07 75)",
                    color: "oklch(0.12 0.01 255)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-medium text-foreground truncate">
                      {m.label}
                    </div>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--primary)] hover:underline shrink-0"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        Open ↗
                      </a>
                    )}
                  </div>
                  {m.description && (
                    <div className="text-[0.85rem] text-foreground-muted leading-snug mt-0.5">
                      {m.description}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}

        {d.comparison && d.comparison.rows.length > 0 && markers.length > 0 && (
          <ComparisonGrid
            markers={markers}
            comparison={d.comparison}
          />
        )}

        {(d.footer?.anchorLabel || d.footer?.directionsUrl) && (
          <PanelFooter>
            {d.footer?.anchorLabel && (
              <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-foreground-muted">
                <MapPin className="h-3.5 w-3.5" />
                {d.footer.anchorLabel}
              </span>
            )}
            {d.footer?.directionsUrl && (
              <a
                href={d.footer.directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[color:var(--primary)] hover:underline"
              >
                <Navigation className="h-3.5 w-3.5" />
                Get directions
              </a>
            )}
          </PanelFooter>
        )}
      </div>
    </PanelFrame>
  );
}

function ComparisonGrid({
  markers,
  comparison,
}: {
  markers: MapMarker[];
  comparison: MapComparison;
}) {
  const columns =
    comparison.columns && comparison.columns.length === markers.length
      ? comparison.columns
      : markers.map((m) => m.label);
  const recIdx = comparison.recommendedIndex ?? -1;

  return (
    <div className="overflow-x-auto rounded-md border border-border mt-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-highlight">
            <th className="px-3 py-2.5 text-left font-mono text-[0.65rem] uppercase tracking-[0.1em] text-foreground-muted font-normal">
              Feature
            </th>
            {columns.map((name, i) => (
              <th
                key={`${name}-${i}`}
                className="px-3 py-2.5 text-left font-normal align-bottom"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[0.6rem] font-bold"
                    style={{
                      background: "oklch(0.75 0.07 75)",
                      color: "oklch(0.12 0.01 255)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-serif text-[0.95rem] text-foreground truncate">
                    {name}
                  </span>
                  {i === recIdx && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.1em] text-primary border border-[color:var(--primary)]/40 rounded-full px-1.5 py-0.5 shrink-0">
                      Pick
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((r, i) => (
            <tr
              key={`${r.feature}-${i}`}
              className={cn("border-t border-border", i % 2 === 1 && "bg-background/30")}
            >
              <td className="px-3 py-2.5 align-top text-foreground-muted">
                {r.feature}
              </td>
              {columns.map((_name, colIdx) => (
                <td
                  key={colIdx}
                  className={cn(
                    "px-3 py-2.5 align-top text-foreground",
                    colIdx === recIdx && "bg-primary/5",
                  )}
                >
                  {r.cells[colIdx] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
