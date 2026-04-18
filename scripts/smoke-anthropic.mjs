import { readFileSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";

// Minimal .env.local loader — avoids a dotenv dep.
try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (!(k in process.env)) process.env[k] = v.replace(/^['"]|['"]$/g, "");
  }
} catch {
  // If .env.local is absent we just rely on the ambient env.
}

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error("Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });

const candidates = ["claude-haiku-4-5", "claude-sonnet-4-5", "claude-opus-4-1"];

for (const model of candidates) {
  try {
    const res = await client.messages.create({
      model,
      max_tokens: 64,
      messages: [{ role: "user", content: "Reply with exactly: pong" }],
    });
    const text = res.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    console.log(`${model} -> ${text.trim()}`);
    console.log("usage:", res.usage);
    process.exit(0);
  } catch (e) {
    console.log(`${model} failed:`, e?.status, e?.message?.split("\n")[0]);
  }
}

console.error("All candidate models failed");
process.exit(1);
