import type Anthropic from "@anthropic-ai/sdk";
import { searchExa } from "./exa";
import { getWeather } from "./weather";
import { listThreads, readThread, findMostUrgent } from "./gmail";
import { listEventsToday, findFocusBlock } from "./calendar";
import { getQuotes } from "./finance";
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
      "Semantic web search via Exa. Returns the top N results with title, URL, and extracted text snippet. Use for news, research, and any up-to-the-minute questions.",
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
    name: "weather_forecast",
    description:
      "Get current conditions and a 7-day forecast for a city. Free via Open-Meteo, no key.",
    input_schema: {
      type: "object",
      properties: { location: { type: "string" } },
      required: ["location"],
    },
  },
  {
    name: "gmail_list",
    description:
      "List the user's recent email threads (mock data for hackathon). Returns subject, from, snippet, urgency.",
    input_schema: {
      type: "object",
      properties: { max: { type: "number", description: "Default 10" } },
    },
  },
  {
    name: "gmail_most_urgent",
    description:
      "Return the single most urgent unread thread, with full body. Use when the user asks to reply to their most urgent / important email.",
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
    description: "List all events on the user's calendar for today.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "calendar_find_focus_block",
    description:
      "Find the largest open block of time on today's calendar of at least the given duration (minutes).",
    input_schema: {
      type: "object",
      properties: { min_minutes: { type: "number" } },
      required: ["min_minutes"],
    },
  },
  {
    name: "stock_quotes",
    description:
      "Get quote data for a list of ticker symbols. Returns price, change, change percent, and an 8-point series.",
    input_schema: {
      type: "object",
      properties: {
        symbols: { type: "array", items: { type: "string" } },
      },
      required: ["symbols"],
    },
  },
  {
    name: "render_panel",
    description:
      "Emit an interactive UI panel as the final answer. Choose the kind that best fits the data. The panel renders inline in the chat thread — call this INSTEAD of writing prose when a visual is a better answer. After calling this tool, end your turn with a short one-sentence caption in plain text.",
    input_schema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: [
            "news-brief",
            "email-draft",
            "comparison-table",
            "calendar",
            "globe",
            "stock-watch",
            "weather-brief",
            "timeline-plan",
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
      return { kind: "text", content: JSON.stringify(listThreads(max)) };
    }

    case "gmail_most_urgent": {
      return { kind: "text", content: JSON.stringify(findMostUrgent()) };
    }

    case "gmail_read": {
      const id = String(input.id ?? "");
      const thread = readThread(id);
      if (!thread) return { kind: "text", content: `No thread with id "${id}".` };
      return { kind: "text", content: JSON.stringify(thread) };
    }

    case "calendar_today": {
      return { kind: "text", content: JSON.stringify(listEventsToday()) };
    }

    case "calendar_find_focus_block": {
      const mins = Number(input.min_minutes ?? 120);
      const block = findFocusBlock(mins);
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
    case "calendar_find_focus_block":
      return `≥ ${input.min_minutes ?? 120}min`;
    case "stock_quotes":
      return Array.isArray(input.symbols)
        ? (input.symbols as unknown[]).slice(0, 6).join(" · ")
        : "";
    case "render_panel":
      return `kind: ${input.kind}`;
    default:
      return "";
  }
}
