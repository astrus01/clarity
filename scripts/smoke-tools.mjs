import { readFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

// Load .env.local manually (no dotenv dependency).
try {
  const env = readFileSync(".env.local", "utf-8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  /* no .env.local, rely on process env */
}

const RESET = "\x1b[0m";
const OK = "\x1b[32m● PASS\x1b[0m";
const FAIL = "\x1b[31m● FAIL\x1b[0m";
const WARN = "\x1b[33m● WARN\x1b[0m";
const DIM = "\x1b[2m";

function line(tag, name, detail = "") {
  console.log(`${tag}  ${name}${detail ? `  ${DIM}${detail}${RESET}` : ""}`);
}

console.log("\nClarity · external-service smoke test");
console.log("──────────────────────────────────────\n");

let failures = 0;

// 1) Anthropic
{
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    line(FAIL, "Anthropic     ", "ANTHROPIC_API_KEY missing");
    failures++;
  } else {
    try {
      const client = new Anthropic({ apiKey: key });
      const model = process.env.CLARITY_MODEL || "claude-haiku-4-5";
      const t0 = Date.now();
      const res = await client.messages.create({
        model,
        max_tokens: 20,
        messages: [{ role: "user", content: "reply with the single word: ok" }],
      });
      const dt = Date.now() - t0;
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      line(OK, "Anthropic     ", `${model}  ${dt}ms  "${text.slice(0, 20)}"`);
    } catch (err) {
      line(FAIL, "Anthropic     ", `${err.status ?? ""} ${err.message ?? err}`);
      failures++;
    }
  }
}

// 2) Exa
{
  const key = process.env.EXA_API_KEY;
  if (!key) {
    line(
      WARN,
      "Exa           ",
      "EXA_API_KEY missing — web_search will return []",
    );
  } else {
    try {
      const t0 = Date.now();
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key },
        body: JSON.stringify({
          query: "Anthropic Claude",
          numResults: 2,
          contents: { text: { maxCharacters: 200 } },
        }),
      });
      const dt = Date.now() - t0;
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        line(FAIL, "Exa           ", `HTTP ${res.status}  ${body.slice(0, 140)}`);
        failures++;
      } else {
        const json = await res.json();
        const n = Array.isArray(json.results) ? json.results.length : 0;
        const sample = json.results?.[0];
        const hasImage = !!sample?.image;
        const hasFavicon = !!sample?.favicon;
        line(
          OK,
          "Exa           ",
          `${n} results  ${dt}ms  image:${hasImage} favicon:${hasFavicon}`,
        );
      }
    } catch (err) {
      line(FAIL, "Exa           ", err.message ?? String(err));
      failures++;
    }
  }
}

// 3) Open-Meteo geocode + forecast
{
  try {
    const t0 = Date.now();
    const geo = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=Tokyo&count=1",
    ).then((r) => r.json());
    const first = geo.results?.[0];
    if (!first) throw new Error("no geocode match");
    const fc = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=temperature_2m&daily=weather_code&timezone=auto`,
    ).then((r) => r.json());
    const dt = Date.now() - t0;
    const temp = fc.current?.temperature_2m;
    const days = fc.daily?.time?.length ?? 0;
    line(OK, "Open-Meteo    ", `Tokyo ${temp}°C · ${days}-day forecast · ${dt}ms`);
  } catch (err) {
    line(FAIL, "Open-Meteo    ", err.message ?? String(err));
    failures++;
  }
}

// 4) Title route (if dev server running)
{
  try {
    const t0 = Date.now();
    const res = await fetch("http://localhost:3000/api/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Summarize the news about AI today" }),
    });
    const dt = Date.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    line(OK, "Dev /api/title", `"${json.title}" · ${dt}ms`);
  } catch {
    line(
      WARN,
      "Dev /api/title",
      "dev server not running (skip if intentional: npm run dev)",
    );
  }
}

console.log("\n──────────────────────────────────────");
if (failures > 0) {
  console.log(`\n${failures} failure${failures === 1 ? "" : "s"}.\n`);
  process.exit(1);
} else {
  console.log("\nAll required services OK.\n");
}
