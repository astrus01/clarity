import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLARITY_MODEL || "claude-haiku-4-5";

export type MacroEstimate = {
  food: string;
  servingDescription: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  confidence: "low" | "medium" | "high";
  notes?: string;
};

export type NutritionEstimateResult = {
  items: MacroEstimate[];
  total: Omit<MacroEstimate, "food" | "servingDescription" | "confidence" | "notes">;
  watchOut?: string;
};

const SYSTEM = `You are a concise nutrition estimator. Given one or more food descriptions, return a JSON object with realistic macro estimates per item and a combined total.

Rules:
- Use typical restaurant or home-cooked portions unless the user specifies quantity.
- calories, protein_g, carbs_g, fat_g are required integers. fiber_g and sodium_mg are optional integers.
- confidence: "high" for well-known branded items, "medium" for generic dishes, "low" for vague inputs.
- Round everything to whole numbers.
- Include a short "watchOut" string (≤ 20 words) ONLY when one macro is notably high for a single meal — e.g. sodium > 1500mg, saturated fat > 20g, calories > 900 from one meal. Otherwise omit.
- Output STRICT JSON, no prose before or after. No markdown fences.

Shape:
{
  "items": [
    { "food": "...", "servingDescription": "1 bowl, ~14 oz", "calories": 540, "protein_g": 32, "carbs_g": 48, "fat_g": 22, "fiber_g": 6, "sodium_mg": 760, "confidence": "medium", "notes": "..." }
  ],
  "total": { "calories": 540, "protein_g": 32, "carbs_g": 48, "fat_g": 22, "fiber_g": 6, "sodium_mg": 760 },
  "watchOut": "..."  // optional
}`;

export async function estimateNutrition(
  foods: string[],
): Promise<NutritionEstimateResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (foods.length === 0) return null;

  const client = new Anthropic({ apiKey });
  const userContent = `Estimate macros for each item and their combined total.\n\nItems:\n${foods
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n")}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: "user", content: userContent }],
    });

    const text = res.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    const jsonText = extractJsonObject(text);
    if (!jsonText) return null;

    const parsed = JSON.parse(jsonText) as NutritionEstimateResult;
    if (!Array.isArray(parsed.items) || !parsed.total) return null;
    return parsed;
  } catch {
    return null;
  }
}

function extractJsonObject(text: string): string | null {
  const fenced = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  if (fenced.startsWith("{")) return fenced;

  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
