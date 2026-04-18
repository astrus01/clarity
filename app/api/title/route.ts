import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 15;

const MODEL = process.env.CLARITY_TITLE_MODEL || "claude-haiku-4-5";

function fallbackTitle(raw: string): string {
  const words = raw.trim().split(/\s+/).slice(0, 5).join(" ");
  return words || "New chat";
}

function sanitize(text: string): string {
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^(title:?|chat title:?)\s*/i, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 48);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { message?: string };
  const message = String(body.message ?? "").trim();

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
      max_tokens: 24,
      system:
        "You name chat threads. Given a user's first message, output a 2-to-4 word Title Case label for the subject matter. Output ONLY the title — no quotes, no punctuation at the end, no preamble, no explanation, no meta commentary. If the message is a greeting with no real subject, output exactly: New Chat.",
      messages: [
        {
          role: "user",
          content: `First message: ${message.slice(0, 500)}\n\nTitle:`,
        },
      ],
    });

    const raw = res.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const title = sanitize(raw);
    const words = title.split(" ").filter(Boolean);

    // Reject obviously-wrong outputs (sentence-like, too long, contains verbs of continuation).
    const bad =
      !title ||
      words.length > 6 ||
      /^(i |sure|here|let me|it |the user|appreciate|understand|thank|assist)/i.test(title);

    return Response.json({
      title: bad ? fallbackTitle(message) : title,
    });
  } catch {
    return Response.json({ title: fallbackTitle(message) });
  }
}
