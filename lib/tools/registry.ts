import type Anthropic from "@anthropic-ai/sdk";
import { searchExa } from "./exa";
import { getWeather } from "./weather";
import { listThreads, readThread, findMostUrgent } from "./gmail";
import {
  listEventsRange,
  listEventsToday,
  findFocusBlock,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "./calendar";
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
      "All events on the user's calendar for today. Returns {source, connected, events}. source='google' means these are the user's REAL events; source='fixture' means Google is NOT connected and you're looking at a demo calendar (Standup / Coffee with Maya / Design review / 1:1 with manager / Investor call). If source='fixture' and the user is asking you to act on THEIR real schedule (classes, workouts between meetings, etc.), tell them to click Connect Google in the sidebar first — do not pretend the fixture is real.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "calendar_upcoming",
    description:
      "Events across a day window, grouped by day. Returns {source, connected, days}. source='fixture' means Google is NOT connected — surface that to the user. Use for 'this week', 'next Thursday', 'upcoming events'. days_back defaults 0, days_ahead defaults 7. Max 30. Pass days to render_panel(calendar, {days: [...]}).",
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
      "Largest open block of time today of at least N minutes, with a protected buffer padded off each side. Returns {start, end, minutes, bufferMinutes} where start/end describe the DIRECTLY USABLE window — buffer has already been subtracted, so you can pass start/end straight to calendar_create_event without shifting. Default buffer is 15 minutes; pass buffer_minutes: 0 to skip.",
    input_schema: {
      type: "object",
      properties: {
        min_minutes: { type: "number" },
        buffer_minutes: {
          type: "number",
          description:
            "Minutes of padding protected on each side. Default 15. 0 disables.",
        },
      },
      required: ["min_minutes"],
    },
  },
  {
    name: "calendar_create_event",
    description:
      "Create a real event on the user's primary Google Calendar. Use this ANY time the user asks you to block, schedule, add, book, reserve, pencil in, or hold time for something — lunch blocks, focus time, meeting holds, reminders with a time, everything. Call calendar_find_focus_block FIRST if the user hasn't specified an exact time (e.g. 'block off lunch when I'm free'). Timestamps MUST be ISO-8601 with timezone offset, e.g. '2026-04-18T12:30:00-04:00'. Before writing, the server checks for conflicts with existing events inside [start - buffer_minutes, end + buffer_minutes]. Returns {created:true, when, bufferMinutes, htmlLink} on success. On failure returns {created:false, reason} — reason can be 'not-connected' (tell user to Connect Google), 'conflict' (an existing event violates the buffer; shift the time and retry), 'bad-input', 'forbidden', or 'error'. Do not pretend a refused write succeeded.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Event title" },
        start_iso: {
          type: "string",
          description:
            "ISO-8601 start with timezone, e.g. '2026-04-18T12:30:00-04:00'",
        },
        end_iso: {
          type: "string",
          description: "ISO-8601 end with timezone",
        },
        location: { type: "string" },
        description: { type: "string" },
        time_zone: {
          type: "string",
          description:
            "IANA tz, e.g. 'America/New_York'. Optional if start/end carry offsets.",
        },
        buffer_minutes: {
          type: "number",
          description:
            "Minutes of protected padding on each side that must be free of other events. Default 15. Pass 0 to skip the conflict check (rare — only if the user explicitly says 'schedule it anyway even if tight').",
        },
      },
      required: ["title", "start_iso", "end_iso"],
    },
  },
  {
    name: "calendar_update_event",
    description:
      "Move or edit an EXISTING event on the user's primary Google Calendar. Use this ANY time the user says move, shift, reschedule, push back, pull in, change the time of, rename, or relocate an event that is already on their calendar. Prefer this over delete+create — it keeps the event ID stable, preserves attendees/recurrence, and doesn't send cancel notices. You MUST have the Google event id, which is returned on every event from calendar_today and calendar_upcoming. When moving to a new time, pass BOTH start_iso and end_iso (the server enforces the same 15-min buffer as calendar_create_event and returns reason:'conflict' if it doesn't fit). To only rename or relocate, pass just title/location. On failure reason can be 'not-connected', 'not-found' (refresh then retry), 'conflict' (shift the window and retry), 'bad-input', 'forbidden', or 'error'.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Google event id from calendar_today / calendar_upcoming (required).",
        },
        title: { type: "string" },
        start_iso: {
          type: "string",
          description:
            "New ISO-8601 start with timezone. Required if end_iso is passed.",
        },
        end_iso: {
          type: "string",
          description:
            "New ISO-8601 end with timezone. Required if start_iso is passed.",
        },
        location: { type: "string" },
        description: { type: "string" },
        time_zone: {
          type: "string",
          description:
            "IANA tz, e.g. 'America/New_York'. Optional if start/end carry offsets.",
        },
        buffer_minutes: {
          type: "number",
          description:
            "Minutes of protected padding on each side. Default 15. 0 disables (rare).",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "calendar_delete_event",
    description:
      "Delete an event from the user's primary Google Calendar. Use for 'cancel', 'remove', 'delete' — when the user wants the event gone entirely. You MUST have the Google event id. Prefer calendar_update_event over delete+create when the user is moving an event. Returns {deleted:true, id} on success; on failure reason can be 'not-connected', 'not-found' (already gone), 'forbidden', 'bad-input', or 'error'.",
    input_schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "Google event id from calendar_today / calendar_upcoming (required).",
        },
      },
      required: ["id"],
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
            "meal-options",
            "news-brief",
            "email-draft",
            "inbox",
            "comparison-table",
            "calendar",
            "weather-brief",
            "timeline-plan",
            "globe",
            "stock-watch",
            "map",
            "meal-plan",
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
      const buffer =
        input.buffer_minutes != null ? Number(input.buffer_minutes) : undefined;
      const block = await findFocusBlock(mins, buffer);
      return {
        kind: "text",
        content: block
          ? JSON.stringify(block)
          : `No open block of at least ${mins} minutes today.`,
      };
    }

    case "calendar_create_event": {
      const result = await createCalendarEvent({
        title: String(input.title ?? ""),
        startIso: String(input.start_iso ?? ""),
        endIso: String(input.end_iso ?? ""),
        location: input.location ? String(input.location) : undefined,
        description: input.description ? String(input.description) : undefined,
        timeZone: input.time_zone ? String(input.time_zone) : undefined,
        bufferMinutes:
          input.buffer_minutes != null ? Number(input.buffer_minutes) : undefined,
      });
      return { kind: "text", content: JSON.stringify(result) };
    }

    case "calendar_update_event": {
      const result = await updateCalendarEvent({
        id: String(input.id ?? ""),
        title: input.title ? String(input.title) : undefined,
        startIso: input.start_iso ? String(input.start_iso) : undefined,
        endIso: input.end_iso ? String(input.end_iso) : undefined,
        location: input.location ? String(input.location) : undefined,
        description: input.description ? String(input.description) : undefined,
        timeZone: input.time_zone ? String(input.time_zone) : undefined,
        bufferMinutes:
          input.buffer_minutes != null ? Number(input.buffer_minutes) : undefined,
      });
      return { kind: "text", content: JSON.stringify(result) };
    }

    case "calendar_delete_event": {
      const result = await deleteCalendarEvent(String(input.id ?? ""));
      return { kind: "text", content: JSON.stringify(result) };
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
    case "calendar_create_event":
      return `${String(input.title ?? "event").slice(0, 40)} · ${String(input.start_iso ?? "").slice(11, 16)}`;
    case "calendar_update_event":
      return input.start_iso
        ? `moving → ${String(input.start_iso ?? "").slice(11, 16)}`
        : `editing ${String(input.id ?? "").slice(0, 8)}`;
    case "calendar_delete_event":
      return `deleting ${String(input.id ?? "").slice(0, 8)}`;
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
