import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CLARITY_MODEL || "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are Clarity, a calm, concise AI assistant.

You help the user get answers without leaving the conversation. For this first iteration, respond in plain prose — no markdown headings, no bullet lists unless genuinely needed, no code blocks. Keep responses short (2–5 sentences) and grounded. Never apologize for missing data; say what you do know.

If a request would normally benefit from a visual panel (news brief, email draft, calendar, comparison), briefly describe what you'd render and mention that the interactive panel is coming soon. Do not fabricate live data.`;

type ChatBody = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

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
      try {
        const messages = [
          ...history
            .filter((h) => h && typeof h.content === "string" && h.content.length > 0)
            .slice(-20)
            .map((h) => ({ role: h.role, content: h.content })),
          { role: "user" as const, content: message },
        ];

        const response = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        controller.enqueue(encoder.encode(`\n\n[Clarity error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
