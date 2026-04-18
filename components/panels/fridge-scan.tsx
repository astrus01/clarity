"use client";

import { PanelFrame, PanelFooter } from "@/components/chat/panel-frame";
import { Refrigerator, Clock, ChefHat } from "lucide-react";
import { MacroRow, type Macros } from "./meal-pick";

export type Recipe = {
  name: string;
  prepMinutes: number;
  difficulty?: "easy" | "medium" | "hard";
  macros: Macros;
  tags?: string[];
  missingIngredients?: string[];
  steps: string[];
};

export type FridgeScanData = {
  eyebrow?: string;
  title?: string;
  ingredients: string[];
  recipes: Recipe[];
  note?: string;
};

const DEFAULT_DATA: FridgeScanData = {
  eyebrow: "Fridge scan · 4 ingredients",
  title: "Three dinners in under 20 minutes",
  ingredients: ["3 eggs", "leftover rice", "half onion", "frozen spinach"],
  note: "Staples assumed: oil, salt, pepper, soy sauce, garlic.",
  recipes: [
    {
      name: "Fried rice with eggs and spinach",
      prepMinutes: 12,
      difficulty: "easy",
      macros: {
        calories: 520,
        protein_g: 22,
        carbs_g: 58,
        fat_g: 18,
        fiber_g: 5,
        sodium_mg: 680,
      },
      tags: ["one-pan", "high-protein"],
      steps: [
        "Thaw spinach, squeeze dry.",
        "Dice onion. Sauté in oil 3 min.",
        "Add rice, spinach, soy sauce. 4 min, high heat.",
        "Push rice aside; scramble eggs, fold through.",
      ],
    },
    {
      name: "Spinach + onion frittata",
      prepMinutes: 18,
      difficulty: "easy",
      macros: {
        calories: 340,
        protein_g: 24,
        carbs_g: 8,
        fat_g: 22,
        fiber_g: 3,
      },
      tags: ["low-carb", "oven"],
      missingIngredients: ["cheese (optional)"],
      steps: [
        "Preheat oven 375°F.",
        "Sauté onion + thawed spinach.",
        "Whisk eggs, salt, pepper.",
        "Pour in oven-safe pan, 12 min bake.",
      ],
    },
    {
      name: "Egg drop rice soup",
      prepMinutes: 10,
      difficulty: "easy",
      macros: {
        calories: 410,
        protein_g: 20,
        carbs_g: 54,
        fat_g: 12,
        fiber_g: 4,
        sodium_mg: 1200,
      },
      tags: ["one-pot", "comfort"],
      missingIngredients: ["broth (2 cups)"],
      steps: [
        "Simmer broth + rice 4 min.",
        "Add spinach + diced onion.",
        "Stream beaten eggs in while stirring.",
        "Season with soy + pepper.",
      ],
    },
  ],
};

export function FridgeScanPanel({ data }: { data?: FridgeScanData }) {
  const d = data ?? DEFAULT_DATA;
  const ingredients = d.ingredients?.length
    ? d.ingredients
    : DEFAULT_DATA.ingredients;
  const recipes = d.recipes?.length ? d.recipes : DEFAULT_DATA.recipes;

  return (
    <PanelFrame
      eyebrow={d.eyebrow ?? `Fridge scan · ${ingredients.length} ingredients`}
      title={d.title ?? `${recipes.length} dinners ready to go`}
      meta={
        <div className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground-muted">
          <Refrigerator className="h-3 w-3" />
          On hand
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Ingredients row */}
        <div className="flex flex-col gap-2">
          <div
            className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            From your fridge
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ing, i) => (
              <span
                key={i}
                className="font-mono text-[0.75rem] text-foreground bg-surface border border-border rounded-full px-3 py-1"
              >
                {ing}
              </span>
            ))}
          </div>
          {d.note && (
            <p className="text-[0.8rem] text-foreground-muted italic mt-1">
              {d.note}
            </p>
          )}
        </div>

        {/* Recipes */}
        <div className="flex flex-col gap-4">
          {recipes.slice(0, 4).map((r, i) => (
            <RecipeCard key={i} recipe={r} index={i + 1} />
          ))}
        </div>

        <PanelFooter>
          <span
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted"
            style={{ letterSpacing: "0.14em" }}
          >
            Prep times assume basic knife skills · macros are estimates
          </span>
        </PanelFooter>
      </div>
    </PanelFrame>
  );
}

function RecipeCard({ recipe, index }: { recipe: Recipe; index: number }) {
  return (
    <article className="rounded-md border border-border bg-surface p-5 flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-foreground-muted tabular-nums"
            style={{ letterSpacing: "0.14em" }}
          >
            Recipe {String(index).padStart(2, "0")}
          </div>
          <h4
            className="font-serif text-[1.35rem] leading-[1.2] text-foreground m-0"
            style={{ letterSpacing: "-0.01em" }}
          >
            {recipe.name}
          </h4>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-[0.7rem] text-foreground-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="tabular-nums text-foreground">
              {recipe.prepMinutes}
            </span>
            m
          </span>
          {recipe.difficulty && (
            <span className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              {recipe.difficulty}
            </span>
          )}
        </div>
      </header>

      <MacroRow macros={recipe.macros} />

      {(recipe.tags || recipe.missingIngredients) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {recipe.tags?.map((t) => (
            <span
              key={t}
              className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--primary)]"
              style={{ letterSpacing: "0.12em" }}
            >
              {t}
            </span>
          ))}
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <span className="font-mono text-[0.65rem] text-foreground-muted">
              check you have: {recipe.missingIngredients.join(", ")}
            </span>
          )}
        </div>
      )}

      <ol className="flex flex-col gap-1.5 pl-0">
        {recipe.steps.map((s, i) => (
          <li
            key={i}
            className="text-[0.88rem] text-foreground leading-[1.55] flex items-start gap-3"
          >
            <span className="font-mono text-[0.65rem] tabular-nums text-foreground-muted pt-[0.2rem] shrink-0 w-5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
