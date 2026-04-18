# Clarity

**The internet, rendered for you.**

Clarity is an AI chat interface where every answer materializes as a live, interactive panel. Ask anything — Clarity browses, reads, composes, then renders the result as a card, table, calendar, map, globe, or timeline. Built on Claude, Exa, Stagehand, and a generative UI engine.

---

## Quick Start

```bash
npm install
npm run dev      # → http://localhost:3000
```

Requires Node 18+. `.env.local` is already populated — if you pull fresh, see the **Environment** section below.

---

## What's there vs. what's next

The **design preview is done**. When you run `npm run dev`, you will see:

- Collapsible chat sidebar with multi-session history
- Focus-mode canvas (one exchange per scroll stop, wide layout)
- Sticky per-exchange prompt, agent activity stream, and generated panel
- Right-side dot-nav for exchange jumping
- 8 working panel designs: news-brief, email-draft, comparison-table, calendar, globe (Three.js), stock-watch, weather-brief, timeline-plan
- Home state with suggested prompts + voice-input affordance
- Dark calm-luxury theme, serif/mono typography, reduced-motion safe

Everything below is **what the hackathon implements**. Panels, renderer registry, and types are stubbed — the pipe from user prompt → real tool calls → streamed spec → rendered panel is what we wire up Saturday.

---

## Hackathon Work Plan (5 hours, 5 people)

Split work by owner; pick up the next card in your lane when you finish.

### 🧠 Backend / Agent loop — _owner: `@backend`_

Files: `app/api/chat/route.ts`, `lib/agent/system-prompt.ts`, `lib/agent/planner.ts`

- [ ] Replace the mock response in `app/api/chat/route.ts` with a streaming call to Anthropic (`claude-opus-4-7` or `claude-sonnet-4-6`) using the AI SDK
- [ ] Write the system prompt in `lib/agent/system-prompt.ts`: spec JSON schema, tool list, panel-kind hints
- [ ] Tool-calling loop: Claude → pick tool → run tool → feed back result → continue until final spec
- [ ] Emit server-sent events the frontend can consume: `{type:"activity", tool, detail}` and `{type:"spec", node}`
- [ ] Auto-generate a chat title from the first prompt (`app/api/title/route.ts`)

### 🌐 Tool integrations — _owner: `@tools`_

Files: `lib/tools/exa.ts`, `lib/tools/stagehand.ts`, `lib/tools/google.ts`, `app/api/google/route.ts`

- [ ] **Exa**: wrap `exa-search` with a typed `search(query, opts)` that returns normalized `{title, url, snippet, publishedAt}`
- [ ] **Stagehand**: implement `browse(url, extract)` using Browserbase (API key already in `.env.local`); fall back to local Chromium if Browserbase rate-limits
- [ ] **Google OAuth**: finish `app/api/google/route.ts` callback, store tokens in an httpOnly cookie
- [ ] **Gmail**: `list(max)`, `read(threadId)`, `send(to, subject, body)` — the email panel must be round-trippable
- [ ] **Calendar**: `list(dateRange)`, `findFreeBlock(duration)` for the focus-block question

### 🧩 Renderer engine — _owner: `@renderer`_

Files: `lib/render/process.ts`, `lib/render/registry.tsx`, `lib/render/state-context.tsx`, `lib/render/renderer.tsx`

- [ ] Harden `sanitize` + `repair` against bad LLM output: missing `type`, orphan `$ref`, unknown component names
- [ ] Wire streaming: accept partial specs, render already-complete subtrees while the rest streams
- [ ] Two-way binding: make sure `useBoundProp` actually triggers tool calls on mutation (for editable email, calendar confirms)
- [ ] Lazy-load `Scene3D` and `Map` panels (dynamic import + Suspense; see registry)
- [ ] Add a dev-only `<SpecInspector>` toggle so we can debug live specs during the demo

### 🎨 Panel components — _owner: `@panels`_

Files: `components/panels/*`, `components/generative-ui/primitives.tsx`

All 8 panels have visual designs but currently render hard-coded sample data. Rebuild each to accept a typed `props` object and render real data:

- [ ] `news-brief` — `{stories: {outlet, headline, url, sentiment}[]}`
- [ ] `email-draft` — `{from, subject, thread, draft}` + send handler
- [ ] `comparison-table` — `{tools: [...], rows: [...]}`; score/bool/text cells
- [ ] `calendar-panel` — `{events: [...], recommendedBlock?: {start, end}}`
- [ ] `globe-panel` — `{markers: {lat, lng, value, label}[]}`; ensure Scene3D still tree-shakes
- [ ] `stock-watch` — `{tickers: [...]}`; needs a live quote endpoint (Yahoo or Alpha Vantage)
- [ ] `weather-brief` — `{location, days: [...]}`
- [ ] `timeline-plan` — `{days: [{theme, stops: [...]}]}`

