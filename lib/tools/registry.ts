import type Anthropic from "@anthropic-ai/sdk";
import { searchExa } from "./exa";
import { getWeather } from "./weather";
import { listThreads, readThread, findMostUrgent } from "./gmail";
import { listEventsRange, listEventsToday, findFocusBlock } from "./calendar";
import { getQuotes } from "./finance";
import { searchNews, type NewsCategory } from "./news";
import { browsePage } from "./browse";
import { estimateNutrition } from "./nutrition";
import type { PanelKind } from "@/lib/chat/sessions";

export type ToolDispatchResult =
  | { kind: "text"; content: string }
  | { kind: "panel"; panelKind: PanelKind; panelData: unknown; summary: string };

export type ToolSpec = {
  name: string;
  description: string;
  input_schema: Anthropic.Tool["input_schema"];
};

// Anthropic tool definitions — shown to Claude in the system/tools call.
export const TOOLS: ToolSpec[] = [
  {
    name: "web_search",
    description:
      "Semantic web search via Exa. Returns the top N results with title, URL, published date, snippet, and (when available) image + favicon. Use for research, stats, and evergreen questions.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        num_results: { type: "number", description: "1–10 (default 6)" },
      },
      required: ["query"],
    },
  },
  {
    name: "news_search",
    description:
      "Current-day news via NewsAPI. Use for breaking-news / 'what happened today' style questions. Results come with urlToImage thumbnails and outlet names. Prefer this over web_search when the query is about today's news.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: {
          type: "string",
          enum: [
            "business",
            "entertainment",
            "general",
            "health",
            "science",
            "sports",
            "technology",
          ],
        },
        country: { type: "string", description: "2-letter ISO, default 'us'" },
        page_size: { type: "number", description: "1-20 (default 8)" },
      },
    },
  },
  {
    name: "browse_page",
    description:
      "Fetch a single URL and return its title, description, and extracted readable text (≤ 6KB). Use to deep-read a source after web_search or news_search.",
    input_schema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
  },
  {
    name: "weather_forecast",
    description:
      "Current conditions + 7-day forecast for a city. Free via Open-Meteo.",
    input_schema: {
      type: "object",
      properties: { location: { type: "string" } },
      required: ["location"],
    },
  },
  {
    name: "gmail_list",
    description:
      "List the user's recent email threads. Returns real Gmail when connected, fixture inbox otherwise. Each thread has subject, from, snippet, urgency.",
    input_schema: {
      type: "object",
      properties: { max: { type: "number", description: "Default 10" } },
    },
  },
  {
    name: "gmail_most_urgent",
    description:
      "Return the single most urgent thread with full body. Use when the user asks to reply to their most urgent / important email.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "gmail_read",
    description: "Fetch full body of a thread by id.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "calendar_today",
    description:
      "All events on the user's calendar for today. Real Google Calendar when connected, fixture otherwise.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "calendar_upcoming",
    description:
      "Events across a day window, grouped by day. Use for 'this week', 'next Thursday', 'upcoming events'. days_back defaults 0, days_ahead defaults 7. Max 30. Pass to render_panel(calendar, {days: [...]}).",
    input_schema: {
      type: "object",
      properties: {
        days_back: { type: "number" },
        days_ahead: { type: "number" },
      },
    },
  },
  {
    name: "calendar_find_focus_block",
    description:
      "Largest open block of time today of at least N minutes.",
    input_schema: {
      type: "object",
      properties: { min_minutes: { type: "number" } },
      required: ["min_minutes"],
    },
  },
  {
    name: "stock_quotes",
    description:
      "Quote data for a list of ticker symbols: price, change, change percent, 8-point series. Legacy — rarely needed in the health-coach product.",
    input_schema: {
      type: "object",
      properties: {
        symbols: { type: "array", items: { type: "string" } },
      },
      required: ["symbols"],
    },
  },
  {
    name: "nutrition_estimate",
    description:
      "Estimate calories, protein, carbs, fat, fiber, sodium for one or more foods. Pass each food as a plain-English description ('SmokeShack burger single with regular fries', 'grilled salmon poke bowl with brown rice'). Returns per-item macros plus a combined total and an optional 'watchOut' note when a macro is high. Use this any time you need to put numbers on a food the user mentions or recommends.",
    input_schema: {
      type: "object",
      properties: {
        foods: {
          type: "array",
          items: { type: "string" },
          description: "One or more food/meal descriptions.",
        },
      },
      required: ["foods"],
    },
  },
  {
    name: "render_panel",
    description:
      "Emit an interactive UI panel as the final answer. Choose the kind that best fits the data. Call this INSTEAD of writing prose. After calling this tool, end your turn with a short one-sentence caption in plain text.",
    input_schema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: [
            "meal-pick",
            "fridge-scan",
            "nutrition-log",
            "on-the-road",
            "news-brief",
            "email-draft",
            "inbox",
            "comparison-table",
            "calendar",
            "weather-brief",
            "timeline-plan",
            "globe",
            "stock-watch",
          ],
        },
        data: {
          type: "object",
          description:
            "Data blob matching the panel kind's contract (see system prompt).",
        },
      },
      required: ["kind", "data"],
    },
  },
];

