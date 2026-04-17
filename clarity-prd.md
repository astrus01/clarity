# Clarity — Product Requirements Document
### *A Living Dashboard for Your Digital World*
**Version:** 1.0 | **Hackathon:** 5-Hour Sprint | **Audience:** NBC News Demo

---

## 1. Executive Summary

**Clarity** is an AI-powered mission control dashboard that gives users total command of their digital life — emails, calendar, news, research, and web actions — all from a single, stunningly designed interface. Powered by Claude (Anthropic), Clarity doesn't just respond to commands; it proactively surfaces what matters, executes multi-step tasks autonomously, and renders rich interactive UI components in response to any request.

Where GenUIne was a chat interface with generative capabilities, Clarity is an *operating system for your attention* — a persistent, ambient intelligence layer that keeps you informed and in control without the cognitive overhead of managing fifteen separate apps.

**Tagline:** *"Cut through the noise. See what matters. Act instantly."*

---

## 2. Problem Statement

Modern professionals are overwhelmed. The average person checks email 96 times a day, switches between 9+ apps to manage their work, and still feels behind. AI chat tools help with isolated tasks but lack the persistent, contextual awareness to replace the mental overhead of managing a digital life.

Clarity solves this by consolidating intelligence, automation, and action into one unified, always-on dashboard — and making it beautiful enough that people actually *want* to use it.

---

## 3. Product Vision & Identity

**Clarity is a living dashboard for your digital world.**

- It *sees* everything: your inbox, your calendar, breaking news, the web.
- It *thinks* continuously: Claude reasons over your context and surfaces insights.
- It *acts* autonomously: book meetings, send emails, research topics, scrape the web.
- It *shows*, not just tells: every response is a rich interactive UI component, not a wall of text.

The experience should feel like having a brilliant, tireless chief of staff who also happens to be a great designer.

---

## 4. Target Users (Hackathon Demo Personas)

| Persona | Pain Point | Clarity Solves |
|---|---|---|
| **The Busy Executive** | Drowning in email and meetings | Clarity reads, drafts, and schedules on command |
| **The Journalist / News Consumer** | Information overload, hard to stay current | Clarity delivers a personalized live news brief with AI analysis |
| **The Knowledge Worker** | Constant context-switching between apps | One dashboard replaces Gmail, Calendar, Search, and research tools |
| **The Startup Founder** | Needs to move fast, can't afford overhead | Clarity is an AI co-pilot that executes, not just advises |

---

## 5. Core Features

### 5.1 Mission Control Dashboard (The Hero Feature)
The home screen is not a chat box — it is a **live, multi-panel dashboard** that provides ambient awareness of the user's digital world at all times.

**Dashboard Panels:**
- **Clarity Score** — A single daily score (0–100) synthesizing email urgency, calendar load, and news relevance. The headline number that makes great TV.
- **Inbox Pulse** — AI-summarized top 5 emails with urgency tags, sender, and one-line summaries. Click to act.
- **Today's Schedule** — Visual timeline of calendar events for the day with smart conflict detection.
- **World Feed** — Live, AI-curated news cards with topic tags, sentiment indicators, and source attribution.
- **Active Agent** — A live panel showing the autonomous agent's current task, tool calls, and progress in real time.
- **Quick Actions Bar** — Pre-built shortcuts: "Draft reply," "Clear my afternoon," "What's in the news about [topic]," "Research this."

### 5.2 Natural Language Command Interface
A persistent, context-aware command bar (think: Spotlight for your digital life). Users can:
- Type or **speak** (voice input via Web Speech API — browser-native, free)
- Ask anything: "Do I have time for a 3pm meeting tomorrow?" / "What's happening with the Fed today?" / "Draft an apology to John about the delayed report."
- The agent responds with both action AND a generated UI component, not plain text.

### 5.3 Generative UI Engine (Upgraded from GenUIne)
Every response renders a **purpose-built interactive component**:
- **News Brief Card** — Headline, summary, sentiment gauge, related articles carousel
- **Email Draft Card** — Editable draft with tone selector, send button, and "regenerate" option
- **Calendar Block** — Visual time slot picker with conflict highlights
- **Research Report** — Multi-source synthesis with expandable citations, Recharts data viz
- **Web Screenshot Panel** — Live Stagehand result with annotated highlights
- **3D Data Globe** — For geographic/global data (React Three Fiber)
- **Comparison Table** — Auto-generated side-by-side analysis cards

