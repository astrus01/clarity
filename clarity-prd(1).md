# Clarity — Product Requirements Document
### *Healthy isn't a plan. It's a real-time decision.*
**Version:** 4.0 (Health Coach Pivot) | **Hackathon:** 5-Hour Sprint | **Audience:** NBC News Demo

---

## 1. Executive Summary

**Clarity** is a real-time health copilot for people whose lives don't fit a meal plan. Instead of generic advice like "eat more protein" or "cut carbs," Clarity looks at where you are, what time it is, what's on your calendar, what's in your fridge, and what you've already eaten — and tells you the single smart move for *this* meal. The answer comes back as an interactive panel, not a paragraph.

It's built for the national correspondent who is standing in a LaGuardia concourse with 80 minutes until a red-eye, for the parent staring into the fridge at 9pm after soccer practice, for the shift worker whose 3am "dinner" doesn't show up in any wellness app's template. Clarity treats every meal as a decision made under real-world constraints — not a box to check against an idealized daily total.

Clarity's differentiator is the generative UI: every response is a purpose-built, interactive card. "What should I eat right now?" renders a `meal-pick` panel with the recommendation, the reason, the macros, and two alternates. "What can I make with eggs and leftover rice?" renders a `fridge-scan` with three 15-minute dinners. "I'm flying LAX to Heathrow tonight" renders an `on-the-road` plan that spans airport, plane, and arrival.

**Tagline:** *"Healthy isn't a plan. It's a real-time decision."*

---

## 2. Problem Statement

Nutrition advice breaks down the moment a real life touches it.

- Generic rules ("eat more protein," "limit sodium," "fill half your plate with vegetables") don't tell anyone what to order at 11pm from a hotel room service menu, or what to cook with the three things left in the fridge on a Sunday night.
- Calorie-counting apps demand log-everything discipline that no traveling professional sustains. The result is a graveyard of abandoned streaks.
- Meal-plan services assume a stable week, a predictable grocery run, and a kitchen you'll be standing in at 6:30pm every weekday. Correspondents, nurses, parents of young kids, and anyone on shift work fit none of those assumptions.
- Restaurant-recommendation tools optimize for taste or price, not "protein-forward, low sodium, eats in under 15 minutes because I have a live hit at 4pm."

The gap is a coach that *compresses* decisions instead of listing options. The user doesn't want a 40-result search. They want to know what to eat next, and why, in the context of where they are and what's coming up.

Clarity closes that gap by putting the decision on a panel: one lead recommendation, a short reason, macros, a couple of backups, and — critically — context about the rest of the day so the user trusts the call.

---

## 3. Product Vision & Identity

**Clarity is an AI chat interface that removes the guesswork from staying healthy in real life.**

- You *tell it your situation* naturally — "I'm at LAX with 80 minutes," "what can I make with eggs and spinach," "I just had a Shake Shack burger for lunch."
- It *looks at your context* — your calendar, your location, the time of day, the weather, what you've already eaten — using the same tools Clarity always had.
- It *renders the decision* as an interactive panel: the pick, the reason, the macros, the alternates, the followups.
- It *tracks what matters* when you want it to — running daily macros, hydration on travel days, sodium when you've been on the road.

The product stays conversational. It stays luxurious and calm. It adds a new spine: every response is a food/health decision, rendered visually, tied to real-world context.

The experience should feel like texting a quiet, careful coach who already knows your week.

---

## 4. Target Users (Hackathon Demo Personas)

| Persona | What They Ask | What They Get Back |
|---|---|---|
| **The National Correspondent** | "I'm at LaGuardia with 80 minutes before my flight to London — plan my meals." | An `on-the-road` panel: best gate pick with macros, onboard hydration plan, first meal in London local time |
| **The Home Cook Under Pressure** | "I've got eggs, half an onion, frozen spinach, and leftover rice." | A `fridge-scan` panel: 3 dinners in under 20 minutes, each with macros, prep time, and a step preview |
| **The Real-Time Eater** | "What should I eat right now?" | A `meal-pick` panel: top recommendation tuned to time of day + calendar, two alternates, macros, brief reasoning |
| **The Post-Meal Logger** | "I just had a Shake Shack burger and fries. What's dinner?" | A `nutrition-log` panel: meal logged, running totals vs targets, a specific dinner suggestion that balances the day |
| **The Schedule-Aware Planner** | "Anything coming up the next few days I should eat around?" | A `calendar` panel with meal-timing callouts — back-to-back meetings, travel, late events |

---

## 5. Core Features

### 5.1 The Chat Interface (The Foundation)
Clarity's home screen is a clean, minimal chat interface — familiar enough to be immediately understood, beautiful enough to make jaws drop.

- A centered conversation thread with message history
- A persistent input bar at the bottom — supports typing or voice
- Agent status shown inline as a subtle streaming indicator while Claude is thinking/browsing
- Each response in the thread is either a plain Claude message OR a rendered UI panel
- Suggested starter prompts on the empty state are health-first: "What should I eat right now?", "I have eggs, spinach, and leftover rice — what can I make?", "I'm flying LAX to Heathrow tonight — plan my meals.", "I just had a Shake Shack burger. What's dinner?"

The UI should feel like a premium, opinionated evolution of the chat paradigm. Think: what if a Michelin-trained chef, a sports nutritionist, and Linear's design team built a chat interface together.

### 5.1a The Four Headline Panels (New)

These are the panels that carry the pivot. Each has a strict data contract surfaced to Claude via the system prompt.

**`meal-pick` — "What should I eat right now?"**
- Single lead recommendation with a one-sentence *reason* tied to context (time of day, next calendar event, last meal, weather).
- Estimated macros: calories, protein, carbs, fat. Fiber and sodium when relevant.
- 1–3 alternates (name + macros + one-line reason) so the user feels they still have agency.
- Optional `todayProgress` block that shows running totals vs targets when the session has logged earlier meals.

**`fridge-scan` — "Here's what I have, what can I make?"**
- Takes an ingredient list (and optional staples-on-hand hint).
- Returns 2–3 recipes: name, prep minutes, difficulty, macros, 4–6 step preview, and a clearly-marked `missingIngredients` list so the user knows if they need to run out for soy sauce.
- Tags for common needs: "high-protein", "one-pan", "no oven", "kid-friendly".