export async function dispatchTool(
  name: string,
  input: Record<string, unknown>,
): Promise<ToolDispatchResult> {
  switch (name) {
    case "web_search": {
      const query = String(input.query ?? "");
      const num = Number(input.num_results ?? 6);
      const results = await searchExa(query, { numResults: num });
      if (results.length === 0) {
        return {
          kind: "text",
          content:
            "No results. Proceed to render_panel anyway with what you know; set stories=[] and put an explanation in keyFacts.",
        };
      }
      const trimmed = results.map((r) => ({
        title: r.title,
        url: r.url,
        publishedDate: r.publishedDate,
        image: r.image,
        favicon: r.favicon,
        snippet: r.text?.slice(0, 700),
      }));
      return { kind: "text", content: JSON.stringify(trimmed, null, 2) };
    }

    case "news_search": {
      const results = await searchNews({
        query: input.query ? String(input.query) : undefined,
        category: input.category
          ? (String(input.category) as NewsCategory)
          : undefined,
        country: input.country ? String(input.country) : undefined,
        pageSize: Number(input.page_size ?? 8),
      });
      if (results.length === 0) {
        return {
          kind: "text",
          content:
            "NEWS_API_KEY missing or no results. Fall back to web_search and then render_panel.",
        };
      }
      return { kind: "text", content: JSON.stringify(results, null, 2) };
    }

    case "browse_page": {
      const url = String(input.url ?? "");
      const page = await browsePage(url);
      if (!page) {
        return { kind: "text", content: `Could not fetch ${url}.` };
      }
      return { kind: "text", content: JSON.stringify(page) };
    }

    case "weather_forecast": {
      const location = String(input.location ?? "");
      const data = await getWeather(location);
      if (!data) {
        return { kind: "text", content: `Weather lookup failed for "${location}".` };
      }
      return { kind: "text", content: JSON.stringify(data) };
    }

    case "gmail_list": {
      const max = Number(input.max ?? 10);
      const threads = await listThreads(max);
      return { kind: "text", content: JSON.stringify(threads) };
    }

    case "gmail_most_urgent": {
      const thread = await findMostUrgent();
      return { kind: "text", content: JSON.stringify(thread) };
    }

    case "gmail_read": {
      const id = String(input.id ?? "");
      const thread = await readThread(id);
      if (!thread) return { kind: "text", content: `No thread with id "${id}".` };
      return { kind: "text", content: JSON.stringify(thread) };
    }

    case "calendar_today": {
      const events = await listEventsToday();
      return { kind: "text", content: JSON.stringify(events) };
    }

    case "calendar_upcoming": {
      const days = await listEventsRange({
        daysBack: Number(input.days_back ?? 0),
        daysAhead: Number(input.days_ahead ?? 7),
      });
      return { kind: "text", content: JSON.stringify(days) };
    }

    case "calendar_find_focus_block": {
      const mins = Number(input.min_minutes ?? 120);
      const block = await findFocusBlock(mins);
      return {
        kind: "text",
        content: block
          ? JSON.stringify(block)
          : `No open block of at least ${mins} minutes today.`,
      };
    }

    case "stock_quotes": {
      const symbols = Array.isArray(input.symbols)
        ? (input.symbols as unknown[]).map(String)
        : [];
      return { kind: "text", content: JSON.stringify(getQuotes(symbols)) };
    }

    case "nutrition_estimate": {
      const foods = Array.isArray(input.foods)
        ? (input.foods as unknown[]).map(String).filter(Boolean)
        : [];
      if (foods.length === 0) {
        return {
          kind: "text",
          content: "nutrition_estimate needs a non-empty 'foods' array.",
        };
      }
      const result = await estimateNutrition(foods);
      if (!result) {
        return {
          kind: "text",
          content:
            "nutrition_estimate failed (missing ANTHROPIC_API_KEY or parse error). Proceed with your own best-guess macros.",
        };
      }
      return { kind: "text", content: JSON.stringify(result) };
    }

    case "render_panel": {
      const kind = String(input.kind ?? "") as PanelKind;
      const data = (input.data ?? {}) as unknown;
      return {
        kind: "panel",
        panelKind: kind,
        panelData: data,
        summary: `Rendered ${kind} panel.`,
      };
    }

    default:
      return { kind: "text", content: `Unknown tool: ${name}` };
  }
}

export function shortDetailFor(
  name: string,
  input: Record<string, unknown>,
): string {
  switch (name) {
    case "web_search":
      return `"${String(input.query ?? "").slice(0, 60)}"`;
    case "news_search":
      return input.query
        ? `"${String(input.query).slice(0, 50)}"`
        : `${input.category ?? "top headlines"}`;
    case "browse_page":
      return hostFromUrl(String(input.url ?? ""));
    case "weather_forecast":
      return String(input.location ?? "");
    case "gmail_list":
      return `${input.max ?? 10} threads`;
    case "gmail_read":
      return `thread ${input.id}`;
    case "gmail_most_urgent":
      return "ranking unread threads";
    case "calendar_today":
      return "today";
    case "calendar_upcoming":
      return `${input.days_back ?? 0}d back · ${input.days_ahead ?? 7}d ahead`;
    case "calendar_find_focus_block":
      return `≥ ${input.min_minutes ?? 120}min`;
    case "stock_quotes":
      return Array.isArray(input.symbols)
        ? (input.symbols as unknown[]).slice(0, 6).join(" · ")
        : "";
    case "nutrition_estimate":
      return Array.isArray(input.foods)
        ? `${(input.foods as unknown[]).length} item${(input.foods as unknown[]).length === 1 ? "" : "s"}`
        : "";
    case "render_panel":
      return `kind: ${input.kind}`;
    default:
      return "";
  }
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}
