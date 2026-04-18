import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 15;

const MODEL = process.env.CLARITY_TITLE_MODEL || "claude-haiku-4-5";

function fallbackTitle(raw: string): string {
  const words = raw.trim().split(/\s+/).slice(0, 5).join(" ");
  return words || "New chat";
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    message?: string;
    reply?: string;
  };
  const message = String(body.message ?? "").trim();
  const reply = String(body.reply ?? "").trim();

  if (!message) {
    return Response.json({ title: "New chat" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ title: fallbackTitle(message) });
  }

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 40,
      system:
        "Write a 2-4 word title for this chat. Title Case. No quotes. No trailing punctuation. Capture the subject matter, not the action.",
      messages: [
        {
          role: "user",
          content: reply
            ? `User: ${message}\n\nAssistant: ${reply.slice(0, 400)}`
            : message,
        },
      ],
    });

    const text = res.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/[.!?]+$/g, "")
      .slice(0, 60);

    return Response.json({ title: text || fallbackTitle(message) });
  } catch {
    return Response.json({ title: fallbackTitle(message) });
  }
}