**`nutrition-log` — "I just ate X. How's the day looking?"**
- Logs the named meal with estimated macros and an optional "watch out for…" note (e.g., "high sodium — hydrate this afternoon").
- Running `dayTotals` for calories/protein/carbs/fat/fiber/sodium shown as unobtrusive progress bars (no green/red stoplight; muted gold on warm surface).
- A `nextMealSuggestion` block: one description ("light, fiber-rich dinner with lean protein") and 2–3 concrete example meals the user could choose.

**`on-the-road` — The correspondent's killer panel**
- Used for "I'm at [airport/city] with N minutes" or "I'm flying X to Y."
- Three horizons on one card:
  1. **Now:** best food pick at current location, macros, a note about what to ask the counter for.
  2. **Onboard/transit:** hydration target (in liters), whether to skip the in-flight meal, snack advice.
  3. **Arrival:** local time at destination, first-meal idea in destination time zone, with a "why" line.
- Tied to the user's calendar/flight data when present; otherwise fills from the prompt's stated flight.

### 5.1b Panels Carried Over (still useful in the pivoted product)

- `calendar` — unchanged; used to reason about meal timing ("eat before your 3pm live hit, not after").
- `email-draft`, `inbox` — unchanged; the correspondent persona still lives in email.
- `weather-brief` — surfaces heat/hydration cues for outdoor events.
- `comparison-table` — comparing restaurants, meal services, supplements.
- `news-brief` — food/health research, new studies, product recalls.
- `timeline-plan` — multi-day meal plans or itineraries with food built in.

### 5.1c Panels Retired / De-emphasized

- `stock-watch`, `globe` — remain registered so bundled demo seeds don't break, but are excluded from the new system-prompt examples and home-screen suggestions. They are legacy demos only.

### 5.2 Voice Input
- Web Speech API — browser-native, no API key, completely free
- Tap the mic icon → speak your request → Clarity processes it exactly like a typed message
- A live waveform animation plays while listening (this is the NBC camera moment)
- Graceful fallback to text if speech recognition fails in a noisy environment

### 5.3 Generative UI Engine (The Core Differentiator)
When Claude determines a response warrants a visual, it returns a **JSONL component spec** instead of plain text. The frontend renderer processes this spec through a multi-stage pipeline before rendering:

1. **Sanitization**: Ensures every element has valid `type` and `props` objects (streaming partials can leave incomplete entries)
2. **Repair**: Auto-fixes common LLM generation issues:
   - Naming mismatches (e.g., parent references "forecast-tabs" but actual element is "forecast-tabs-container")
   - Missing wrapper components (e.g., Grid references "ny-card" but only "ny-header", "ny-metrics", "ny-details" exist → auto-create Card wrapper)
   - Prop normalization (Tables: `accessorKey` → `key`, `header` → `label`; Tabs: `id` → `value`; etc.)
3. **Deduplication**: Removes duplicate children and state array entries that can occur during streaming patches
4. **Rendering**: Maps spec elements to React components via a **Component Registry** pattern, with state binding and event handling

This approach, proven in genUIne, allows Claude to "draw" UIs with words, and the system to make them actually work—with stateful interactivity, sorted tables, collapsible sections, and real-time updates.

**Component Library — in priority order for the hackathon:**

**Core Layout Components:**

- **Card** – Container for panels with optional title/description; supports maxWidth and centered props
- **Grid** – Responsive grid layout (1-4 columns); auto-adjusts for breakpoints
- **Stack** – Flex container with gap, align, justify, and direction props
- **Heading** – h1/h2/h3/h4 with size-appropriate typography
- **Text** – Paragraph with optional muted styling

**Data Display Components:**

- **Table** – Sortable table with column normalization; supports both `{key, label}` and TanStack-style `{accessorKey, header}`; deduplicated rows
- **BarChart** – Recharts bar chart with title, configurable colors, and ChartContainer wrapper (supports aggregation: sum, count, avg)
- **LineChart** – Single or multi-line charts with auto-color cycling, Y-axis formatting (k notation for large numbers), and optional legend
- **PieChart** – Donut-style chart with inner radius, legend, and configurable slice colors
- **Metric** – Large number with label, optional trend indicator (up/down/neutral with colored arrow), and detail text
- **Progress** – Progress bar with label and max value
- **Badge** – Status badge with default/secondary/success/warning variants
- **Avatar** – Image avatar with fallback initials
- **Image** – Clickable image with lightbox support; configurable width, height, alignment, rounded corners

**Interactive Components:**

- **Button** – Primary/secondary/ghost/destructive actions; emits "press" event
- **Tabs** – Tabbed interface with auto-normalized tab items from `{value, label}` or aliases; content wrapped in TabContent
- **Accordion** – Expand/collapse sections; single or multiple mode
- **RadioGroup** – Single-select radio buttons with label; normalized options
- **SelectInput** – Dropdown select; normalized options
- **TextInput** – Single-line text input with type (text, number, email) and placeholder
- **Timeline** – Vertical timeline with status dots (completed/current/upcoming), dates, descriptions

**Specialized Components:**

- **Callout** – Info/tip/warning/important callout with colored left border, icon, and title/content
- **Separator** – Horizontal or vertical divider
- **Skeleton** – Loading placeholder (bone) with configurable width/height
- **Alert** – Error/success/info alert with title and description
- **Scene3D** – 3D scene using React Three Fiber; lazily loaded (~500KB); supports children: Box, Sphere, Cylinder, Cone, Torus, Plane, Ring, AmbientLight, PointLight, DirectionalLight, Stars, Label3D
- **Scene2D** – 2D SVG scene with Group2D, Rect, Circle, Line, Path, Text2D primitives
- **Map** – Mapbox GL map with markers; lazily loaded (~300KB); supports custom map styles
- **FollowUpChoices** – Suggests follow-up queries after Claude's response (embedded at bottom of panel)

**3D Scene Components (all lazy-loaded, optimized for streaming):**

