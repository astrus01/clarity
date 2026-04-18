export type PanelKind =
  | "news-brief"
  | "email-draft"
  | "comparison-table"
  | "calendar"
  | "globe"
  | "stock-watch"
  | "weather-brief"
  | "timeline-plan";

export type Exchange = {
  id: string;
  prompt: string;
  gist: string; // AI-generated short label
  panelKind: PanelKind;
  activity: { tool: string; detail: string }[];
  timestamp: string; // relative, e.g. "8:42 AM"
};

export type ChatSession = {
  id: string;
  title: string;
  subtitle: string; // e.g., "Today, 9:02 AM" or "Yesterday"
  exchanges: Exchange[];
};

export const SEED_SESSIONS: ChatSession[] = [
  {
    id: "morning-brief",
    title: "A morning with Clarity",
    subtitle: "Today · 8:42 AM",
    exchanges: [
      {
        id: "ex-news",
        prompt: "What's the most important tech news right now?",
        gist: "Tech news, ranked",
        panelKind: "news-brief",
        activity: [
          { tool: "exa.search", detail: '"AI news April 2026" · 12 results' },
          { tool: "stagehand.browse", detail: "theverge.com · extracted article" },
          { tool: "claude.synthesize", detail: "ranking by salience" },
        ],
        timestamp: "8:42 AM",
      },
      {
        id: "ex-email",
        prompt: "Draft a reply to the most urgent email in my inbox.",
        gist: "Reply to Sarah · Q3 brief",
        panelKind: "email-draft",
        activity: [
          { tool: "gmail.list", detail: "ranked 47 unread · urgency heuristic" },
          { tool: "gmail.read", detail: "thread: Sarah Chen · Q3 brief" },
          { tool: "claude.compose", detail: "tone: warm · ~150 words" },
        ],
        timestamp: "8:47 AM",
      },
      {
        id: "ex-calendar",
        prompt: "Do I have time for a 2-hour focus block this afternoon?",
        gist: "Afternoon focus window",
        panelKind: "calendar",
        activity: [
          { tool: "calendar.list", detail: "2026-04-18 · 7 events" },
          { tool: "claude.plan", detail: "largest contiguous gap: 1:30–4:00pm" },
        ],
        timestamp: "8:51 AM",
      },
    ],
  },
  {
    id: "coding-tools",
    title: "Research: AI coding tools",
    subtitle: "Today · 11:03 AM",
    exchanges: [
      {
        id: "ex-compare",
        prompt:
          "Compare Cursor, Copilot, and Claude Code for a junior developer.",
        gist: "Cursor vs Copilot vs Claude",
        panelKind: "comparison-table",
        activity: [
          { tool: "exa.search", detail: '"ai coding assistants 2026"' },
          { tool: "stagehand.browse", detail: "cursor.sh · pricing + features" },
          { tool: "stagehand.browse", detail: "github.com/features/copilot" },
          { tool: "claude.synthesize", detail: "cross-referenced 7 sources" },
        ],
        timestamp: "11:03 AM",
      },
      {
        id: "ex-globe",
        prompt: "Show me global AI investment by country.",
        gist: "Global AI investment, 2026",
        panelKind: "globe",
        activity: [
          { tool: "exa.search", detail: '"global AI investment 2026"' },
          { tool: "stagehand.extract", detail: "crunchbase.com · ranking table" },
          { tool: "scene3d.render", detail: "48 markers · lazy bundle 504KB" },
        ],
        timestamp: "11:09 AM",
      },
    ],
  },
  {
    id: "travel",
    title: "Tokyo trip planning",
    subtitle: "Yesterday",
    exchanges: [
      {
        id: "ex-weather",
        prompt: "What's the weather in Tokyo this week?",
        gist: "Tokyo · 7-day forecast",
        panelKind: "weather-brief",
        activity: [
          { tool: "exa.search", detail: "weather.com Tokyo 7-day" },
          { tool: "stagehand.extract", detail: "forecast table" },
        ],
        timestamp: "Yesterday · 6:14 PM",
      },
      {
        id: "ex-timeline",
        prompt: "Build me a 4-day itinerary focused on architecture.",
        gist: "4-day architecture itinerary",
        panelKind: "timeline-plan",
        activity: [
          { tool: "exa.search", detail: '"tokyo architecture tour"' },
          { tool: "claude.plan", detail: "sequenced 14 stops by neighborhood" },
        ],
        timestamp: "Yesterday · 6:22 PM",
      },
    ],
  },
  {
    id: "markets",
    title: "Market snapshot",
    subtitle: "Apr 16",
    exchanges: [
      {
        id: "ex-stocks",
        prompt: "How are NVDA, AAPL, and TQQQ doing today?",
        gist: "NVDA · AAPL · TQQQ",
        panelKind: "stock-watch",
        activity: [
          { tool: "exa.search", detail: "real-time quotes · 3 tickers" },
          { tool: "stagehand.browse", detail: "finance.yahoo.com" },
        ],
        timestamp: "Apr 16 · 3:54 PM",
      },
    ],
  },
];
