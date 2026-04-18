import { readFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

const env = readFileSync(".env.local", "utf-8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const model = process.env.CLARITY_MODEL || "claude-haiku-4-5";
try {
  console.log("model:", model);
  console.log("key len:", (process.env.ANTHROPIC_API_KEY || "").length);
  const res = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: "user", content: "Say hi in 5 words." }],
  });
  console.log("OK stop_reason:", res.stop_reason);
  console.log("content[0]:", JSON.stringify(res.content[0]).slice(0, 400));
} catch (err) {
  console.error("ERR status:", err.status);
  console.error("ERR msg:", err.message);
  console.error("ERR body:", err.error);
}