- **Box**, **Sphere**, **Cylinder**, **Cone**, **Torus**, **Plane**, **Ring** – Geometry primitives with position, rotation, scale, onClick
- **AmbientLight**, **PointLight**, **DirectionalLight** – Lighting with color, intensity, position
- **Stars** – Starfield background with radius, depth, count, factor, fade, speed
- **Label3D** – 3D text label with position, color, fontSize
- **HoverableGroup3D** – Group that shows billboard label on hover (used for planets/objects)
- **PlanetInfoOverlay** – Displays planet name and facts from state when hovering

**Key Insights from genUIne:**

All components support a **Component Registry** pattern where each component:
- Accepts `props` (parameter object) and `children` (for nesting)
- Emits events via `emit("eventName")` (e.g., Button emits "press")
- For input components, supports **two-way binding** via `useBoundProp` hook (bindings prop) to sync with state
- Components auto-normalize variant prop styles (e.g., Table normalizes columns, Tabs normalizes items)
- Heavy components (3D, Map) are lazy-loaded to keep initial bundle small
- Built on top of Shadcn UI primitives (Card, Tabs, Accordion, Table, etc.) for consistency

**Spec Format (JSONL):**

Claude emits a spec like:
```json
{
  "$schema": "https://json-render.org/spec/v1",
  "root": "main-card",
  "elements": {
    "main-card": {
      "type": "Card",
      "props": { "title": "AI News Today" },
      "children": ["headline", "sentiment-badge"]
    },
    "headline": {
      "type": "Heading",
      "props": { "level": "h2", "text": "Clarity Launches on NBC" }
    },
    "sentiment-badge": {
      "type": "Badge",
      "props": { "variant": "success", "text": "Positive" }
    }
  },
  "state": {
    "/tone": "formal"
  }
}
```

The registry maps `"type"` to React components; `children` references other element keys; `state` is shared across all components via React Context. This decouples Claude's output from specific component implementation details—only a common spec contract is needed.

### 5.4 Autonomous Claude Agent (The Backend Brain)
A LangGraph cyclic state machine, fully ported to Claude (Anthropic), that:
- Receives the user's message and plans which tools to call before acting
- Executes tools in sequence (search → browse → read → compose)
- Decides whether the response should be plain text or a UI component spec
- Streams its progress back to the frontend so users can see it working in real time
- Handles errors gracefully with retries and fallback strategies

**The critical upgrade over GenUIne:** every tool call and model invocation uses Claude. Stagehand natively supports Anthropic's API, meaning the same key powers both the reasoning layer and the browser automation — no second AI vendor required.

### 5.5 Web Intelligence (Exa.ai)
- Semantic web search — finds the *right* page, not just keyword matches
- Used for: news discovery, product research, competitor lookups, people searches
- Returns URLs that Stagehand can then visit for deep extraction
- 1,000 searches/month free — sufficient for the hackathon

### 5.6 Browser Automation (Stagehand)
- Stagehand is the "hands" of the agent — it navigates and interacts with live websites
- Can click, scroll, extract tables, fill forms, and screenshot
- Runs locally during the hackathon; Browserbase cloud option available if needed
- Powered by Claude natively (no separate OpenAI key required — this is the key difference)

### 5.7 Google Workspace Integration
- **Gmail:** Read inbox threads, draft replies, send confirmed drafts
- **Google Calendar:** Check availability, create events, surface conflicts
- **Google Drive:** Search for documents, read content, reference in composed emails
- Auth via Google OAuth 2.0 — one-time setup required before the hackathon

### 5.8 Inline Agent Activity Stream
While the agent is working, the chat thread shows a live, minimal progress indicator — a small inline element that streams tool names and status as they execute. This makes the "magic" visible without overwhelming the UI. It collapses when the final panel renders.

Example stream:
```
Searching the web for "AI coding tools 2026"...
Reading cursor.sh...
Reading github.com/features/copilot...
Synthesizing comparison...
```

### 5.9 Conversation History & Context
- The full conversation thread persists in the session
- Claude receives conversation history on each turn for contextual follow-ups
- Users can ask follow-up questions on any rendered panel: "make it shorter," "use a more formal tone," "add more sources"
- Panels in the thread remain interactive even after new messages are sent

---

## 6. Technical Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLARITY ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CLARITY FRONTEND                          │  │
│  │  Next.js 16 App Router | React 19 | Tailwind v4 | Shadcn     │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │              CHAT THREAD                               │  │  │
│  │  │  [User message]                                        │  │  │
│  │  │  [Agent activity stream — inline, monospace]           │  │  │
│  │  │  [JSONL Spec] → [Renderer Pipeline] → [Panel Card]     │  │  │
│  │  │  [User message]  ...                                   │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │     Input Bar — Text/Voice → Send                      │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────┬───────────────────────────────-┘  │
│                                │ Vercel AI SDK (streaming)         │
│  ┌─────────────────────────────▼────────────────────────────────┐  │
│  │              NEXT.JS API ROUTES (App Router)                 │  │
│  │   /api/chat    /api/google    /api/title    /api/stream      │  │
│  └─────────────────────────────┬────────────────────────────────┘  │
│                                │                                   │
│  ┌─────────────────────────────▼────────────────────────────────┐  │
│  │           CLAUDE SWARM AGENT (Claude API)                    │  │
│  │  ┌─────────────┐   ┌────────────┐   ┌─────────────────────┐  │  │
│  │  │   PLANNER   │ → │  EXECUTOR  │ → │  UI SPEC GENERATOR  │  │  │
│  │  │  (Claude)   │   │  (Tools)   │   │  (JSONL Spec)       │  │  │
│  │  └─────────────┘   └────────────┘   └─────────────────────┘  │  │
│  └──────────┬─────────────────┬──────────────────┬──────────────┘  │
│             │                 │                  │                 │
│  ┌──────────▼───────┐ ┌──────▼─────────┐ ┌─────▼────────────┐      │
│  │   ANTHROPIC API  │ │    EXA.AI      │ │   STAGEHAND      │      │
│  │   (Claude)       │ │   Search       │ │   Browser        │      │
│  └──────────────────┘ └────────────────┘ └──────────────────┘      │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  GOOGLE OAUTH & APIs                         │  │
│  │  Gmail | Calendar | Drive (OAuth 2.0 flow)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.1 Generative UI Renderer Pipeline

The frontend **Renderer Pipeline** processes Claude's JSONL spec through these stages:

