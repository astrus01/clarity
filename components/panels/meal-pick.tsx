"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

export type Macros = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
};

export type MealAlternate = {
  name: string;
  reason?: string;
  where?: string;
  macros?: Macros;
};

export type MealPickData = {
  eyebrow?: string;
  title?: string;
  context?: string;
  topPick: {
    name: string;
    reason: string;
    where?: string;
    macros: Macros;
    tips?: string[];
  };
  alternates?: MealAlternate[];
  todayProgress?: {
    calories?: { current: number; target: number };
    protein_g?: { current: number; target: number };
    fiber_g?: { current: number; target: number };
    sodium_mg?: { current: number; target: number };
  };
};

const DEFAULT_DATA: MealPickData = {
  eyebrow: "Right now · 1:42 PM · Midtown",
  title: "Poke bowl, skip the spicy mayo",
  context:
    "Back-to-back calls until 6:00 PM. You want protein and fiber that won't sit heavy.",
  topPick: {
    name: "Salmon poke bowl — brown rice, edamame, cucumber, avocado",
    reason:
      "Lean protein + slow carbs + unsaturated fat. Keeps you sharp for the 3:00 live hit without a crash at 4:30.",
    where: "Sweetgreen · 42nd & 6th",
    macros: {
      calories: 560,
      protein_g: 34,
      carbs_g: 58,
      fat_g: 18,
      fiber_g: 9,
      sodium_mg: 720,
    },
    tips: [
      "Ask for half the sauce",
      "Swap white rice for brown",
      "Add a second scoop of edamame for +8g protein",
    ],
  },
  alternates: [
    {
      name: "Grilled chicken Greek salad",
      where: "Chopt · 41st",
      reason: "Higher protein, fewer carbs if you want to stay lighter.",
      macros: { calories: 460, protein_g: 42, carbs_g: 22, fat_g: 22 },
    },
    {
      name: "Turkey + hummus wrap",
      where: "Pret",
      reason: "Fastest grab — 4 min line, eats at your desk.",
      macros: { calories: 520, protein_g: 28, carbs_g: 54, fat_g: 18 },
    },
  ],
};

export function MealPickPanel({ data }: { data?: MealPickData }) {
  const d = data ?? DEFAULT_DATA;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "Meal pick · right now"}
      title={d.title ?? "Your next move"}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <Utensils className="h-3 w-3" />
          Single pick
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {d.context && (
          <p
            className="text-foreground-muted leading-[1.7] text-[0.9rem] italic"
            style={{ maxWidth: "62ch" }}
          >
            {d.context}
          </p>
        )}

        {/* Top pick — headline block */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h4
              className="font-serif text-[1.7rem] leading-[1.15] text-foreground m-0"
              style={{ letterSpacing: "-0.015em" }}
            >
              {d.topPick.name}
            </h4>
            {d.topPick.where && (
              <div
                className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-foreground-muted"
                style={{ letterSpacing: "0.12em" }}
              >
                {d.topPick.where}
              </div>
            )}
          </div>

          <p
            className="text-foreground leading-[1.65] text-[0.95rem]"
            style={{ maxWidth: "62ch" }}
          >
            {d.topPick.reason}
          </p>

          <MacroRow macros={d.topPick.macros} />

          {d.topPick.tips && d.topPick.tips.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {d.topPick.tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-[0.88rem] text-foreground-muted leading-[1.55] flex items-start gap-2.5"
                >
                  <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--primary)] pt-[0.1rem] shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Alternates */}
        {d.alternates && d.alternates.length > 0 && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              If not that · {d.alternates.length} alternate
              {d.alternates.length === 1 ? "" : "s"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {d.alternates.slice(0, 4).map((alt, i) => (
                <AlternateCard key={i} alt={alt} />
              ))}
            </div>
          </div>
        )}

        {/* Today progress */}
        {d.todayProgress && (
          <div className="flex flex-col gap-2.5 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Today so far (with this pick)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
              {d.todayProgress.calories && (
                <ProgressTrack
                  label="Calories"
                  current={d.todayProgress.calories.current}
                  target={d.todayProgress.calories.target}
                  unit="kcal"
                />
              )}
              {d.todayProgress.protein_g && (
                <ProgressTrack
                  label="Protein"
                  current={d.todayProgress.protein_g.current}
                  target={d.todayProgress.protein_g.target}
                  unit="g"
                />
              )}
              {d.todayProgress.fiber_g && (
                <ProgressTrack
                  label="Fiber"
                  current={d.todayProgress.fiber_g.current}
                  target={d.todayProgress.fiber_g.target}
                  unit="g"
                />
              )}
              {d.todayProgress.sodium_mg && (
                <ProgressTrack
                  label="Sodium"
                  current={d.todayProgress.sodium_mg.current}
                  target={d.todayProgress.sodium_mg.target}
                  unit="mg"
                  inverted
                />
              )}
            </div>
          </div>
        )}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Macros are estimates · ± 15%
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

export function MacroRow({ macros }: { macros: Macros }) {
  const cells: { label: string; value: string }[] = [
    { label: "kcal", value: String(macros.calories) },
    { label: "protein", value: `${macros.protein_g}g` },
    { label: "carbs", value: `${macros.carbs_g}g` },
    { label: "fat", value: `${macros.fat_g}g` },
  ];
  if (macros.fiber_g !== undefined)
    cells.push({ label: "fiber", value: `${macros.fiber_g}g` });
  if (macros.sodium_mg !== undefined)
    cells.push({ label: "sodium", value: `${macros.sodium_mg}mg` });

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-px bg-border rounded-md overflow-hidden border border-border">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-surface px-3 py-2.5 flex flex-col gap-0.5 min-w-0"
        >
          <div
            className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-muted truncate"
            style={{ letterSpacing: "0.14em" }}
          >
            {c.label}
          </div>
          <div className="font-serif text-[1.05rem] leading-tight text-foreground tabular-nums">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlternateCard({ alt }: { alt: MealAlternate }) {
  return (
    <div className="rounded-md border border-border bg-surface px-4 py-3 flex flex-col gap-1.5">
      <div className="font-serif text-[1.05rem] leading-snug text-foreground">
        {alt.name}
      </div>
      {alt.where && (
        <div
          className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-foreground-muted"
          style={{ letterSpacing: "0.12em" }}
        >
          {alt.where}
        </div>
      )}
      {alt.reason && (
        <div className="text-[0.85rem] text-foreground-muted leading-[1.5]">
          {alt.reason}
        </div>
      )}
      {alt.macros && (
        <div className="font-mono text-[0.7rem] text-foreground-muted tabular-nums pt-1">
          {alt.macros.calories} kcal · {alt.macros.protein_g}g P ·{" "}
          {alt.macros.carbs_g}g C · {alt.macros.fat_g}g F
        </div>
      )}
    </div>
  );
}

function ProgressTrack({
  label,
  current,
  target,
  unit,
  inverted = false,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  inverted?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, target > 0 ? current / target : 0));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted"
          style={{ letterSpacing: "0.12em" }}
        >
          {label}
        </span>
        <span className="font-mono text-[0.75rem] tabular-nums text-foreground">
          {current}
          <span className="text-foreground-muted">
            {" "}
            / {target} {unit}
          </span>
        </span>
      </div>
      <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-[width] duration-500 ease-out",
            inverted && pct > 0.9
              ? "bg-[color:var(--foreground-muted)]"
              : "bg-[color:var(--primary)]",
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}
