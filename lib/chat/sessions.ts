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
  | "on-the-road"
  | "meal-options"
  | "map"
  | "meal-plan";

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
  {
    id: "map-demo",
    title: "Lunch spots near Georgia Tech",
    subtitle: "Today · map compare",
    seeded: true,
    exchanges: [
      {
        id: "ex-map",
        prompt: "Compare lunch spots within walking distance of Georgia Tech.",
        gist: "4 spots · map compare",
        panelKind: "map",
        panelData: {
          eyebrow: "Near Georgia Tech · lunch",
          title: "Four spots within a 10-min walk",
          summary:
            "Ranked by rating · tap a pin for hours and directions.",
          center: { lat: 33.7756, lng: -84.3963, zoom: 15 },
          userLocation: {
            lat: 33.7756,
            lng: -84.3963,
            label: "Georgia Tech",
          },
          markers: [
            {
              id: "1",
              label: "Tin Drum Asian Kitchen",
              description: "Fast pan-Asian · ~$12 · 4.4★ · 4 min walk",
              url: "https://www.google.com/maps/search/Tin+Drum+Asian+Kitchen+Georgia+Tech",
              lat: 33.7766,
              lng: -84.3987,
            },
            {
              id: "2",
              label: "Ferst Place",
              description: "Campus dining hall · ~$10 · 2 min walk",
              lat: 33.7749,
              lng: -84.3966,
            },
            {
              id: "3",
              label: "Moe's Original BBQ",
              description: "Southern BBQ · ~$14 · 4.3★ · 6 min walk",
              url: "https://www.google.com/maps/search/Moes+Original+BBQ+Atlanta",
              lat: 33.7747,
              lng: -84.3911,
            },
            {
              id: "4",
              label: "Rocky Mountain Pizza",
              description: "Slice shop · ~$6 · 4.1★ · 5 min walk",
              lat: 33.7770,
              lng: -84.3950,
            },
          ],
          footer: {
            anchorLabel: "From Georgia Tech",
          },
        },
        activity: [
          { tool: "location.read", detail: "Georgia Tech · granted" },
          { tool: "places.search", detail: "4 spots · ≤10 min walk" },
          { tool: "render_panel", detail: "kind: map" },
        ],
        timestamp: "Today · 12:15 PM",
      },
    ],
  },
  {
    id: "meal-options-demo",
    title: "35 min before my 2:00",
    subtitle: "Today · nearby meal options",
    seeded: true,
    exchanges: [
      {
        id: "ex-meal-options",
        prompt:
          "I have 35 minutes before my 2 PM client meeting — what should I eat nearby?",
        gist: "Flatiron · walking · 35-min window",
        panelKind: "meal-options",
        activity: [
          { tool: "calendar.today", detail: "next event: Client review · 2:00 PM" },
          { tool: "places.search", detail: "4 viable spots within 6 min walk" },
          { tool: "nutrition.estimate", detail: "macros for top 4 picks" },
        ],
        timestamp: "Today · 1:25 PM",
      },
    ],
  },
];