```
API Response (streaming)
    ↓
Receive JSONL chunks (spec fragments)
    ↓
[STAGE 1] Accumulation — collect patches into a partial spec object
    ↓
[STAGE 2] Sanitization — ensure all element entries have {type, props}; drop invalid patches
    ↓
[STAGE 3] Repair — fix common LLM generation errors:
              • Naming mismatches ("foo-tabs" → "foo-tabs-container")
              • Missing wrapper components (auto-create Card around orphaned children)
              • Prop normalization (Table columns, Tabs items, Accordion items, RadioGroup options, Map markers)
    ↓
[STAGE 4] Deduplication — remove duplicate children and state array entries from streaming patches
    ↓
[STAGE 5] Render — feed clean spec to <Renderer> from @json-render/react with:
              • Component Registry (maps types to React components)
              • StateProvider (global state)
              • ActionProvider (event handlers)
              • VisibilityProvider (conditional rendering)
    ↓
Batched React updates (Fiber Reconciliation)
```

**Why this pipeline matters:**
During streaming, Claude may emit incomplete or contradictory patches (e.g., same child referenced twice, or a Table with mixed column prop styles). The repair and deduplication stages ensure the rendered UI is robust without needing to regenerate or penalize the user.

### 6.2 Component Registry Pattern

Components are registered via `defineRegistry()` from `@json-render/react`. Each registry entry specifies how to render a spec element type:

```typescript
{
  components: {
    Card: ({ props, children }) => (
      <ShadcnCard className={`max-w-${props.maxWidth ?? 'full'} w-full`}>
        {props.title && <CardTitle>{props.title}</CardTitle>}
        <CardContent>{children}</CardContent>
      </ShadcnCard>
    ),
    Table: ({ props }) => {
      // Normalize columns, add sorting, deduplicate rows
      // Supports both {key, label} and {accessorKey, header}
      // Returns sortable Shadcn Table
    },
    Button: ({ props, emit }) => (
      <ShadcnButton onClick={() => emit("press")} variant={props.variant}>
        {props.label}
      </ShadcnButton>
    ),
    // ... 20+ more components
  },
  actions: {
    // Server-side safe actions (e.g., fetchPlanetInfo)
    // Called by components via invokeAction("actionName", params, setState)
  }
}
```

The registry enables:
- **Loose coupling**: Claude only needs to know type names and accepted props; the implementation can evolve independently.
- **Normalization**: Components accept a range of prop aliases (e.g., Tabs accept `{id, value, key}` for tab value) and normalize internally.
- **Event handling**: Components emit events (`emit("press")`) that bubble to the renderer; parent components can listen via `onEvent`.
- **State binding**: Use `useBoundProp` to bind component props to global spec state, enabling two-way interaction (e.g., RadioGroup selection updates `/tone` state, which other components can read).

**Component Props Contract:**
Props are passed as a plain object. Validation is lenient—components should gracefully handle missing or unrecognized props and fall back to sensible defaults.

### 6.3 State Management & Two-Way Binding

Clarity uses React Context via `@json-render/react`:

- **StateProvider**: Root context holding the global spec state object (flat key-value store, keyed by string paths like `/tone`, `/selectedEmail`).
- **ActionProvider**: Provides `emit(eventName)` to components for event handling, and `invokeAction(actionName, params)` for server-side actions.
- **VisibilityProvider**: Manages conditional rendering (show/hide elements based on state predicates).

**Two-way binding pattern:**

```tsx
RadioGroup: ({ props, bindings }) => {
  const [value, setValue] = useBoundProp<string>(
    props.value as string | undefined,
    bindings?.value  // e.g., "/tone"
  );
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      {/* options */}
    </RadioGroup>
  );
}
```

- When component mounts, `useBoundProp` reads from global state at `bindings.value` path if provided, else uses `props.value`.
- When user changes selection, `setValue` updates both local state AND global spec state.
- Other components bound to the same path automatically update (reactive).

This pattern is used for all interactive state: selected tabs, expanded accordion items, form inputs, etc.

### 6.4 API Routes & Streaming

Clarity uses Vercel AI SDK with a custom `DefaultChatTransport`:

- **`/api/chat`**: Main streaming endpoint. Accepts Claude-formatted messages, returns stream with text parts + tool calls + UI spec data parts.
- **`/api/google`**: OAuth callback handler and Google API proxy (to avoid CORS and keep credentials server-side).
- **`/api/stream` (optional)**: For browser-native Stagehand streaming logs to frontend.
- **`/api/title`**: Tiny endpoint to generate a short chat title from the first user message (for sidebar).

The transport uses `prepareSendMessagesRequest` to strip heavy spec data from history before sending to Claude, keeping context size manageable.

### 6.5 Performance Optimizations

- **Lazy loading**: 3D (three.js ~500KB) and Mapbox (~300KB) components loaded via React.lazy + dynamic() with suspense fallbacks.
- **Spec compression**: During streaming, only diffs (JSON patches) are sent, not full spec each time.
- **Message history cap**: Last 20 messages retained to prevent unbounded context growth.
- **Virtualization (optional)**: For very long chat histories, consider react-virtual for smooth scrolling.
- **Memoization**: `ExplorerRenderer` memoizes spec sanitization/repair/deduplication (checked by spec reference equality).
- **Debounced resizing**: Textarea auto-resize uses requestAnimationFrame to avoid layout thrashing during rapid input changes.

### 6.6 Generative UI Spec Schema (LLM Contract)

Claude should be prompted to emit a JSONL patch or full spec adhering to this schema:

```typescript
type Spec = {
  $schema?: string;    // "https://json-render.org/spec/v1"
  root: string;        // Key of the root element in `elements`
  elements: Record<string, SpecElement>;  // Element registry by key
  state?: Record<string, any>;           // Optional initial state (flat or nested)
}

type SpecElement = {
  type: string;                // Component type (e.g., "Card", "Table", "Button")
  props?: Record<string, any>; // Component props (any JSON-serializable)
  children?: string[];         // Keys of child elements (for tree building)
  // No `key` needed — the element's key in `elements` is its identifier
}
```

**Example spec for a News Brief Card:**

