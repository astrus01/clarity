# Clarity

**The internet, rendered for you.**

Clarity is an AI chat interface where every answer materializes as a live, interactive panel. Ask anything — Clarity browses, reads, composes, then renders the result as a news brief, email draft, comparison table, calendar, globe, timeline, weather forecast, or stock watch. Built on Claude, Exa, Open-Meteo, and a hand-crafted panel library.

---

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
```

Requires Node 18+. Copy `.env.local.example` → `.env.local` and fill in `ANTHROPIC_API_KEY` (required) and `EXA_API_KEY` (optional; web search falls back to a graceful error).

---

## What ships today

| Feature | Status | Notes |
|---|---|---|
| Claude tool-use loop | ✅ Live | `/api/chat` runs up to 6 turns, NDJSON-streamed |
| 8 panel kinds rendering from live tool output | ✅ Live | news-brief, email-draft, comparison-table, calendar, globe, stock-watch, weather-brief, timeline-plan |
| Web search (Exa) | ✅ Live | REST `/search` with images + favicons piped into panels |
| News search (NewsAPI) | ✅ Live | Top-headlines + everything endpoints; urlToImage threaded into news-brief |
| Page browse | ✅ Live | Real `fetch` + title/description/text extraction |
| Weather forecast | ✅ Live | Open-Meteo (no API key) |
| Stock quotes | ✅ Deterministic fixture | NVDA / AAPL / TQQQ / MSFT / GOOGL / TSLA |
| Google OAuth | ✅ Live | `/api/google?action=login` → callback → httpOnly cookie |
| Gmail list / most-urgent / read | ✅ Live when connected | Falls back to fixture inbox if no OAuth cookie |
| Calendar + focus block | ✅ Live when connected | Falls back to fixture schedule |
| Voice input (Web Speech API) | ✅ Live | Chrome/Edge only; ⌘K toggle |
| Streaming tokens + activity feed | ✅ Live | NDJSON events: `text` · `activity` · `panel` · `done` · `error` |
| Session persistence (localStorage) | ✅ Live | Seeds auto-reinjected on hydrate |
| Auto-generated chat titles | ✅ Live | First exchange → Claude `/api/title` → session rename |
| 4 offline seed sessions | ✅ Always | Full panel library demo with no network |
| Browserbase (Stagehand live browse) | ⚠️ Key verified, CDP not wired | `browse_page` fallback uses plain fetch; Browserbase upgrade lives behind a switch |

---

## How the agent works

```
user prompt
    ↓
/api/chat     ← NDJSON stream
    ↓
Anthropic messages.create (tools: [...], turn 0)
    ↓
assistant.content = [tool_use, tool_use, ...]
    ↓
emit: {type: "activity", tool, detail}   (per tool)
dispatch real tool → tool_result
    ↓
push tool_results, next turn
    ↓
... up to 6 turns ...
    ↓
Terminal: `render_panel(kind, data)` tool
    → emit {type: "panel", panelKind, panelData}
    → client: useChatStore.updateExchange({panelKind, panelData})
    → React renders <NewsBriefPanel data={...} />
