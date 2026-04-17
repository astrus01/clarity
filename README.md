# Clarity

**A Living Dashboard for Your Digital World**

Cut through the noise. See what matters. Act instantly.

Clarity is an AI-powered mission control dashboard that gives users total command of their digital life, including emails, calendar, news, research, and web actions, all from a single, stunningly designed interface. Powered by Claude (Anthropic), Clarity proactively surfaces what matters, executes multi-step tasks autonomously, and renders rich interactive UI components in response to any request.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local and add your API keys:
# - ANTHROPIC_API_KEY
# - EXA_API_KEY
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (for Gmail/Calendar)

# Run the dev server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
clarity/
├── app/
│   ├── api/
│   │   ├── agent/route.ts      # Main agent endpoint
│   │   ├── dashboard/route.ts  # Dashboard data aggregation
│   │   └── auth/callback/google/route.ts  # Google OAuth callback
│   ├── layout.tsx
│   └── page.tsx                # Mission Control Dashboard
├── components/
│   ├── dashboard/              # Dashboard panels
│   ├── generative-ui/          # UI component types
│   ├── ui/                     # Shadcn UI components
│   ├── command-bar.tsx
│   └── voice-input.tsx
├── lib/
│   ├── agent/agent.ts          # Claude agent wrapper
│   ├── swarm/                  # LangGraph state machine
│   │   ├── graph.ts
│   │   ├── tools.ts
│   │   ├── runner.ts
│   │   └── buffers.ts
│   ├── tools/                  # Tool implementations
│   │   ├── google.ts
│   │   ├── exa.ts
│   │   └── stagehand.ts
│   └── render/renderer.tsx     # Generative UI renderer
├── scripts/
│   ├── setup-google.ts
│   └── verify-swarm.ts
├── .env.local.example
├── components.json
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Architecture

Clarity uses a **LangGraph**-based autonomous agent powered by **Claude**.

```
User Command → API /agent → LangGraph (Planner → Executor → UI Generator) → JSONL Spec → React Component
```

### Core Modules

- **Agent** (`lib/agent/agent.ts`): Wraps the LangGraph graph and exposes `.stream()` for UI streaming.
- **Swarm** (`lib/swarm/`): Stateful graph that plans, executes tools, and generates UI specs.
- **Tools** (`lib/tools/`):
  - `exa.ts`: Web/News search via Exa.ai
  - `stagehand.ts`: Browser automation via Stagehand
  - `google.ts`: Gmail, Calendar, Drive integration
- **Generative UI** (`components/generative-ui/`): Interactive card components for various agent responses.

---

## Environment Variables

See `.env.local.example` for the full list. Key variables:

- `ANTHROPIC_API_KEY` – Required for Claude (Anthropic)
- `EXA_API_KEY` – Web search
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` – Google OAuth
- `BROWSERBASE_API_KEY` (optional) – Stagehand cloud

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **AI**: Anthropic Claude via `@ai-sdk/anthropic`
- **Orchestration**: LangGraph (`@langchain/langgraph`)
- **UI**: Tailwind CSS v4, Shadcn UI, Recharts
- **3D**: React Three Fiber (for Globe component)
- **Automation**: Stagehand (browser control)
- **Search**: Exa.ai
- **Google Workspace**: Gmail, Calendar, Drive (OAuth2)

---

## Design System

- **Theme**: Dark-first (Refined Dark Intelligence)
- **Colors**: Near-black background (#0a0a0f), Electric blue primary (#3b82f6), Amber alerts (#f59e0b), Emerald positive (#10b981)
- **Typography**: DM Sans / Sora for headlines; JetBrains Mono for agent logs
- **Layout**: 3-column Mission Control dashboard

---

## 5-Hour Hackathon Plan

See `clarity-prd.md` for full PRD. Quick plan:

1. Hour 0–0:30: Kickoff, setup, environment
2. Hour 0:30–1:30: Core infra (LangGraph graph, design system)
3. Hour 1:30–2:30: Features parallel (tools, dashboard panels)
4. Hour 2:30–3:30: Integration (command bar, voice, agent log)
5. Hour 3:30–4:30: Polish & demo prep
6. Hour 4:30–5:00: Buffer & final rehearsal

---

## Minimum Viable Demo (Crunch Time)

If behind schedule, ensure:

1. Mission Control dashboard with static panels
2. One working command (email draft or news brief)
3. Voice input button (browser Web Speech API)
4. Beautiful UI - non-negotiable for NBC demo

---

## Future Roadmap

- Clarity for Teams
- Slack & Notion integration
- Proactive alerts & memory
- Mobile app
- Plugin system (MCP)

---

Built with Claude by Anthropic · Hackathon Edition · April 2026
