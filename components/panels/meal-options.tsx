"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import {
  MapPin,
  Clock,
  Star,
  ArrowUpRight,
  Footprints,
  Car,
  Train,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TravelMode = "driving" | "walking" | "transit" | "rideshare";

export type NutritionSource = "official" | "estimated" | "low-confidence";

export type MealOptionNutrition = {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  source: NutritionSource;
};

export type MealOption = {
  label: string;
  placeName: string;
  address?: string;
  rating?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  openNow?: boolean;
  travelMode: TravelMode;
  travelMinutes: number;
  detourMinutes?: number;
  orderTitle: string;
  orderItems: string[];
  whyItFits: string;
  nutrition?: MealOptionNutrition;
  mapsUrl: string;
};

export type MapMarker = {
  label: string;
  lat: number;
  lng: number;
  kind: "option" | "destination" | "anchor";
};

export type MealOptionsData = {
  eyebrow?: string;
  title?: string;
  summary?: string;
  window: {
    nextEventTitle?: string;
    nextEventStart?: string;
    leaveBy?: string;
    availableMinutes: number;
    anchorLabel: string;
    destinationLabel?: string;
  };
  map?: {
    imageUrl?: string;
    markers?: MapMarker[];
  };
  topPick: MealOption;
  alternatives?: MealOption[];
  backup?: {
    title: string;
    note: string;
    order?: string;
  };
};

const DEFAULT_DATA: MealOptionsData = {
  eyebrow: "Right now · 1:25 PM · Midtown",
  title: "35 minutes before your 2:00 — here's the play.",
  summary:
    "You need to be at the client meeting by 2:00. Walking, 6 min buffer if you pick the top spot.",
  window: {
    nextEventTitle: "Client review · Flatiron",
    nextEventStart: "2:00 PM",
    leaveBy: "1:54 PM",
    availableMinutes: 29,
    anchorLabel: "W 42nd & Bryant Park",
    destinationLabel: "Flatiron · 5 Ave & 23rd",
  },
  map: {
    markers: [
      { label: "You", lat: 40.7549, lng: -73.9840, kind: "anchor" },
      { label: "Cava", lat: 40.7532, lng: -73.9822, kind: "option" },
      { label: "sweetgreen", lat: 40.7541, lng: -73.9855, kind: "option" },
      { label: "Pret a Manger", lat: 40.7555, lng: -73.9821, kind: "option" },
      { label: "Chopt", lat: 40.7527, lng: -73.9834, kind: "option" },
      { label: "Flatiron", lat: 40.7411, lng: -73.9897, kind: "destination" },
    ],
  },
  topPick: {
    label: "Best fit",
    placeName: "Cava",
    address: "1270 6th Ave",
    rating: 4.5,
    priceLevel: 2,
    openNow: true,
    travelMode: "walking",
    travelMinutes: 4,
    detourMinutes: 0,
    orderTitle: "Grilled chicken greens bowl, no pita, light tahini",
    orderItems: [
      "Greens base",
      "Double grilled chicken",
      "Tomato + cucumber + pickled onion",
      "Hummus, light tahini",
      "No pita",
    ],
    whyItFits:
      "4-min walk, fast line at 1:25, high protein to carry the 4:00 live hit. Leaves a 6-min buffer.",
    nutrition: {
      calories: 560,
      proteinG: 44,
      carbsG: 38,
      fatG: 22,
      source: "official",
    },
    mapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Cava+1270+6th+Ave+New+York",
  },
  alternatives: [
    {
      label: "Fastest",
      placeName: "Pret a Manger",
      address: "1350 6th Ave",
      rating: 4.2,
      priceLevel: 2,
      openNow: true,
      travelMode: "walking",
      travelMinutes: 3,
      detourMinutes: 0,
      orderTitle: "Chicken & avocado protein pot",
      orderItems: ["Protein pot", "Siggi's vanilla", "Sparkling water"],
      whyItFits: "Grab-and-go. Eat at desk if the line moves slow.",
      nutrition: {
        calories: 480,
        proteinG: 32,
        carbsG: 24,
        fatG: 26,
        source: "official",
      },
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=Pret+a+Manger+1350+6th+Ave",
    },
    {
      label: "Closest",
      placeName: "sweetgreen",
      address: "1155 6th Ave",
      rating: 4.4,
      priceLevel: 2,
      openNow: true,
      travelMode: "walking",
      travelMinutes: 5,
      detourMinutes: 1,
      orderTitle: "Harvest bowl, no rice, add chicken",
      orderItems: [
        "Wild rice swapped for extra greens",
        "Grilled chicken",
        "Roasted sweet potato",
        "Balsamic vinaigrette",
      ],
      whyItFits: "Higher fiber, lower sodium. Slightly longer wait most days.",
      nutrition: {
        calories: 520,
        proteinG: 38,
        carbsG: 44,
        fatG: 18,
        source: "estimated",
      },
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=sweetgreen+1155+6th+Ave",
    },
    {
      label: "Best meal",
      placeName: "Chopt",
      address: "1211 6th Ave",
      rating: 4.3,
      priceLevel: 2,
      openNow: true,
      travelMode: "walking",
      travelMinutes: 6,
      detourMinutes: 2,
      orderTitle: "Mexican Caesar, add chicken, skip tortilla strips",
      orderItems: [
        "Romaine + kale",
        "Double grilled chicken",
        "Cotija, cilantro, pepitas",
        "Caesar dressing on the side",
      ],
      whyItFits: "Biggest portion. Cuts your buffer to 3 min — only if you order ahead.",
      nutrition: {
        calories: 610,
        proteinG: 48,
        carbsG: 26,
        fatG: 32,
        source: "estimated",
      },
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&destination=Chopt+1211+6th+Ave",
    },
  ],
  backup: {
    title: "If the line's out the door",
    note: "Bryant Park newsstand: Siggi's 4% vanilla + banana + sparkling water. Eat walking south on 6th. 140 kcal worth of buffer recovered.",
    order: "Siggi's 4% · banana · LaCroix",
  },
};