```json
{
  "$schema": "https://json-render.org/spec/v1",
  "root": "news-card",
  "elements": {
    "news-card": {
      "type": "Card",
      "props": { "title": "Today in AI", "maxWidth": "lg" },
      "children": ["headline", "sentiment-badge", "summary", "sources"]
    },
    "headline": {
      "type": "Heading",
      "props": { "level": "h2", "text": "Clarity Launches on NBC" }
    },
    "sentiment-badge": {
      "type": "Badge",
      "props": { "variant": "success", "text": "Positive" }
    },
    "summary": {
      "type": "Text",
      "props": { "content": "Today marks a major milestone..." }
    },
    "sources": {
      "type": "Card",
      "props": { "title": "Sources" },
      "children": ["source-link-1", "source-link-2"]
    },
    "source-link-1": {
      "type": "Link",
      "props": { "href": "https://example.com", "text": "Read article →" }
    },
    "source-link-2": {
      "type": "Link",
      "props": { "href": "https://example.org", "text": "Read article →" }
    }
  },
  "state": {
    "/expandedSources": true
  }
}
```

**Prompts to Claude (few-shot examples):**

```
User: "What's the biggest tech news today?"

Assistant: (sends spec with root "news-card", elements include Card -> Heading -> Badge -> Text -> Link chain)

User: "Draft a reply to the most urgent email"

Assistant: (sends spec with root "email-draft", elements include Card -> TextInput(subject), TextArea(body), SelectInput(tone), Button(send))

User: "Show me a 3D globe of AI investment"

Assistant: (sends spec with root "globe-scene", elements include Scene3D -> Sphere + Stars + PointLights, with data-driven colors per country)
```

**Important:** The spec is sent as a special data part (`SPEC_DATA_PART_TYPE`) in the Vercel AI SDK message stream, not as text. The frontend extracts it and feeds it to the renderer. Claude should *not* describe the UI in text—the spec is the response.

**Extensibility:** New component types can be added to the registry without changing the spec schema; Claude only needs to know the type name and a brief description in its system prompt. Start with a core set (Card, Heading, Text, Button, Badge, Table, Chart, etc.) and expand as time allows.

---

### 6.7 Claude System Prompt for UI Spec Generation

To make Claude emit valid JSONL specs, include this system message when initializing the agent:

```
You are Clarity, an AI assistant that renders responses as interactive UI components instead of plain text.

When a user request would benefit from a visual component, generate a JSONL specification describing the UI. The spec follows this structure:

{
  "root": "element-key",
  "elements": {
    "element-key": { "type": "ComponentType", "props": { ... }, "children": [...] },
    ...
  },
  "state": { ... }  // optional shared state
}

Available component types (with typical uses):
- Card: container with title
- Grid: responsive grid layout
- Stack: flex container (vertical/horizontal)
- Heading: h1-h4
- Text: paragraph
- Badge: status label
- Button: action button (emits "press" event)
- Table: sortable table with columns
- BarChart, LineChart, PieChart: data visualizations
- Metric: large number with trend
- Tabs, Accordion: collapsible sections
- Callout: info/tip/warning/important
- Image: clickable with lightbox
- Timeline: vertical event timeline
- TextInput, SelectInput, RadioGroup: form inputs (two-way bind to state)
- Scene3D: 3D scene with 3D primitives
- Map: map with markers

Guidelines:
1. Choose the right component for the content (e.g., use Table for tabular data, Chart for numeric trends).
2. Define a clear root element and build a tree via children references.
3. Use descriptive keys that indicate purpose (e.g., "news-card", "email-draft").
4. Normalize prop names: use `key` and `label` for table columns; `value` and `label` for select options; `level` for Heading.
5. For interactive state, use the `state` object. Bind components to state paths (e.g., "/tone") for two-way updates.
6. Keep the spec minimal—only include necessary elements. Omit default props.
7. If you need to show raw data, include it in a Table or Card, not as a long text dump.

Examples:

User: What is the weather in Tokyo?

Assistant: (emits spec with root "weather-card", elements: Card -> Heading("Tokyo Weather"), Metric(temperature), Badge(condition), Text(forecast))

User: Compare the top 3 AI coding assistants

Assistant: (emits spec with root "comparison-table", elements: Card -> Heading, Table with columns Feature, Cursor, Copilot, Claude Code, rows of features)

Emit only the spec as a JSON object. Do not include explanatory text.
```

---

### Key Changes vs. GenUIne

---

## 7. UI/UX Direction

### Design Identity: "Calm Luxury"

Clarity presents as a serene, high-end product that prioritizes clarity and comfort over flashiness. The interface feels like a premium lounge — quiet, elegant, and reassuring.

- **Tone**: Confident but understated. Professional warmth without artificial cheer.
- **Metaphor**: A fine parchment or linen — natural, tactile, timeless. Or a luxury watch face: minimalist markers, purposeful details.
- **Color**: Rich, muted, and warm. Deep blue-gray backgrounds (not pure black), surfaces with subtle warmth, borders that define without shouting. Accent in a muted gold or bronze that reads as premium, not flashy. Zero gradients, zero neon, zero glow effects.
- **Typography**: Aleo (serif) for headings — elegant, literary, confident. Manrope (sans-serif) for body — clean, modern, highly legible. JetBrains Mono for agent activity/logs. Fixed rem-based scale with generous line height.
- **Motion**: Slow, smooth, easing out over ~250ms. Panel entries fade and slide gently. Stagger children for a composed entrance. No bounces, no elastic easing. Respect reduced-motion.
- **Differentiation**: Every pixel feels intentional. No AI slop tropes: no gradient text, no purple-to-blue fades, no side-stripe borders, no generic rounded cards with drop shadows. This is the anti-vibe-coded interface.

### Design System: Color, Typography, Motion

**Color Palette (Dark Theme Only)**