Also: expose every panel in the registry with stable type names the system prompt references.

### ⚡ Integration & voice — _owner: `@integration`_

Files: `app/page.tsx`, `lib/hooks/use-chat.ts`, `lib/hooks/use-voice.ts`

- [ ] Replace `SEED_SESSIONS` usage in `app/page.tsx` with live state: new sessions start empty, exchanges append as the user chats
- [ ] Persist sessions to `localStorage` keyed by `sessionId` (no backend DB — this is a hackathon)
- [ ] `useChat` hook: manages current session, streams responses from `/api/chat`, appends exchanges, handles errors
- [ ] `useVoice` hook: Web Speech API, Chrome-only, ⌘K keyboard shortcut; microphone button in `InputBar` already wired to `onToggleMic`
- [ ] End-to-end demo script: write a 5-prompt sequence that hits every panel kind cleanly

---

## Project Structure

```
clarity/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streaming agent loop   [backend]
│   │   ├── google/route.ts        # OAuth + Gmail/Calendar  [tools]
│   │   └── title/route.ts         # Chat title generator   [backend]
│   ├── layout.tsx                 # Theme provider, fonts
│   └── page.tsx                   # Sidebar + focus canvas [integration]
│
├── components/
│   ├── chat/
│   │   ├── chat-sidebar.tsx       # Collapsible session list
│   │   ├── dot-nav.tsx            # Right-side exchange jump
│   │   ├── input-bar.tsx          # Prompt textarea + voice
│   │   ├── agent-activity.tsx     # Tool call stream
│   │   ├── message.tsx            # User / assistant bubbles
│   │   ├── panel-frame.tsx        # Shared panel shell
│   │   ├── prompt-pill.tsx        # Suggestion chip
│   │   └── wordmark.tsx
│   ├── panels/                    # 8 panel components     [panels]
│   ├── generative-ui/             # Primitives for registry[panels]
│   └── ui/                        # Shadcn-style atoms
│
├── lib/
│   ├── chat/sessions.ts           # Types + seed data
│   ├── agent/                     # System prompt, planner [backend]
│   ├── render/                    # Spec → React engine    [renderer]
│   ├── tools/                     # Exa, Google, Stagehand [tools]
│   └── hooks/                     # useChat, useVoice      [integration]
│
├── .env.local                     # API keys (untracked)
├── .impeccable.md                 # Design context
└── clarity-prd(1).md              # Product spec
```

---

## Environment

`.env.local`:

```
ANTHROPIC_API_KEY=
EXA_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
BROWSERBASE_API_KEY=
NEWS_API_KEY=
```

---

## Design System

Dark-only "calm luxury" aesthetic. Defined in `app/globals.css` and `tailwind.config.ts`.

- **Background** `oklch(0.12 0.01 255)` (deep blue-gray, not black)
- **Primary** `oklch(0.75 0.07 75)` (muted gold — sparingly, never gradients)
- **Typography** Aleo serif · Manrope sans · JetBrains Mono
- **Motion** 300–360ms ease-out-quint, 60–80ms stagger; `prefers-reduced-motion` respected

Design rules baked in: no border-stripe callouts, no glassmorphism, no gradient text, no neon-on-dark, no cards-in-cards, no uniform card grids.

---

## Demo Sequence (rehearse this)

1. Open Clarity on the home screen → click "What's in the news today?"
2. Watch Exa search, Stagehand browse, Claude synthesize → news panel renders
3. Follow-up: "Draft a reply to my most urgent email" → Gmail list + read → editable draft
4. Sidebar → start a new chat → "Compare Cursor, Copilot, Claude Code for a junior dev"
5. Voice: ⌘K → "show me global AI investment" → 3D globe renders from lazy bundle
6. New chat → "4-day architecture itinerary for Tokyo" → timeline panel

If anything breaks, drop to the offline preview: `SEED_SESSIONS` in `lib/chat/sessions.ts` renders the full deck without any network calls.

---

## Troubleshooting

- **OAuth fails** — confirm redirect URI is exactly `http://localhost:3000/api/auth/callback/google`
- **Stagehand slow** — swap to local Chromium in `lib/tools/stagehand.ts`
- **Claude 401** — check `ANTHROPIC_API_KEY`, billing enabled
- **Panel not rendering** — open devtools, check the spec in `<SpecInspector>`; most often a missing type in the registry

---

Built with Claude · April 2026