export function MealOptionsPanel({ data }: { data?: MealOptionsData }) {
  const d = data ?? DEFAULT_DATA;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "Nearby · meal options"}
      title={d.title ?? "Meal options near you"}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <MapPin className="h-3 w-3" />
          Nearby
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Window strip */}
        <WindowStrip window={d.window} />

        {d.summary && (
          <p
            className="text-foreground leading-[1.6] text-[0.98rem] m-0"
            style={{ maxWidth: "68ch" }}
          >
            {d.summary}
          </p>
        )}

        {/* Map */}
        {d.map && (d.map.imageUrl || (d.map.markers && d.map.markers.length > 0)) && (
          <MapStrip map={d.map} />
        )}

        {/* Top pick */}
        <div className="flex flex-col gap-3">
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Top pick
          </div>
          <OptionCard option={d.topPick} emphasized />
        </div>

        {/* Alternatives */}
        {d.alternatives && d.alternatives.length > 0 && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Alternates
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {d.alternatives.map((alt) => (
                <OptionCard key={alt.placeName} option={alt} />
              ))}
            </div>
          </div>
        )}

        {/* Backup plan */}
        {d.backup && <BackupCard backup={d.backup} />}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Ranked by timing · travel · meal fit · portability
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

// ============================================================================
// Window strip
// ============================================================================