| Token | OKLCH | Usage |
|---|---|---|
| `background` | `oklch(0.12 0.01 255)` | Deep blue-gray (not black) |
| `surface` | `oklch(0.16 0.02 255)` | Cards, inputs, popovers |
| `surface-highlight` | `oklch(0.20 0.02 255)` | Hover states, emphasis |
| `border` | `oklch(0.30 0.02 255)` | Subtle defining borders |
| `foreground` | `oklch(0.92 0.01 255)` | Primary text |
| `foreground-muted` | `oklch(0.65 0.01 255)` | Secondary text, disabled |
| `primary` | `oklch(0.75 0.07 75)` | Muted gold / bronze — actions, links |
| `primary-hover` | `oklch(0.72 0.07 75)` | Slightly deeper gold |
| `success` | `oklch(0.70 0.08 160)` | Muted teal — success states |
| `warning` | `oklch(0.72 0.10 75)` | Muted amber — warnings only |
| `muted` | `oklch(0.50 0.01 255)` | Tertiary text, borders |

**Typography**

- **Display Font:** Aleo (serif) — elegant, literary, high-contrast. Used for headings, logo wordmark (when designed), empty states.
- **Body Font:** Manrope (sans-serif) — clean, modern, highly legible. Used for all UI text, chat messages, labels.
- **Mono Font:** JetBrains Mono — for agent activity streams, code snippets, metrics.
- **Base size:** 16px (1rem)
- **Scale (fixed rem, no fluid):**
  - h1: 2.5rem (40px), Aleo regular, line-height 1.2, margin-bottom 1.5rem
  - h2: 2rem (32px), Aleo regular, line-height 1.25, margin-bottom 1.25rem
  - h3: 1.5rem (24px), Aleo regular, line-height 1.3, margin-bottom 1rem
  - h4: 1.25rem (20px), Aleo regular, line-height 1.35, margin-bottom 0.75rem
  - body: 1rem (16px), Manrope regular, line-height 1.6
  - small: 0.875rem (14px), line-height 1.5, foreground-muted
  - mono-small: 0.75rem (12px), JetBrains Mono, line-height 1.5

**Spacing Scale**
Follow 4px base increments: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96.
Use semantic tokens: `--space-xs` (4px), `--space-sm` (8px), `--space-md` (16px), `--space-lg` (24px), `--space-xl` (32px), `--space-2xl` (48px).
Prefer `gap` over margins for sibling spacing.

**Border Radius**
- `sm`: 0.25rem (4px) — tiny accents, borders
- `md`: 0.5rem (8px) — inputs, small cards, buttons
- `lg`: 0.75rem (12px) — panel cards, medium containers
- `xl`: 1rem (16px) — chat bubbles
- `full`: 9999px — pills, avatars, circles

**Motion & Animation**

- **Easing**: `cubic-bezier(0.25, 0.1, 0.25, 1)` (ease-out-quint) for smooth deceleration.
- **Durations**: 200ms (hover), 300ms (panel entrance), 500ms (page transitions).
- **Panel entrance**: `opacity: 0` + `transform: translateY(8px)` → `opacity: 1` + `transform: translateY(0)`, 300ms ease-out-quint, staggered children 80ms apart.
- **Fade**: Simple opacity transitions 200–300ms.
- **No shimmer or skeleton pulsing** if possible; prefer static placeholder shapes or "loading…" text to avoid grainy effects.

**Key Interactions**

