"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export type DayTotals = {
  calories?: { current: number; target: number };
  protein_g?: { current: number; target: number };
  carbs_g?: { current: number; target: number };
  fat_g?: { current: number; target: number };
  fiber_g?: { current: number; target: number };
  sodium_mg?: { current: number; target: number };
};

export type LoggedMeal = {
  name: string;
  time?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  notes?: string;
};

export type NutritionLogData = {
  eyebrow?: string;
  title?: string;
  lastMeal?: LoggedMeal;
  earlier?: LoggedMeal[];
  dayTotals: DayTotals;
  watchOut?: string;
  nextMealSuggestion?: {
    description: string;
    examples: string[];
  };
};

const DEFAULT_DATA: NutritionLogData = {
  eyebrow: "Logged · today · 1:17 PM",
  title: "Shake Shack burger + fries",
  lastMeal: {
    name: "SmokeShack single + regular fries",
    time: "1:17 PM",
    calories: 1040,
    protein_g: 32,
    carbs_g: 72,
    fat_g: 62,
    sodium_mg: 1820,
  },
  earlier: [
    {
      name: "Black coffee + toast with peanut butter",
      time: "7:40 AM",
      calories: 310,
      protein_g: 11,
      carbs_g: 32,
      fat_g: 16,
    },
  ],
  dayTotals: {
    calories: { current: 1350, target: 2200 },
    protein_g: { current: 43, target: 150 },
    carbs_g: { current: 104, target: 240 },
    fat_g: { current: 78, target: 70 },
    fiber_g: { current: 7, target: 28 },
    sodium_mg: { current: 1950, target: 2300 },
  },
  watchOut:
    "Sodium is close to the daily cap — prioritize water and skip salty dinner sides.",
  nextMealSuggestion: {
    description:
      "A light, fiber-rich dinner with ~45g lean protein and low sodium.",
    examples: [
      "Grilled salmon + roasted vegetables + lemon",
      "Turkey + spinach wrap on whole wheat + side salad",
      "Miso-glazed tofu, brown rice, steamed broccoli",
    ],
  },
};

export function NutritionLogPanel({ data }: { data?: NutritionLogData }) {
  const d = data ?? DEFAULT_DATA;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "Nutrition log · today"}
      title={d.title ?? "Your day so far"}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <ClipboardList className="h-3 w-3" />
          Logged
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Last meal */}
        {d.lastMeal && (
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <div
                className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
                style={{ letterSpacing: "0.14em" }}
              >
                Just logged
              </div>
              {d.lastMeal.time && (
                <div className="font-mono text-[0.7rem] tabular-nums text-foreground-muted">
                  {d.lastMeal.time}
                </div>
              )}
            </div>
            <h4
              className="font-serif text-[1.3rem] leading-[1.2] text-foreground m-0"
              style={{ letterSpacing: "-0.01em" }}
            >
              {d.lastMeal.name}
            </h4>
            <div className="font-mono text-[0.75rem] text-foreground-muted tabular-nums">
              {d.lastMeal.calories} kcal · {d.lastMeal.protein_g}g P ·{" "}
              {d.lastMeal.carbs_g}g C · {d.lastMeal.fat_g}g F
              {d.lastMeal.sodium_mg !== undefined
                ? ` · ${d.lastMeal.sodium_mg}mg Na`
                : ""}
            </div>
          </div>
        )}

        {/* Day totals */}
        <div className="flex flex-col gap-3 pt-4 border-t border-border">
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Today so far
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <MacroTrack
              label="Calories"
              unit="kcal"
              bucket={d.dayTotals.calories}
            />
            <MacroTrack
              label="Protein"
              unit="g"
              bucket={d.dayTotals.protein_g}
            />
            <MacroTrack
              label="Carbs"
              unit="g"
              bucket={d.dayTotals.carbs_g}
            />
            <MacroTrack label="Fat" unit="g" bucket={d.dayTotals.fat_g} />
            <MacroTrack
              label="Fiber"
              unit="g"
              bucket={d.dayTotals.fiber_g}
            />
            <MacroTrack
              label="Sodium"
              unit="mg"
              bucket={d.dayTotals.sodium_mg}
              inverted
            />
          </div>
        </div>

        {/* Watch out */}
        {d.watchOut && (
          <div className="rounded-md bg-[color:var(--primary)]/10 border border-[color:var(--primary)]/25 px-4 py-3">
            <div
              className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[color:var(--primary)] mb-1"
              style={{ letterSpacing: "0.14em" }}
            >
              Watch out
            </div>
            <p className="text-[0.9rem] text-foreground leading-[1.55]">
              {d.watchOut}
            </p>
          </div>
        )}

        {/* Next meal */}
        {d.nextMealSuggestion && (
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Next meal
            </div>
            <p
              className="text-foreground leading-[1.65] text-[0.95rem]"
              style={{ maxWidth: "62ch" }}
            >
              {d.nextMealSuggestion.description}
            </p>
            <ul className="flex flex-col gap-1.5 mt-1">
              {d.nextMealSuggestion.examples.map((ex, i) => (
                <li
                  key={i}
                  className="text-[0.88rem] text-foreground-muted leading-[1.55] flex items-start gap-2.5"
                >
                  <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--primary)] pt-[0.1rem] shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Estimates refreshed whenever you log a meal
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function MacroTrack({
  label,
  unit,
  bucket,
  inverted = false,
}: {
  label: string;
  unit: string;
  bucket?: { current: number; target: number };
  inverted?: boolean;
}) {
  if (!bucket) return null;
  const pct = Math.max(
    0,
    Math.min(1, bucket.target > 0 ? bucket.current / bucket.target : 0),
  );
  const over = pct >= 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted"
          style={{ letterSpacing: "0.12em" }}
        >
          {label}
        </span>
        <span className="font-mono text-[0.78rem] tabular-nums text-foreground">
          {bucket.current}
          <span className="text-foreground-muted">
            {" "}
            / {bucket.target} {unit}
          </span>
        </span>
      </div>
      <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-[width] duration-500 ease-out",
            over && inverted
              ? "bg-[color:var(--foreground-muted)]"
              : "bg-[color:var(--primary)]",
          )}
          style={{ width: `${Math.min(1, pct) * 100}%` }}
        />
      </div>
    </div>
  );
}
