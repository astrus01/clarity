"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { Plane, Droplets, Sunrise } from "lucide-react";
import { MacroRow, type Macros } from "./meal-pick";

export type OnTheRoadData = {
  eyebrow?: string;
  title?: string;
  situation?: {
    currentPlace: string;
    flight?: {
      from: string;
      to: string;
      departureLocal?: string;
      arrivalLocal?: string;
      durationHours?: number;
    };
  };
  now: {
    recommendation: string;
    where?: string;
    why: string;
    macros?: Macros;
    orderHack?: string;
  };
  onboard: {
    strategy: string;
    hydrationLiters?: number;
    snackIdea?: string;
    skipPlaneMeal?: boolean;
  };
  arrival: {
    localTime?: string;
    firstMealIdea: string;
    why: string;
  };
};

const DEFAULT_DATA: OnTheRoadData = {
  eyebrow: "On the road · LGA → LHR · tonight",
  title: "Eat light now, reset in London",
  situation: {
    currentPlace: "LaGuardia · Terminal B · 80 min to boarding",
    flight: {
      from: "LGA",
      to: "LHR",
      departureLocal: "8:45 PM EST",
      arrivalLocal: "8:30 AM BST",
      durationHours: 6.75,
    },
  },
  now: {
    recommendation: "Cava — grilled chicken bowl, greens base, skip the pita",
    where: "Cava · Terminal B · Gate 47",
    why: "Protein-forward, moderate carbs, low sugar — this is the meal. A salty airport dinner sets up a rough flight.",
    macros: {
      calories: 510,
      protein_g: 42,
      carbs_g: 32,
      fat_g: 20,
      fiber_g: 8,
      sodium_mg: 780,
    },
    orderHack:
      "Sub greens for rice, ask for lemon wedge, double chicken for +18g protein.",
  },
  onboard: {
    strategy:
      "Skip the in-flight meal. You'll sleep better and land hungry, not sluggish. Stretch every 90 minutes.",
    hydrationLiters: 1.2,
    snackIdea: "Plain almonds + an apple, if you must.",
    skipPlaneMeal: true,
  },
  arrival: {
    localTime: "London · 8:30 AM local",
    firstMealIdea:
      "Full English-ish: two eggs, grilled tomato, mushrooms, one slice whole-grain toast, black tea.",
    why: "Eat breakfast on London time to anchor your circadian rhythm. No coffee before 10 AM local or you'll crash at 2 PM.",
  },
};

export function OnTheRoadPanel({ data }: { data?: OnTheRoadData }) {
  const d = data ?? DEFAULT_DATA;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "On the road"}
      title={d.title ?? "Travel day plan"}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <Plane className="h-3 w-3" />
          Travel day
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {d.situation && (
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 font-mono text-[0.72rem] text-foreground-muted">
            <span className="tabular-nums text-foreground">
              {d.situation.currentPlace}
            </span>
            {d.situation.flight && (
              <span className="tabular-nums">
                {d.situation.flight.from} → {d.situation.flight.to}
                {d.situation.flight.departureLocal
                  ? ` · dep ${d.situation.flight.departureLocal}`
                  : ""}
                {d.situation.flight.arrivalLocal
                  ? ` · arr ${d.situation.flight.arrivalLocal}`
                  : ""}
              </span>
            )}
          </div>
        )}

        {/* Three horizons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-md overflow-hidden border border-border">
          <Horizon
            stage="Now"
            stageIcon={<span className="font-mono text-[0.6rem]">01</span>}
          >
            <h4
              className="font-serif text-[1.1rem] leading-[1.25] text-foreground m-0"
              style={{ letterSpacing: "-0.01em" }}
            >
              {d.now.recommendation}
            </h4>
            {d.now.where && (
              <div
                className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted"
                style={{ letterSpacing: "0.12em" }}
              >
                {d.now.where}
              </div>
            )}
            <p className="text-[0.85rem] text-foreground-muted leading-[1.55]">
              {d.now.why}
            </p>
            {d.now.orderHack && (
              <div className="font-mono text-[0.7rem] text-[color:var(--primary)] leading-[1.5]">
                Order hack: {d.now.orderHack}
              </div>
            )}
          </Horizon>

          <Horizon
            stage="Onboard"
            stageIcon={<Droplets className="h-3 w-3" />}
          >
            <p className="text-[0.9rem] text-foreground leading-[1.55]">
              {d.onboard.strategy}
            </p>
            <div className="flex flex-col gap-1 font-mono text-[0.72rem] text-foreground-muted">
              {d.onboard.hydrationLiters !== undefined && (
                <span>
                  Hydration target:{" "}
                  <span className="tabular-nums text-foreground">
                    {d.onboard.hydrationLiters}L
                  </span>{" "}
                  over the flight
                </span>
              )}
              {d.onboard.skipPlaneMeal !== undefined && (
                <span>
                  In-flight meal:{" "}
                  <span className="text-foreground">
                    {d.onboard.skipPlaneMeal ? "skip" : "eat"}
                  </span>
                </span>
              )}
              {d.onboard.snackIdea && (
                <span>Snack: {d.onboard.snackIdea}</span>
              )}
            </div>
          </Horizon>

          <Horizon
            stage="Arrival"
            stageIcon={<Sunrise className="h-3 w-3" />}
          >
            {d.arrival.localTime && (
              <div
                className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted"
                style={{ letterSpacing: "0.12em" }}
              >
                {d.arrival.localTime}
              </div>
            )}
            <h4
              className="font-serif text-[1.05rem] leading-[1.3] text-foreground m-0"
              style={{ letterSpacing: "-0.01em" }}
            >
              {d.arrival.firstMealIdea}
            </h4>
            <p className="text-[0.85rem] text-foreground-muted leading-[1.55]">
              {d.arrival.why}
            </p>
          </Horizon>
        </div>

        {/* Macros for the now pick */}
        {d.now.macros && (
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Macros for tonight's pick
            </div>
            <MacroRow macros={d.now.macros} />
          </div>
        )}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Travel plan · estimates · adjust for your hunger cues
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function Horizon({
  stage,
  stageIcon,
  children,
}: {
  stage: string;
  stageIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface p-5 flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[color:var(--primary)] flex items-center">
          {stageIcon}
        </span>
        <span
          className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--primary)]"
          style={{ letterSpacing: "0.14em" }}
        >
          {stage}
        </span>
      </div>
      {children}
    </div>
  );
}