function WindowStrip({ window: w }: { window: MealOptionsData["window"] }) {
  return (
    <div className="rounded-md border border-border bg-surface-highlight px-4 py-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
        <WindowCell
          label="Window"
          value={`${w.availableMinutes} min`}
          mono
        />
        {w.leaveBy && (
          <WindowCell label="Leave by" value={w.leaveBy} mono />
        )}
        {w.nextEventStart && (
          <WindowCell
            label="Next"
            value={
              w.nextEventTitle
                ? `${w.nextEventTitle} · ${w.nextEventStart}`
                : w.nextEventStart
            }
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-foreground-muted text-[0.82rem]">
        <span className="inline-flex items-center gap-1.5">
          <CircleDot className="h-3 w-3 text-[color:var(--primary)]" />
          <span>{w.anchorLabel}</span>
        </span>
        {w.destinationLabel && (
          <>
            <span className="text-border">→</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              <span>{w.destinationLabel}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function WindowCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
        style={{ letterSpacing: "0.14em" }}
      >
        {label}
      </div>
      <div
        className={cn(
          "text-foreground leading-tight",
          mono
            ? "font-mono text-[0.95rem] tabular-nums"
            : "font-serif text-[1.05rem]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================================
// Map strip — v1 is a static image; fallback is an abstract marker row.
// ============================================================================

function MapStrip({ map }: { map: NonNullable<MealOptionsData["map"]> }) {
  if (map.imageUrl) {
    return (
      <div className="rounded-md border border-border overflow-hidden bg-surface-highlight">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={map.imageUrl}
          alt="Nearby meal options on a map"
          className="w-full h-[220px] object-cover block"
        />
      </div>
    );
  }

  const markers = map.markers ?? [];
  if (markers.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-surface-highlight p-4 flex flex-col gap-3">
      <div
        className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
        style={{ letterSpacing: "0.14em" }}
      >
        Anchor · options · destination
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {markers.map((m, i) => (
          <span
            key={`${m.label}-${i}`}
            className={cn(
              "inline-flex items-center gap-1.5 text-[0.82rem]",
              m.kind === "anchor" && "text-foreground",
              m.kind === "destination" && "text-foreground",
              m.kind === "option" && "text-foreground-muted",
            )}
          >
            <MarkerDot kind={m.kind} />
            <span>{m.label}</span>
            {i < markers.length - 1 && (
              <span className="text-border ml-2">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function MarkerDot({ kind }: { kind: MapMarker["kind"] }) {
  if (kind === "anchor") {
    return (
      <span className="h-2 w-2 rounded-full bg-[color:var(--primary)]" />
    );
  }
  if (kind === "destination") {
    return (
      <span className="h-2 w-2 rounded-full border border-foreground" />
    );
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />;
}

// ============================================================================
// Option card
// ============================================================================

function OptionCard({
  option,
  emphasized = false,
}: {
  option: MealOption;
  emphasized?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-md border bg-surface flex flex-col gap-3 p-4",
        emphasized ? "border-[color:var(--primary)]/60" : "border-border",
      )}
    >
      {/* Header: label + place */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-mono text-[0.58rem] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-sm border",
                emphasized
                  ? "text-[color:var(--primary)] border-[color:var(--primary)]/60"
                  : "text-foreground-muted border-border",
              )}
              style={{ letterSpacing: "0.14em" }}
            >
              {option.label}
            </span>
            {option.openNow === false && (
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted">
                Closed
              </span>
            )}
          </div>
          <h4
            className="font-serif text-[1.2rem] leading-tight text-foreground m-0 truncate"
            style={{ letterSpacing: "-0.01em" }}
          >
            {option.placeName}
          </h4>
          {option.address && (
            <div className="text-[0.78rem] text-foreground-muted truncate">
              {option.address}
            </div>
          )}
        </div>
        <TravelBadge
          mode={option.travelMode}
          minutes={option.travelMinutes}
          detour={option.detourMinutes}
        />
      </div>

      {/* Place metadata row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-foreground-muted font-mono tabular-nums">
        {option.rating !== undefined && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 text-[color:var(--primary)]" />
            <span>{option.rating.toFixed(1)}</span>
          </span>
        )}
        {option.priceLevel !== undefined && (
          <span>{"$".repeat(option.priceLevel)}</span>
        )}
      </div>

      {/* Order */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
        <div
          className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Order
        </div>
        <div className="font-serif text-[1rem] leading-snug text-foreground">
          {option.orderTitle}
        </div>
        {option.orderItems.length > 0 && (
          <ul className="flex flex-col gap-0.5 mt-1">
            {option.orderItems.map((item, i) => (
              <li
                key={i}
                className="text-[0.82rem] text-foreground-muted leading-[1.5] pl-3 relative"
              >
                <span className="absolute left-0 top-[0.65em] h-px w-1.5 bg-border" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Why it fits */}
      <div className="flex flex-col gap-1">
        <div
          className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Why it fits
        </div>
        <p className="text-[0.88rem] text-foreground leading-[1.55] m-0">
          {option.whyItFits}
        </p>
      </div>

      {/* Nutrition */}
      {option.nutrition && <NutritionRow nutrition={option.nutrition} />}

      {/* Maps link */}
      <a
        href={option.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 self-start mt-1",
          "font-mono text-[0.68rem] uppercase tracking-[0.14em]",
          "text-[color:var(--primary)] hover:underline",
        )}
        style={{ letterSpacing: "0.14em" }}
      >
        Open in Maps
        <ArrowUpRight className="h-3 w-3" />
      </a>
    </article>
  );
}

function TravelBadge({
  mode,
  minutes,
  detour,
}: {
  mode: TravelMode;
  minutes: number;
  detour?: number;
}) {
  const Icon =
    mode === "walking"
      ? Footprints
      : mode === "transit"
        ? Train
        : mode === "rideshare"
          ? Car
          : Car;

  return (
    <div className="shrink-0 flex flex-col items-end gap-0.5">
      <div className="inline-flex items-center gap-1.5 text-foreground">
        <Icon className="h-3.5 w-3.5 text-foreground-muted" />
        <span className="font-mono text-[0.88rem] tabular-nums">
          {minutes}
          <span className="text-foreground-muted"> min</span>
        </span>
      </div>
      {detour !== undefined && detour > 0 && (
        <div className="font-mono text-[0.62rem] text-foreground-muted tabular-nums">
          +{detour}m detour
        </div>
      )}
    </div>
  );
}

function NutritionRow({ nutrition }: { nutrition: MealOptionNutrition }) {
  const cells: { label: string; value: string }[] = [];
  if (nutrition.calories !== undefined)
    cells.push({ label: "kcal", value: String(nutrition.calories) });
  if (nutrition.proteinG !== undefined)
    cells.push({ label: "protein", value: `${nutrition.proteinG}g` });
  if (nutrition.carbsG !== undefined)
    cells.push({ label: "carbs", value: `${nutrition.carbsG}g` });
  if (nutrition.fatG !== undefined)
    cells.push({ label: "fat", value: `${nutrition.fatG}g` });
  if (cells.length === 0) return null;

  const sourceLabel =
    nutrition.source === "official"
      ? "Official"
      : nutrition.source === "estimated"
        ? "Estimated"
        : "Low confidence";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <div
          className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Nutrition
        </div>
        <div
          className={cn(
            "font-mono text-[0.58rem] uppercase tracking-[0.14em]",
            nutrition.source === "official"
              ? "text-[color:var(--primary)]"
              : "text-foreground-muted",
          )}
          style={{ letterSpacing: "0.14em" }}
        >
          {sourceLabel}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-border rounded-md overflow-hidden border border-border">
        {cells.map((c) => (
          <div
            key={c.label}
            className="bg-surface px-2.5 py-2 flex flex-col gap-0.5 min-w-0"
          >
            <div
              className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-foreground-muted truncate"
              style={{ letterSpacing: "0.14em" }}
            >
              {c.label}
            </div>
            <div className="font-serif text-[0.95rem] leading-tight text-foreground tabular-nums">
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Backup card
// ============================================================================

function BackupCard({ backup }: { backup: NonNullable<MealOptionsData["backup"]> }) {
  return (
    <div className="rounded-md border border-border bg-surface-highlight px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-foreground-muted" />
        <div
          className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Backup · portable
        </div>
      </div>
      <div className="font-serif text-[1.05rem] leading-snug text-foreground">
        {backup.title}
      </div>
      {backup.order && (
        <div className="font-mono text-[0.72rem] text-foreground-muted">
          {backup.order}
        </div>
      )}
      <p className="text-[0.85rem] text-foreground-muted leading-[1.55] m-0">
        {backup.note}
      </p>
    </div>
  );
}
