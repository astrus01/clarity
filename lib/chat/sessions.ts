export type PanelKind =
  | "news-brief"
  | "email-draft"
  | "inbox"
  | "comparison-table"
  | "calendar"
  | "globe"
  | "stock-watch"
  | "weather-brief"
  | "timeline-plan"
  | "meal-pick"
  | "fridge-scan"
  | "nutrition-log"
  | "on-the-road";

export type ExchangeStatus = "pending" | "streaming" | "complete" | "error";

export type ActivityLine = { tool: string; detail: string };

export type Exchange = {
  id: string;
  prompt: string;
  gist: string;
  timestamp: string;

  // Panel (rendered from seed OR emitted by the live agent)
  panelKind?: PanelKind;
  panelData?: unknown;

  // Activity stream — seed sessions use it decoratively; live runs append as tools fire.
  activity?: ActivityLine[];

  // Live text streaming
  text?: string;
  status?: ExchangeStatus;
};

export type ChatSession = {
  id: string;
  title: string;
  subtitle: string;
  exchanges: Exchange[];
  /** True for the bundled demo sessions; false for runtime-created chats. */
  seeded?: boolean;
};

export const SEED_SESSIONS: ChatSession[] = [
  {
    id: "morning-brief",
    title: "A morning with Clarity",
    subtitle: "Today · 8:42 AM",
    seeded: true,
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
    seeded: true,
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
    id: "correspondent-tuesday",
    title: "A Tuesday on the road",
    subtitle: "Today · correspondent mode",
    seeded: true,
    exchanges: [
      {
        id: "ex-on-the-road",
        prompt:
          "I'm at LaGuardia with 80 minutes before my flight to London — plan my meals.",
        gist: "LGA → LHR · travel-day plan",
        panelKind: "on-the-road",
        activity: [
          { tool: "calendar.today", detail: "flight LGA→LHR 8:45pm" },
          { tool: "nutrition.estimate", detail: "Cava bowl · 510 kcal" },
          { tool: "claude.synthesize", detail: "airport → plane → London AM" },
        ],
        timestamp: "Today · 7:25 PM",
      },
      {
        id: "ex-nutrition-log",
        prompt: "I just had a Shake Shack burger and fries. What's dinner?",
        gist: "Logged · balancing dinner",
        panelKind: "nutrition-log",
        activity: [
          {
            tool: "nutrition.estimate",
            detail: "SmokeShack + regular fries · 1040 kcal",
          },
          { tool: "claude.balance", detail: "targets vs day-so-far" },
        ],
        timestamp: "Today · 1:17 PM",
      },
      {
        id: "ex-fridge-scan",
        prompt:
          "I've got eggs, leftover rice, half an onion, frozen spinach. Dinner in 20?",
        gist: "Fridge scan · 3 dinners",
        panelKind: "fridge-scan",
        activity: [
          { tool: "claude.plan", detail: "3 recipes · staples assumed" },
          { tool: "nutrition.estimate", detail: "macros per recipe" },
        ],
        timestamp: "Fri · 9:02 PM",
      },
    ],
  },
  {
    id: "real-time-meal",
    title: "What should I eat right now?",
    subtitle: "Today · meal decision",
    seeded: true,
    exchanges: [
      {
        id: "ex-meal-pick",
        prompt: "What should I eat right now?",
        gist: "Midtown · back-to-back calls",
        panelKind: "meal-pick",
        activity: [
          { tool: "calendar.today", detail: "calls 2pm, 3pm, 5:30pm" },
          { tool: "nutrition.estimate", detail: "poke bowl · 560 kcal" },
          { tool: "claude.recommend", detail: "protein + slow carbs" },
        ],
        timestamp: "Today · 1:42 PM",
      },
    ],
  },
];