- Hover: Background lightens 10–15% on `surface` tokens; border may intensify slightly.
- Focus: `outline: 2px solid oklch(0.75 0.07 75)`; `outline-offset: 2px`; no ring shadows.
- Active: Scale down `0.98` on buttons for tactile feedback.
- Panel entry: Stagger children with 50–100ms delays, cascade down the DOM tree.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` set all durations to 0ms, disable transforms.

**Component-Specific Styles**

**Chat Bubble (User)**
- Right-aligned, full pill (`rounded-full`).
- Background: `primary` with `foreground` (light) text.
- Padding: `0.75rem 1rem` (12px vertical, 16px horizontal).
- Max-width: 80% of container, `min-width: 160px`.
- No shadow, no gradient, no border.

**Chat Bubble (Claude/Assistant)**
- Left-aligned, transparent background.
- Text color: `foreground-muted`.
- Max-width: 85% of container.
- Agent activity stream: `font-family: JetBrains Mono`, `font-size: 0.75rem`, `color: var(--foreground-muted)`, `font-style: italic`, line-height 1.5.
- Activity stream sits *above* any rendered panel within the same message.

**Rendered Panel Card**
- Background: `surface` with `1px solid var(--border)`.
- Border radius: `lg` (12px).
- Padding: `1.25rem` (20px) inside; margin outside: `var(--space-md)`.
- No shadow, no glow, no gradient overlays.
- Layout: Full width of chat thread (not narrow card inside bubble).
- Headings inside: Aleo, appropriate level, `margin-bottom: var(--space-sm)`.
- Text body: Manrope, `line-height: 1.6`, `max-width: 65ch` for readability.

**Input Bar**
- Container: `min-height: 3rem` (48px), `max-height: 12rem` (auto-expand), width 100% within chat area.
- Background: `surface` with `1px solid var(--border)`.
- Border radius: `calc(1.5rem - 1px)` (29px on 30px pill) to align with visual edge.
- Transition: `border-color 200ms ease`, background 200ms ease.
- Textarea: `resize: none`, no ring on focus (use border-color change). Padding: `0.75rem 1rem`.
- Floating placeholder: `foreground-muted`, Manrope italic.
- Mic button: Circle `2.5rem` (40px), `border-radius: 9999px`, icon `primary`, hover highlight.

**Buttons**
- Primary: `background: var(--primary); color: var(--foreground); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; transition: opacity 200ms ease`. Hover opacity 0.9.
- Secondary: `background: transparent; border: 1px solid var(--border); color: var(--foreground); padding: 0.5rem 1rem; border-radius: 0.5rem`. Hover: `background: var(--surface-highlight)`.
- Ghost: `background: transparent; color: var(--foreground-muted);` hover `color: var(--foreground)`.
- All buttons: `min-height: 2.5rem` (40px). No shadows.

**Prompt Pills (Suggestions)**
- Container: `display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.25rem; border: 1px solid var(--border); background: var(--surface); border-radius: 1.5rem; transition: all 250ms ease-out-quint`.
- Hover: `background: var(--surface-highlight); border-color: var(--primary)`.
- Text: `font-family: Manrope; font-weight: 500; font-size: 0.875rem; color: var(--foreground); letter-spacing: 0.01em`.
- No backdrop blur, no gradient, no shadows.

**Agent Activity Stream**
- Use monospace `JetBrains Mono`, `font-size: 0.75rem`, `color: var(--foreground-muted)`, `font-style: italic`.
- Each log line: `display: block; margin-bottom: 0.25rem; opacity: 0` initially, fade in 150ms ease-out when streaming.
- Tool names: `color: var(--primary); font-style: normal; font-weight: 500`.

**Sidebar (if used)**
- Width: 16rem (256px) on desktop, hidden on mobile.
- Background: `background` (same as main).
- Border: `1px solid var(--border)` on right.
- Menu items: `height: 2.5rem; padding: 0 0.75rem; display: flex; align-items: center; font-size: 0.875rem; color: var(--foreground-muted); border-radius: 0.375rem`.
- Hover: `background: var(--surface-highlight); color: var(--foreground)`.
- Active: `border-left: 2px solid var(--primary); color: var(--foreground)`.

**Logo**
- No logo mark defined yet. For now, use a simple text placeholder: "Clarity" in Aleo, weight 300, size 1.5rem, color `var(--foreground)`.
- Position: Centered or top-left depending on layout context. No glow, no gradient, no shadow.

### Key Screens

**Screen 1: Empty Chat (Default Home)**
- Layout: Vertically centered content on the `background`.
- Top: "Clarity" in Aleo 2.5rem, color `foreground-muted`, letter-spacing -0.02em.
- Below: 3–4 prompt pills (suggested queries) arranged horizontally with `gap: var(--space-sm)`.
- Bottom: Input bar ready for typing or voice.
- No gradients, no decorative elements, no illustrations — pure typography and space.
- Maximum width of content: 48rem (768px).

**Screen 2: Active Conversation**
- Chat thread: full-width, centered with `max-width: 48rem` (768px). Margin auto.
- Message bubbles: alternating left (assistant) and right (user). Spacing between messages: `var(--space-lg)`.
- Assistant messages may contain: plain text *or* text + rendered panel (panel below text). User messages are pill-shaped, background `primary`, text `foreground`.
- Input bar fixed to bottom `sticky` within viewport with `background: var(--background)` (covers thread content behind it). Padding bottom to avoid overlap.
- Agent activity: small mono italic lines appear under assistant text while tools run; replace with panel when ready.

**Screen 3: Rendered Panel In-Thread**
- Panel card fills the width of the chat container (same max-width as thread). Inner padding `1.25rem`. Border `1px solid var(--border)`. Radius `lg`.
- Headings: Aleo, `font-size: 1.5rem` (h3 level), `margin-bottom: var(--space-sm)`.
- Body: Manrope, `line-height: 1.6`, `max-width: 65ch`, `color: var(--foreground)`.
- Interactive elements: buttons, inputs, tables styled per above. All interactions follow the same palette.
- Entrance: fade from `opacity: 0` + `translateY(8px)` to `opacity: 1` + `translateY(0)` over 300ms ease-out-quint. Stagger direct children by 80ms.

**Screen 4: Loading States**
- Avoid skeleton shimmer. Use: "Working…" text in mono italic, or a minimal spinner (thin ring, `border-primary`, rotation 1s linear infinite) centered where content will appear.
- Text streaming: words fade in sequentially, no shimmer effect on block.

**Responsive Adaptation**
- Base design assumes laptop/desktop with `min-width: 1024px`.
- Mobile (`<768px`): hide sidebar; input bar becomes full-width; prompt pills wrap; panel padding reduces to `1rem`; font sizes same.
- Tablet (`768px–1024px`): reduce thread max-width to `36rem` (576px).

**Accessibility Note**
Accessibility is not a primary focus for this demo; all interactions are mouse/touch driven. Keyboard navigation and reduced-motion considerations are minimal.

---

## 8. Demo Script (NBC Wow Moments)

Run this sequence when the cameras roll. Total runtime: ~5 minutes.

**[0:00] The Hook — First Impression**
Open Clarity to the empty home screen. Pause on it. "This is Clarity. It looks like a chat interface — but watch what happens when you ask it something." Tap the mic.

**[0:30] Voice + News Brief**
Speak: *"What's the most important tech news story right now?"*
Watch: Exa searches → agent activity streams in monospace → Claude synthesizes → a News Brief card renders inline with headline, sentiment gauge, AI summary, and expandable sources.

**[1:30] Email Draft — End to End**
Type or speak: *"Draft a reply to the most urgent email in my inbox."*
Watch: Gmail reads the thread → Claude identifies urgency and context → drafts a reply → an Email Draft card renders with the draft editable inline, tone controls, and a Send button. Hit Send. It sends.

**[2:30] Calendar Check**
Speak: *"Do I have time for a 2-hour focus block this afternoon?"*
Watch: Calendar API checks → Claude finds a gap → a Calendar Panel renders in the thread with the day's events and the available window highlighted. One click to block it.

**[3:15] Live Web Research**
Type: *"Compare Cursor, Copilot, and Claude Code — which is best for a junior developer?"*
Watch: Exa finds sources → Stagehand visits the live pages → Claude synthesizes → a Comparison Table card renders with feature rows, notes per tool, and a recommendation section. Sources linked.

**[4:00] 3D Visual Wow**
Speak: *"Show me global AI investment by country."*
Watch: The 3D interactive globe renders inline in the thread — zoomable, with markers per country. Below it, a Recharts bar chart breaks down the numbers. This is the visual money shot for the cameras.

**[4:45] The Close**
Scroll up through the conversation. Every response is a panel. Every panel is interactive. *"We didn't open a single browser tab, email client, or calendar app. Clarity brought it all here. That's what we built."*

---

## 9. Team Roles & 5-Hour Build Plan

### Recommended Team Structure (5 people)

| Role | Owns |
|---|---|
| **P1 — Architect / Lead** | LangGraph graph, Claude API wiring, streaming pipeline, API routes |
| **P2 — Frontend Lead** | Chat UI, design system, component layout, animations, overall polish |
| **P3 — Tools Engineer** | Exa.ai, Stagehand browser tool, Google OAuth + Gmail/Calendar APIs |
| **P4 — Generative UI Dev** | JSONL renderer, all panel components (News, Email, Calendar, Research, 3D) |
| **P5 — Integration + Demo** | End-to-end wiring, voice input, agent activity stream, demo rehearsal |

### Hour-by-Hour Sprint Plan

```
HOUR 0:00–0:30  | KICKOFF & SETUP
├── All: Fork GenUIne, swap OpenAI → ANTHROPIC_API_KEY everywhere
├── P1: Quick smoke test — Claude tool-calling works in LangGraph
├── P2: Design system setup — dark theme, color vars, typography, base chat layout
└── P3: Confirm Exa key works, Google OAuth credentials ready, Stagehand runs locally