### 5.4 Autonomous Agent (Powered by Claude + LangGraph)
The brain behind Clarity. A cyclic LangGraph state machine that:
- Plans multi-step tasks before executing
- Uses tools in sequence (search → browse → compose → send)
- Streams its thinking and tool use to the Active Agent panel in real time
- Recovers from errors gracefully with fallback strategies

**Key upgrade over GenUIne:** Claude replaces OpenAI. This means:
- Larger context window for handling long email threads and documents
- Superior instruction-following for complex multi-step tasks
- Claude's tool use is wired directly into Stagehand for browser control

### 5.5 Web Intelligence (Exa.ai)
- Semantic search across the web (not keyword matching)
- News discovery by topic, company, or person
- Price lookups, product research, competitor analysis
- Real-time answers without hallucination

### 5.6 Browser Automation (Stagehand)
- Navigate, click, fill forms, and extract data from any live website
- Pull hidden pricing, extract structured data, screenshot results
- Powered by Claude (Stagehand natively supports Anthropic models)

### 5.7 Google Workspace Integration
- **Gmail:** Read inbox, summarize threads, draft and send replies
- **Google Calendar:** Check availability, create/cancel events, detect conflicts
- **Google Drive:** Search files, read document content, attach to emails

### 5.8 Voice Input (NBC Wow Moment)
- Web Speech API (free, browser-native, no API key needed)
- Click the mic → speak a request → Clarity processes and responds with a full UI component
- Live waveform animation while listening for visual drama

### 5.9 Personalization Layer
- User sets up a profile on first load: name, role, topics of interest, communication style
- Claude uses this context in every prompt for personalized responses
- Saves recent queries and generated components to a session history sidebar

---

## 6. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLARITY FRONTEND                         │
│  Next.js 15 App Router | React 19 | Tailwind v4 | Shadcn UI    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Mission     │  │  Command     │  │  Generative UI     │    │
│  │  Control     │  │  Bar +       │  │  Component         │    │
│  │  Dashboard   │  │  Voice Input │  │  Renderer          │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Vercel AI SDK (streaming)
┌─────────────────────────▼───────────────────────────────────────┐
│                     NEXT.JS API ROUTES                          │
│  /api/agent  |  /api/google  |  /api/voice  |  /api/dashboard  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   LANGGRAPH SWARM AGENT                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  PLANNER    │  │  EXECUTOR   │  │  UI SPEC GENERATOR      │ │
│  │  (Claude)   │→ │  (Tools)    │→ │  (JSONL → Component)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└───────┬──────────────────┬────────────────────┬─────────────────┘
        │                  │                    │
┌───────▼──────┐  ┌────────▼───────┐  ┌────────▼───────┐
│  CLAUDE API  │  │   EXA.AI       │  │   STAGEHAND    │
│  (Anthropic) │  │   Web Search   │  │   Browser Bot  │
└──────────────┘  └────────────────┘  └────────────────┘
                          │
                  ┌───────▼────────┐
                  │ GOOGLE OAUTH   │
                  │ Gmail/Cal/Drive │
                  └────────────────┘
```

### 6.1 Key Architectural Decisions vs. GenUIne

| Decision | GenUIne | Clarity |
|---|---|---|
| AI Model | OpenAI GPT-4o | **Claude (Anthropic)** |
| Stagehand Backend | OpenAI | **Claude (native support)** |
| Home Screen | Chat interface | **Mission Control Dashboard** |
| Voice | None | **Web Speech API** |
| News | None | **Exa.ai + AI summarization** |
| UI Response | JSONL spec rendering | **Richer JSONL + streaming components** |
| Personalization | None | **User profile context layer** |
| Clarity Score | None | **Daily AI-generated score** |

---

## 7. API & Integration Plan

### Free / Available APIs (Recommended)

| Service | Free Tier | What It Powers |
|---|---|---|
| **Anthropic Claude** | Via Claude Code credits | Core AI reasoning, tool use, generation |
| **Exa.ai** | 1,000 searches/month free | Web search, news discovery |
| **Stagehand** | Open source (uses Claude key) | Browser automation |
| **Google OAuth** | Free | Gmail, Calendar, Drive |
| **Web Speech API** | Browser-native, free | Voice input |
| **NewsAPI.org** | 100 req/day free (dev) | Supplemental news headlines |
| **React Three Fiber** | Open source | 3D visualizations |
| **Recharts** | Open source | Data charts |
| **Framer Motion** | Free | Animations |

### Environment Variables Needed
```env
# Core AI
ANTHROPIC_API_KEY=sk-ant-...