```

Every panel component has a typed props contract and a `DEFAULT_DATA` fallback, so seeds render identically to live output.

---

## Environment

`.env.local` (only the first is strictly required):

```
ANTHROPIC_API_KEY=sk-ant-...               # required
EXA_API_KEY=...                             # web_search
NEWS_API_KEY=...                            # news_search (NewsAPI.org)
GOOGLE_CLIENT_ID=...                        # Google OAuth
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
BROWSERBASE_API_KEY=...                     # optional — key-only verification today
NEXT_PUBLIC_APP_URL=http://localhost:3000   # used for OAuth redirects
CLARITY_MODEL=claude-haiku-4-5              # optional override
CLARITY_TITLE_MODEL=claude-haiku-4-5        # optional override
```

Run `npm run smoke` with the dev server running to verify every external service.

---

## Debug / known rough edges

These work but your team will want to smoke-test them:

**Tool loop**
- If Claude loops on `web_search` without calling `render_panel`, check the system prompt in `lib/agent/system-prompt.ts` — the panel catalogue is the behavioral spec. Tighten the "when to render" examples if it regresses.
- Max 6 turns. If hit, `{type: "error", message: "Max tool-loop turns reached."}` is emitted. Usually means the model is cycling on `web_search` — add a nudge to the system prompt: _"After two searches, call render_panel."_

**Voice**
- Chrome/Edge only. Safari and Firefox will show a disabled mic button with a "Voice unsupported" tooltip — that's expected.
- If mic permission is denied once, the browser remembers it. Reset via site settings → Microphone → Allow.

**Stock quotes**
- Currently **deterministic fixtures** in `lib/tools/finance.ts`. To plug a live source: replace `getQuotes()` body with a `fetch` to Yahoo (`query1.finance.yahoo.com/v7/finance/quote`) or Alpha Vantage. Keep the `Ticker` return type stable — the panel is bound to `{symbol, name, price, change, changePct, series}`.

**Gmail / Calendar**
- Click **Connect Google** at the bottom of the sidebar → consent to Gmail.readonly + Calendar.readonly → cookie `clarity-google` set. Disconnect via the same button.
- `lib/tools/gmail.ts` and `lib/tools/calendar.ts` call real Google when the cookie is present; otherwise they return fixture data so seeds and demos still work.
- If Gmail returns mock data while connected, check the smoke script (`npm run smoke`) — a 401 from Google usually means the access token expired and no refresh token was stored. Hit `?action=logout` and reconnect.

**localStorage persistence**
- If hydration conflicts appear after a schema change to `Exchange`/`ChatSession`, clear `clarity-chat` in DevTools → Application → Local Storage. Seeds will re-inject automatically.

**Title generation**
- Fire-and-forget after the first exchange completes. If `ANTHROPIC_API_KEY` is missing, it gracefully falls back to the first 5 words of the prompt.
- Look for `POST /api/title` in the Network tab — a 200 with `{title: "..."}` means it worked.

**Panel doesn't render**
- Check the server logs for a `render_panel` tool use and the kind it emitted. The kind must match a key in `PANEL_MAP` inside `app/page.tsx`:
  `news-brief · email-draft · comparison-table · calendar · globe · stock-watch · weather-brief · timeline-plan`.

**NDJSON stream appears cut off**
- Some dev proxies buffer. The response sets `X-Accel-Buffering: no` and `Cache-Control: no-cache, no-transform`. If you're behind Cloudflare or similar in staging, confirm those headers pass through.

---

## Project Structure

```
clarity/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streaming agent loop + tool dispatch
│   │   ├── title/route.ts         # Claude-generated chat titles
│   │   └── google/
│   │       ├── route.ts           # login / logout / status
│   │       └── callback/route.ts  # OAuth code exchange → httpOnly cookie
│   ├── layout.tsx                 # Theme provider, fonts
│   └── page.tsx                   # Sidebar + focus canvas
│
├── components/
│   ├── chat/
│   │   ├── chat-sidebar.tsx       # Collapsible session list
│   │   ├── dot-nav.tsx            # Right-side exchange jump
│   │   ├── input-bar.tsx          # Prompt textarea + voice (self-contained)
│   │   ├── agent-activity.tsx     # Tool call stream
│   │   ├── panel-frame.tsx        # Shared panel shell
│   │   └── prompt-pill.tsx        # Suggestion chip
│   ├── panels/                    # 8 panel components (typed props + DEFAULT_DATA)
│   └── ui/                        # Badge, Card, etc.
│
├── lib/
│   ├── chat/
│   │   ├── sessions.ts            # Types + 4 seed sessions
│   │   └── store.ts               # Zustand + persist middleware
│   ├── agent/system-prompt.ts     # Panel catalogue + behavioral spec
│   ├── tools/
│   │   ├── registry.ts            # TOOLS[] + dispatchTool()
│   │   ├── exa.ts                 # Web search (Exa)
│   │   ├── news.ts                # Top headlines / everything (NewsAPI)
│   │   ├── browse.ts              # fetch + HTML → text
│   │   ├── weather.ts             # Open-Meteo
│   │   ├── google.ts              # OAuth2 client + real Gmail + Calendar
│   │   ├── gmail.ts               # Real-first, fixture fallback
│   │   ├── calendar.ts            # Real-first, fixture fallback
│   │   └── finance.ts             # Stock quote fixtures
│   └── hooks/
│       ├── use-chat.ts            # NDJSON parser + store dispatch
│       └── use-voice.ts           # Web Speech API wrapper
│
├── .env.local                     # API keys (untracked)
└── clarity-prd(1).md              # Product spec
```

---

## Design System

Dark "calm luxury" aesthetic — defined in `app/globals.css` and `tailwind.config.ts`.

- **Background** `oklch(0.12 0.01 255)` (deep blue-gray, not black)
- **Primary** `oklch(0.75 0.07 75)` (muted gold — sparingly, never gradients)
- **Typography** Aleo serif · Manrope sans · JetBrains Mono
- **Motion** 300–360 ms ease-out-quint, 60–80 ms stagger; `prefers-reduced-motion` respected

Design rules baked in (impeccable plugin): no border-stripe callouts, no gradient text, no decorative glassmorphism, no cards-in-cards, no uniform card grids, asymmetric rhythm.

---

## Demo Sequence

Start from a fresh chat (or the home screen).

1. **"What's the most important tech news right now?"** → `web_search` → `render_panel(news-brief)`
2. **"Draft a reply to the most urgent email in my inbox."** → `gmail_most_urgent` → `gmail_read` → `render_panel(email-draft)`
3. **"Compare Cursor, Copilot, and Claude Code for a junior developer."** → `web_search` → `render_panel(comparison-table)`
4. **"Do I have time for a 2-hour focus block this afternoon?"** → `calendar_today` → `calendar_find_focus_block` → `render_panel(calendar)`
5. **"Show me global AI investment by country."** → `web_search` → `render_panel(globe)`
6. **"What's the weather in Tokyo this week?"** → `weather_forecast` → `render_panel(weather-brief)`
7. **"How are NVDA, AAPL, and TQQQ doing?"** → `stock_quotes` → `render_panel(stock-watch)`
8. **"Build a 4-day architecture itinerary for Tokyo."** → `web_search` → `render_panel(timeline-plan)`

If anything misfires, the 4 seed sessions in the sidebar walk the full panel library without touching the network.

---

Built with Claude · April 2026
