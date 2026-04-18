import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 20;

const MODEL = process.env.CLARITY_MODEL || "claude-haiku-4-5";

type DraftRequest = {
  from?: string;
  subject?: string;
  thread?: string;
  tone?: string;
  previousDraft?: string;
};

const TONE_GUIDANCE: Record<string, string> = {
  warm: "warm, personable, and candid — like writing to a trusted colleague",
  formal: "formal and professional, third-person-adjacent, crisp",
  direct: "direct and concise — get to the point in the first line; no throat-clearing",
  apologetic:
    "gracious and apologetic — acknowledge the inconvenience but do not grovel",
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as DraftRequest;
  const from = String(body.from ?? "the recipient").trim();
  const subject = String(body.subject ?? "(no subject)").trim();
  const thread = String(body.thread ?? "").trim();
  const tone = String(body.tone ?? "warm").toLowerCase();
  const previous = String(body.previousDraft ?? "").trim();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY missing" },
      { status: 500 },
    );
  }

  const toneLine =
    TONE_GUIDANCE[tone] ?? `${tone} in tone, but still natural and human`;

  const system = `You draft short email replies. Output ONLY the email body — no subject, no "Dear X", no headers, no signature block. Start directly with the first sentence of the reply. Keep it ≤ 140 words unless the thread genuinely needs more. Tone: ${toneLine}. Do not include placeholders like [your name] or <your name> — end with a single short valediction and the user's initial (e.g. "— T").`;

  const userContent = [
    `Recipient: ${from}`,
    `Subject: ${subject}`,
    thread ? `\nOriginal message:\n${thread.slice(0, 4000)}` : "",
    previous
      ? `\nPrevious draft (rewrite — different wording, same intent):\n${previous.slice(0, 2000)}`
      : "",
    `\nWrite the reply body now.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const draft = res.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({ draft });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