# Search & Browse
EXA_API_KEY=...
BROWSERBASE_API_KEY=...    # For Stagehand cloud (optional; local works too)

# Google Workspace (OAuth2)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Optional News Supplement
NEWS_API_KEY=...
```

---

## 8. UI/UX Direction

### Design Identity: "Refined Dark Intelligence"
Clarity should look like what would happen if Linear, Vercel, and a Bloomberg Terminal had a baby — dark, data-dense, immaculately spaced, and unmistakably premium.

**Visual Language:**
- **Color Palette:** Near-black background (#0a0a0f), with electric blue (#3b82f6) as the primary action color, warm amber (#f59e0b) for urgency/alerts, and soft emerald (#10b981) for positive states. Subtle blue-gray panel surfaces.
- **Typography:** Display headlines in a geometric sans (e.g., DM Sans or Sora); monospaced elements for the Active Agent log (JetBrains Mono); body in a neutral, legible face.
- **Motion:** Smooth panel slide-ins on load, pulsing waveform during voice, real-time streaming text in the agent log, card hover states with subtle lift + glow.
- **Layout:** Asymmetric multi-column grid. The dashboard should feel *alive* — content updating, cards breathing, agent activity always visible.
- **Logo/Brand:** A single geometric diamond/prism that fractures light — representing clarity cutting through noise.

### Key Screens

**Screen 1: Mission Control (Default)**
Three-column layout: Left sidebar (navigation + quick stats), Center (main content area, swaps based on context), Right (Active Agent live log).

**Screen 2: Command Response**
When a user submits a query, the center panel animates out the dashboard and renders the Generative UI component full-width, with the agent log streaming tool calls on the right.

**Screen 3: Onboarding / Profile**
Minimal setup screen: name, role, interests, communication style. Takes 60 seconds. Used to personalize all subsequent Claude prompts.

---

## 9. Demo Script (NBC Wow Moments)

This is the sequence to run when the cameras roll. Each beat should land within the 5-minute window.

**[0:00] The Hook**
Open Clarity to the Mission Control dashboard. Say: *"This is Clarity — your AI chief of staff, your newsroom, and your command center, all in one."*
Point to the Clarity Score: *"Right now, my score is 73. I have 3 urgent emails, one scheduling conflict, and something interesting happening in the news."*

**[0:45] Voice Command — News Brief**
Tap the mic. Say: *"Clarity, what's the most important news story for me right now?"*
Watch: Exa.ai pulls headlines → Claude synthesizes → a rich News Brief card renders with headline, summary, sentiment gauge, and related articles.

**[1:30] Autonomous Email — End-to-End**
Type (or speak): *"Draft a reply to the email from Sarah apologizing for the delay and proposing Thursday at 2pm."*
Watch: Gmail tool reads the thread → Claude drafts a reply → an editable Email Draft card renders with Send button, tone selector, and calendar availability confirmed.

**[2:30] Calendar Intelligence**
Say: *"Do I have time for a 2-hour deep work block today?"*
Watch: Calendar tool checks availability → agent finds a gap → suggests a time block → renders a visual time slot card with one-click "Block It" button.

**[3:15] Live Web Research**
Say: *"Research the top three AI productivity tools launched this month and compare them."*
Watch: Exa searches → Stagehand browses → Claude synthesizes → a Comparison Table card renders with feature-by-feature breakdown and source links.

**[4:00] 3D Moment (Visual Wow)**
Ask for something geographic or scientific — e.g., *"Show me global AI investment by region."*
Watch: Data populates a 3D interactive globe (React Three Fiber) with markers, animations, and a Recharts breakdown below it.

**[4:45] The Close**
Show all four dashboard panels populated with live data. *"In under 5 minutes, Clarity read my emails, checked my calendar, scoured the web, and built me a personalized briefing — without me opening a single other app. That's Clarity."*

---

## 10. Team Roles & 5-Hour Build Plan

### Recommended Team Structure (5 people)

| Role | Person | Owns |
|---|---|---|
| **Architect / Lead** | P1 | LangGraph graph, Claude API wiring, API routes |
| **Frontend Lead** | P2 | Mission Control dashboard layout, design system, polish |
| **Tools Engineer** | P3 | Exa.ai, Stagehand, Google Workspace tool implementations |
| **Generative UI Dev** | P4 | JSONL component renderer, all UI response cards |
| **Integration + Demo** | P5 | End-to-end wiring, demo script, voice input, final polish |

### Hour-by-Hour Sprint Plan

```
HOUR 0:00–0:30  | KICKOFF & SETUP
├── All: Clone repo (based on GenUIne), swap OpenAI → Anthropic key
├── P1: Scaffold new LangGraph graph with Claude
├── P2: Set up design system (colors, fonts, CSS vars)
└── All: Confirm all API keys are working