HOUR 0:30–1:30  | CORE INFRASTRUCTURE
├── P1: Claude plan→execute→respond loop in LangGraph with streaming
├── P2: Chat thread UI — message bubbles, input bar, mic button, empty state
├── P3: Exa.ai search tool working end-to-end (search → result → Claude)
└── P4: Generative UI renderer scaffold — JSONL spec → React component switcher

HOUR 1:30–2:30  | FEATURES — PARALLEL TRACKS
├── P1+P3: Gmail read tool + Gmail send tool; Calendar availability tool
├── P3: Stagehand browser tool wired to Claude (test on one real site)
├── P2: Chat polish — agent activity stream inline, panel render animations
└── P4: News Brief card + Email Draft card (complete and interactive)

HOUR 2:30–3:30  | FEATURES CONTINUED + INTEGRATION
├── P1+P5: Wire chat frontend to LangGraph streaming loop (full round trip)
├── P5: Voice input (Web Speech API) + waveform animation
├── P4: Calendar Panel, Research Report card, Comparison Table
└── P3: Google Calendar write tool + end-to-end Gmail send test

HOUR 3:30–4:30  | POLISH & DEMO PREP
├── P2+P4: Full UI pass — spacing, hover states, card borders, animations
├── P5: Rehearse demo script; identify anything flaky and fix or mock it
├── P1: Error handling, loading states, graceful fallbacks
└── All: Two full end-to-end demo runs, timed

HOUR 4:30–5:00  | BUFFER / FINAL REHEARSAL
├── Fix the one or two things that still feel rough
├── Final full demo run — all team watching, on-camera timing
└── Prepare the 60-second NBC pitch: hook, demo summary, vision
```

### Minimum Viable Demo (If Behind Schedule)
The absolute floor — still impressive, still NBC-worthy:
1. Clean, polished chat UI — non-negotiable regardless of anything else
2. News Brief card: Exa search → Claude synthesis → rendered panel ✓
3. Email Draft card: Gmail read → Claude draft → rendered with Send button ✓
4. Voice input triggering a command (even if basic) ✓
5. Inline agent activity stream while tools run ✓

The 3D globe, Calendar panel, Stagehand browsing, and Comparison Table are "level 2" — build them if time allows, but don't let them block the core loop.

---

## 10. API & Integration Plan

### All Free / Low-Cost for Hackathon

| Service | Free Tier | Powers |
|---|---|---|
| **Anthropic Claude** | Via Claude Code credits | Core AI, tool use, generation, Stagehand |
| **Exa.ai** | 1,000 searches/month | Web search, news discovery, URL finding |
| **Stagehand** | Open source (uses Anthropic key) | Live webpage navigation and data extraction |
| **Google OAuth** | Free | Gmail, Calendar, Drive |
| **Web Speech API** | Browser-native — no key | Voice input |
| **NewsAPI.org** | 100 req/day (dev tier) | Optional supplement for headlines |
| **React Three Fiber** | Open source | 3D globe and visualizations |
| **Recharts** | Open source | Data charts inside panels |
| **Framer Motion** | Free | UI animations |

### Environment Variables
```env
ANTHROPIC_API_KEY=sk-ant-...

EXA_API_KEY=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

NEWS_API_KEY=...              # Optional

BROWSERBASE_API_KEY=...       # Optional — only needed for Stagehand cloud mode
```

> **Pre-hackathon required:** Complete the Google Cloud Console OAuth consent screen setup and authorize one test Google account *before* the day of the hackathon. This can take 20–30 minutes and will eat sprint time if left for the day-of.

---

## 11. Risk Register & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Google OAuth not set up in time | High | Do it the night before; pre-authorize one test account |
| Stagehand is slow or flaky on demo day | Medium | Pre-cache one Stagehand result; use live only if stable |
| LangGraph streaming has bugs | Medium | Build and test the happy path only; skip retry/error logic for now |
| Voice recognition fails in a noisy room | Medium | Have keyboard fallback ready; test mic sensitivity ahead of time |
| Claude API rate limits mid-demo | Low | Streaming responses, no redundant calls, one team Anthropic account |
| Generative UI panels look rough | Medium | P4 owns this — first hour after setup is entirely panel quality |
| 3D globe is slow to load | Low | Lazy-load the Three.js scene; keep geometry simple; 2D fallback ready |

---

## 12. Success Metrics (Hackathon)

**Hard — must ship:**
- [ ] Chat interface accepts typed and voice input
- [ ] Agent activity stream is visible while Claude works
- [ ] News Brief card renders end-to-end via Exa + Claude
- [ ] Email Draft card renders with editable draft and working Send button
- [ ] At least 3 distinct panel component types functional
- [ ] Voice input triggers a command successfully on demo hardware

**Soft — for NBC / Judges:**
- [ ] A non-technical viewer understands what Clarity does in 30 seconds
- [ ] Demo runs start to finish without a crash
- [ ] UI looks like a real product, not a hackathon prototype
- [ ] Team has a clean one-sentence answer to "what is this?"
- [ ] 60-second pitch is rehearsed and sounds natural

---

## 13. Future Roadmap (Post-Hackathon)

Worth mentioning to NBC and judges as the vision:
- **Memory** — Clarity remembers preferences, past research, and communication style across sessions
- **Proactive Briefings** — Clarity monitors your inbox and the news and sends a morning brief without being asked
- **Plugin System** — Connect any tool via MCP: Slack, Notion, Linear, Salesforce
- **Mobile** — Clarity on iOS/Android with voice-first UX
- **Clarity for Teams** — Shared conversation threads with collaborative panels
- **Custom Panel Types** — Let developers define their own generative UI component specs

---

*Built with Claude by Anthropic · Hackathon Edition · April 2026*
