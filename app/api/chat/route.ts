import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLARITY_SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { TOOLS, dispatchTool, shortDetailFor } from "@/lib/tools/registry";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLARITY_MODEL || "claude-haiku-4-5";
const MAX_LOOP_TURNS = 6;

type ChatLocation = {
  label?: string;
  place?: string;
  neighborhood?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  timeZone?: string;
};

type ChatBody = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  location?: ChatLocation;
};

function buildLocationSuffix(loc: ChatLocation | undefined): string {
  if (!loc) return "";
  const precise = [loc.place, loc.neighborhood, loc.city, loc.region]
    .filter(Boolean)
    .join(", ");
  const header = precise || loc.label || "unknown";
  const bits: string[] = [];
  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    bits.push(`coords ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
  }
  if (loc.timeZone) bits.push(`TZ ${loc.timeZone}`);
  const meta = bits.length ? ` (${bits.join(" · ")})` : "";

  const anchor =
    loc.place ?? loc.neighborhood ?? loc.city ?? loc.label ?? "here";

  return `\n\n## User location (granted)\n\nThe user has shared their location: ${header}${meta}. This is specific — treat "${anchor}" as the anchor for any "nearby" question, not just the broader city. Use the location for:\n- Nearby recommendations (restaurants, errands, "what should I eat near me" — skip asking "where are you?"); anchor searches on "${anchor}" specifically\n- Weather defaults when they ask "what's the weather" with no city\n- Timezone for any \`calendar_create_event\` ISO timestamps — if the user has no events to derive TZ from, use the TZ above\n- Travel framing ("from ${anchor}")\nDo not over-cite the coordinates; treat the location as quiet context, not a headline.`;
}

type ToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

type TextBlock = { type: "text"; text: string };
type ContentBlock = ToolUseBlock | TextBlock;

type AssistantBlock = Anthropic.Messages.ContentBlockParam;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as ChatBody;
  const message = (body.message ?? "").trim();
  const history = Array.isArray(body.history) ? body.history : [];
  const systemPrompt =
    CLARITY_SYSTEM_PROMPT + buildLocationSuffix(body.location);

  if (!message) {
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY missing on server" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      const messages: Anthropic.Messages.MessageParam[] = [
        ...history
          .filter((h) => h && typeof h.content === "string" && h.content.length > 0)
          .slice(-20)
          .map((h) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ];

      try {
        let panelEverEmitted = false;
        let lastTurnTexts = "";

        for (let turn = 0; turn < MAX_LOOP_TURNS; turn++) {
          const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1600,
            system: systemPrompt,
            tools: TOOLS,
            messages,
          });

          const blocks = response.content as ContentBlock[];
          const toolUses = blocks.filter(
            (b): b is ToolUseBlock => b.type === "tool_use",
          );
          const texts = blocks
            .filter((b): b is TextBlock => b.type === "text")
            .map((b) => b.text)
            .join("");

          // Stream the text portion of this turn if present.
          if (texts.trim()) emit({ type: "text", text: texts });
          lastTurnTexts = texts;

          if (toolUses.length === 0) {
            // Model ended without calling a tool. If we never rendered a panel
            // AND the final text looks like a real answer (not a greeting),
            // coerce one more turn with tool_choice locked to render_panel.
            if (!panelEverEmitted && texts.trim().length > 40) {
              messages.push({
                role: "assistant",
                content: blocks as AssistantBlock[],
              });
              messages.push({
                role: "user",
                content:
                  "Render that answer as a render_panel call now. Pick the best-fit kind — news-brief for research/knowledge answers. Do not reply with prose.",
              });

              const forced = await client.messages.create({
                model: MODEL,
                max_tokens: 1600,
                system: systemPrompt,
                tools: TOOLS,
                tool_choice: { type: "tool", name: "render_panel" },
                messages,
              });

              const fBlocks = forced.content as ContentBlock[];
              const fTools = fBlocks.filter(
                (b): b is ToolUseBlock => b.type === "tool_use",
              );
              for (const tu of fTools) {
                emit({
                  type: "activity",
                  tool: tu.name,
                  detail: shortDetailFor(tu.name, tu.input),
                });
                const result = await dispatchTool(tu.name, tu.input);
                if (result.kind === "panel") {
                  emit({
                    type: "panel",
                    panelKind: result.panelKind,
                    panelData: result.panelData,
                  });
                  panelEverEmitted = true;
                }
              }
            }
            emit({ type: "done" });
            return;
          }

          // Re-inject assistant turn into history for the tool loop.
          messages.push({
            role: "assistant",
            content: blocks as AssistantBlock[],
          });

          // Execute tool uses sequentially so we can stream activity.
          const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
          let panelEmitted = false;

          for (const tu of toolUses) {
            emit({
              type: "activity",
              tool: tu.name,
              detail: shortDetailFor(tu.name, tu.input),
            });

            const result = await dispatchTool(tu.name, tu.input);

            if (result.kind === "panel") {
              emit({
                type: "panel",
                panelKind: result.panelKind,
                panelData: result.panelData,
              });
              panelEmitted = true;
              panelEverEmitted = true;
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content: result.summary,
              });
            } else {
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content: result.content,
              });
            }
          }

          messages.push({ role: "user", content: toolResults });

          // If response.stop_reason isn't "tool_use" we should've already closed;
          // if it is, continue the loop for the follow-up turn.
          if (response.stop_reason !== "tool_use") {
            // Defensive — some SDK versions may return end_turn alongside tool_use.
            if (panelEmitted || texts.trim()) {
              emit({ type: "done" });
              return;
            }
          }
        }

        // Loop ran out without a terminal render_panel — force one last panel.
        if (!panelEverEmitted && lastTurnTexts.trim().length > 0) {
          try {
            messages.push({
              role: "user",
              content:
                "Render that as a render_panel call now — pick the best-fit kind. Do not reply with prose.",
            });
            const forced = await client.messages.create({
              model: MODEL,
              max_tokens: 1600,
              system: systemPrompt,
              tools: TOOLS,
              tool_choice: { type: "tool", name: "render_panel" },
              messages,
            });
            const fBlocks = forced.content as ContentBlock[];
            for (const tu of fBlocks.filter(
              (b): b is ToolUseBlock => b.type === "tool_use",
            )) {
              const result = await dispatchTool(tu.name, tu.input);
              if (result.kind === "panel") {
                emit({
                  type: "panel",
                  panelKind: result.panelKind,
                  panelData: result.panelData,
                });
              }
            }
          } catch {
            // fall through
          }
        }

        emit({ type: "done" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        try {
          emit({ type: "error", message: msg });
          emit({ type: "done" });
        } catch {
          // controller already closed
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed — safe to ignore
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
