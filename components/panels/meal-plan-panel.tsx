"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { MacroRow, type Macros } from "./meal-pick";
import { Utensils, ChefHat, ShoppingBasket, CalendarClock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export type MealPlanScheduleBlock = {
  label: string; // "Class", "Workout", "ECE class"
  start: string; // "11:00 AM"
  end: string;
  kind?: "class" | "workout" | "meeting" | "travel" | "other";
};

export type EatOutPick = {
  name: string;
  dish: string;
  where?: string; // "Midtown · 0.6 mi"
  walkMinutes?: number;
  priceBand?: "$" | "$$" | "$$$";
  macros?: Macros;
  reason?: string;
  url?: string;
};

export type CookAtHomePick = {
  name: string;
  prepMinutes: number;
  approxCost?: string; // "$8–10"
  macros?: Macros;
  ingredients?: string[];
  steps?: string[];
  reason?: string;
};

export type GroceryDeal = {
  item: string;
  price: string; // "$3.99/lb"
  store?: string; // defaults to the block's store name
  note?: string; // "BOGO thru Sun"
};

export type MealPlanData = {
  eyebrow?: string; // "Tuesday · Apr 21 · Atlanta"
  title?: string; // "Dinner plan around your 6:15 PM class"
  intro?: string;

  adaptedTo?: string[]; // ["higher protein", "budget-friendly", "student"]

  schedule?: MealPlanScheduleBlock[];

  targetMeal?: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  targetWindow?: string; // "After 6:15 PM" / "12:15–1:00 PM"

  eatOut?: EatOutPick[];
  cookAtHome?: CookAtHomePick[];

  groceries?: {
    store: string;
    distance?: string; // "0.8 mi"
    note?: string;
    deals: GroceryDeal[];
  };
};

const DEFAULT_DATA: MealPlanData = {
  eyebrow: "Tuesday · Apr 21 · Atlanta",
  title: "Dinner plan after your 6:15 PM class",
  intro:
    "Class until 6:15 PM with a workout between classes — dinner window opens around 6:30. Two picks below tuned for a post-workout protein bias without sitting heavy before study time.",
  adaptedTo: ["higher protein", "student budget", "walkable"],
  schedule: [
    { label: "Class · BIOL 1510", start: "11:00 AM", end: "12:15 PM", kind: "class" },
    { label: "Lunch · Sweetgreen", start: "12:30 PM", end: "1:15 PM", kind: "other" },
    { label: "Workout · CRC", start: "3:30 PM", end: "4:30 PM", kind: "workout" },
    { label: "ECE 2020", start: "5:00 PM", end: "6:15 PM", kind: "class" },
  ],
  targetMeal: "Dinner",
  targetWindow: "6:30–7:30 PM",
  eatOut: [
    {
      name: "Hartley Kitchen",
      dish: "Grilled salmon + roasted veg",
      where: "Midtown · 0.9 mi",
      walkMinutes: 12,
      priceBand: "$$",
      macros: { calories: 520, protein_g: 42, carbs_g: 34, fat_g: 22, fiber_g: 8 },
      reason:
        "Lean protein + slow carbs — satisfying without sitting heavy before study time.",
      url: "https://www.google.com/maps/search/Hartley+Kitchen+Midtown+Atlanta",
    },
    {
      name: "Nan Thai",
      dish: "Basil chicken, brown rice",
      where: "Midtown · 0.7 mi",
      walkMinutes: 9,
      priceBand: "$$",
      macros: { calories: 580, protein_g: 38, carbs_g: 58, fat_g: 16 },
      reason: "Faster, lighter option if Hartley's wait looks long.",
    },
  ],
  cookAtHome: [
    {
      name: "Sheet-pan chicken + broccoli + sweet potato",
      prepMinutes: 28,
      approxCost: "$8",
      macros: { calories: 560, protein_g: 46, carbs_g: 48, fat_g: 16, fiber_g: 10 },
      ingredients: [
        "1 lb chicken thighs",
        "1 head broccoli",
        "1 medium sweet potato",
        "olive oil · garlic · salt · paprika",
      ],
      steps: [
        "425°F · oil + salt + paprika on everything",
        "Sweet potato 25 min head start",
        "Add chicken + broccoli · 18 min",
        "Rest 4 min · squeeze of lemon",
      ],
      reason: "High-protein, cheap, and leftovers work as tomorrow's lunch.",
    },
  ],
  groceries: {
    store: "Publix · Midtown",
    distance: "0.8 mi",
    note: "Closes 10 PM — easy detour from class back to apartment.",
    deals: [
      { item: "Boneless chicken thighs", price: "$3.99/lb", note: "BOGO thru Sun" },
      { item: "Sweet potatoes (3 lb bag)", price: "$2.49" },
      { item: "Broccoli crowns", price: "$1.99/lb", note: "Weekly deal" },
      { item: "Greek yogurt (32 oz)", price: "$4.49", note: "Protein-rich staple" },
    ],
  },
};

export function MealPlanPanel({ data }: { data?: MealPlanData }) {
  const d = (data && Object.keys(data).length > 0 ? data : DEFAULT_DATA) as MealPlanData;
  const eatOut = d.eatOut ?? [];
  const cook = d.cookAtHome ?? [];

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? "Meal plan"}
      title={d.title ?? "Today's plan"}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <CalendarClock className="h-3 w-3" />
          Day-aware
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {d.intro && (
          <p
            className="text-foreground leading-[1.65] text-[0.95rem]"
            style={{ maxWidth: "68ch" }}
          >
            {d.intro}
          </p>
        )}

        {d.adaptedTo && d.adaptedTo.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              Adapted to
            </span>
            {d.adaptedTo.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--primary)]/35 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[color:var(--primary)]"
                style={{ letterSpacing: "0.1em" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Day shape — full-width schedule strip */}
        {d.schedule && d.schedule.length > 0 && (
          <div className="pt-1">
            <ScheduleColumn blocks={d.schedule} targetWindow={d.targetWindow} />
          </div>
        )}

        {/* The actual recommendation — eat out | cook at home */}
        {(eatOut.length > 0 || cook.length > 0) && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
              style={{ letterSpacing: "0.14em" }}
            >
              {d.targetMeal ?? "Next meal"}
              {d.targetWindow ? ` · ${d.targetWindow}` : ""}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {eatOut.length > 0 && <EatOutColumn picks={eatOut} />}
              {cook.length > 0 && <CookColumn picks={cook} />}
            </div>
          </div>
        )}

        {/* Groceries / deals */}
        {d.groceries && d.groceries.deals.length > 0 && (
          <GrocerySection groceries={d.groceries} />
        )}

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Plan adapts to your day · macros ± 15%
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function ScheduleColumn({
  blocks,
  targetWindow,
}: {
  blocks: MealPlanScheduleBlock[];
  targetWindow?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
        style={{ letterSpacing: "0.14em" }}
      >
        Day shape
      </div>
      <ol className="flex flex-col gap-1.5">
        {blocks.map((b, i) => (
          <li
            key={`${b.label}-${i}`}
            className="flex items-baseline gap-3 text-[0.9rem]"
          >
            <span className="font-mono text-[0.7rem] tabular-nums text-foreground-muted w-[112px] shrink-0">
              {b.start}
              <span className="px-1 text-border">·</span>
              {b.end}
            </span>
            <span className="text-foreground leading-snug truncate">{b.label}</span>
          </li>
        ))}
        {targetWindow && (
          <li className="flex items-baseline gap-3 text-[0.9rem] pt-0.5">
            <span
              className="font-mono text-[0.7rem] tabular-nums w-[112px] shrink-0"
              style={{ color: "color-mix(in oklch, var(--primary) 85%, transparent)" }}
            >
              {targetWindow}
            </span>
            <span
              className="leading-snug italic"
              style={{ color: "color-mix(in oklch, var(--primary) 85%, transparent)" }}
            >
              Dinner window
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

function EatOutColumn({ picks }: { picks: EatOutPick[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface/50 p-4">
      <div className="flex items-center gap-1.5">
        <Utensils className="h-3.5 w-3.5 text-foreground-muted" />
        <span
          className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Eat out
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {picks.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            className={cn(
              "flex flex-col gap-2",
              i > 0 && "pt-3 border-t border-border/60",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <div className="font-serif text-[1.05rem] leading-snug text-foreground">
                  {p.name}
                </div>
                <div className="text-[0.85rem] text-foreground-muted leading-snug">
                  {p.dish}
                </div>
              </div>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[color:var(--primary)] hover:underline shrink-0"
                  style={{ letterSpacing: "0.1em" }}
                >
                  Map ↗
                </a>
              )}
            </div>
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted flex items-center gap-2"
              style={{ letterSpacing: "0.12em" }}
            >
              {p.where && <span>{p.where}</span>}
              {p.walkMinutes !== undefined && <span>· {p.walkMinutes} min walk</span>}
              {p.priceBand && <span>· {p.priceBand}</span>}
            </div>
            {p.macros && <MacroRow macros={p.macros} />}
            {p.reason && (
              <p className="text-[0.85rem] text-foreground-muted leading-[1.55]">
                {p.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CookColumn({ picks }: { picks: CookAtHomePick[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface/50 p-4">
      <div className="flex items-center gap-1.5">
        <ChefHat className="h-3.5 w-3.5 text-foreground-muted" />
        <span
          className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
          style={{ letterSpacing: "0.14em" }}
        >
          Cook at home
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {picks.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            className={cn(
              "flex flex-col gap-2",
              i > 0 && "pt-3 border-t border-border/60",
            )}
          >
            <div className="font-serif text-[1.05rem] leading-snug text-foreground">
              {p.name}
            </div>
            <div
              className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted flex items-center gap-2"
              style={{ letterSpacing: "0.12em" }}
            >
              <span>{p.prepMinutes} min prep</span>
              {p.approxCost && <span>· {p.approxCost}</span>}
            </div>
            {p.macros && <MacroRow macros={p.macros} />}
            {p.ingredients && p.ingredients.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                <div
                  className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
                  style={{ letterSpacing: "0.14em" }}
                >
                  Ingredients
                </div>
                <ul className="flex flex-col gap-0.5 text-[0.85rem] text-foreground-muted leading-snug">
                  {p.ingredients.map((ing, j) => (
                    <li key={j}>· {ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.steps && p.steps.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                <div
                  className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
                  style={{ letterSpacing: "0.14em" }}
                >
                  Steps
                </div>
                <ol className="flex flex-col gap-0.5 text-[0.85rem] text-foreground-muted leading-snug">
                  {p.steps.map((s, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--primary)] pt-[1px] shrink-0">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {p.reason && (
              <p className="text-[0.85rem] text-foreground-muted leading-[1.55] pt-1">
                {p.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GrocerySection({
  groceries,
}: {
  groceries: NonNullable<MealPlanData["groceries"]>;
}) {
  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <ShoppingBasket className="h-3.5 w-3.5 text-foreground-muted" />
          <span
            className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Groceries nearby
          </span>
        </div>
        <span className="font-serif text-[0.95rem] text-foreground">
          {groceries.store}
          {groceries.distance && (
            <span className="text-foreground-muted"> · {groceries.distance}</span>
          )}
        </span>
      </div>
      {groceries.note && (
        <p className="text-[0.85rem] text-foreground-muted leading-snug max-w-[62ch]">
          {groceries.note}
        </p>
      )}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {groceries.deals.map((deal, i) => (
          <li
            key={`${deal.item}-${i}`}
            className="flex items-start gap-3 rounded-md border border-border/70 bg-surface/60 px-3 py-2"
          >
            <Tag className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[color:var(--primary)]" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[0.9rem] text-foreground truncate">
                  {deal.item}
                </span>
                <span className="font-mono text-[0.8rem] tabular-nums text-foreground shrink-0">
                  {deal.price}
                </span>
              </div>
              {deal.note && (
                <div className="text-[0.75rem] text-foreground-muted leading-snug">
                  {deal.note}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