HOUR 0:30–1:30  | CORE INFRASTRUCTURE
├── P1: Claude tool-calling loop in LangGraph (plan → execute → respond)
├── P3: Exa.ai search tool + Google OAuth setup
├── P2: Mission Control dashboard skeleton (3-column layout)
└── P4: Generative UI renderer (JSONL spec → React component)

HOUR 1:30–2:30  | FEATURES PARALLEL
├── P1+P3: Gmail read/draft tools, Calendar check tool
├── P3: Stagehand browser tool wired to Claude
├── P2: Dashboard panels (Inbox Pulse, Schedule, World Feed, Clarity Score)
└── P4: News Brief card, Email Draft card, Comparison Table card

HOUR 2:30–3:30  | INTEGRATION
├── P1+P5: Connect frontend command bar to LangGraph agent
├── P5: Voice input (Web Speech API) + waveform animation
├── P2: Active Agent log panel (streaming tool calls)
└── P4: Recharts + React Three Fiber components

HOUR 3:30–4:30  | POLISH & DEMO PREP
├── P2+P4: Full UI pass — animations, hover states, transitions
├── P5: Rehearse demo script, identify weak points
├── P1: Error handling, loading states, fallbacks
└── All: End-to-end demo run-through × 2

HOUR 4:30–5:00  | BUFFER / FINAL REHEARSAL
├── Fix any critical blockers
├── Final demo run with all team watching
└── Prepare 60-second pitch for NBC cameras
```

### Minimum Viable Demo (If Time is Short)
If the build falls behind, this is the cut-down version that still impresses:
1. Mission Control dashboard (static panels okay, live data better)
2. One working command: email draft via Claude
3. One working command: news brief via Exa + Claude
4. Voice input (even if it just triggers the text command)
5. Beautiful UI — this is non-negotiable given the NBC audience

---

## 11. Risk Register & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Google OAuth setup takes too long | High | Pre-authorize one test Google account before the hackathon starts |
| Stagehand is flaky on demo day | Medium | Pre-cache a Stagehand result for the demo; use live only if stable |
| LangGraph graph has state bugs | Medium | Build happy-path first, skip error recovery for hackathon scope |
| Claude API rate limits | Low | Use streaming + caching; one team account |
| Voice recognition fails in noisy room | Medium | Have keyboard fallback; test mic sensitivity beforehand |
| 3D rendering is slow | Low | Keep Three.js scene simple; don't animate on first render |

---

## 12. Success Metrics (Hackathon)

**Hard:**
- [ ] Mission Control dashboard renders with ≥ 3 live panels
- [ ] At least 2 autonomous agent tasks complete end-to-end live
- [ ] Voice input triggers a command successfully
- [ ] Generative UI renders ≥ 3 distinct component types

**Soft (for NBC / Judges):**
- [ ] Non-technical viewer "gets it" within 30 seconds of seeing it
- [ ] Demo runs without a crash from start to finish
- [ ] UI looks like a real funded product, not a hackathon prototype
- [ ] Team can articulate the "why" in one sentence

---

## 13. Future Roadmap (Post-Hackathon)

These features are out of scope for the 5-hour build but worth mentioning to judges and NBC:
- **Clarity for Teams** — Shared workspace dashboards with role-based views
- **Slack & Notion Integration** — Extend the Workspace module
- **Proactive Alerts** — Claude monitors your inbox and news feeds and interrupts only for what truly matters
- **Mobile App** — Clarity on iOS/Android with push notifications
- **Memory Layer** — Persistent user memory across sessions (Mem0 or custom vector DB)
- **Plugin System** — Let users connect any tool via MCP

---

*Built with Claude by Anthropic · Hackathon Edition · April 2026*
