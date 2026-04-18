import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLARITY_SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { TOOLS, dispatchTool, shortDetailFor } from "@/lib/tools/registry";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLARITY_MODEL || "claude-haiku-4-5";
const MAX_LOOP_TURNS = 6;

type ChatBody = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

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
        for (let turn = 0; turn < MAX_LOOP_TURNS; turn++) {
          const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1600,
            system: CLARITY_SYSTEM_PROMPT,
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

          if (toolUses.length === 0) {
            // Final turn — model is done.
            emit({ type: "done" });
            controller.close();
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
              controller.close();
              return;
            }
          }
        }

        emit({ type: "error", message: "Max tool-loop turns reached." });
        emit({ type: "done" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        emit({ type: "error", message: msg });
        emit({ type: "done" });
      } finally {
        controller.close();
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
