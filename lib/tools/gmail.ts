export type EmailThread = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  urgency: "low" | "medium" | "high";
  body: string;
};

// Hackathon-mode fixture inbox.
// Replace with googleapis once OAuth is wired; contract below is intentionally
// simple so the agent loop doesn't need to change.
const INBOX: EmailThread[] = [
  {
    id: "t1",
    from: "Sarah Chen <sarah@acme.co>",
    subject: "Q3 product brief — need your eyes today",
    snippet: "Hey — pulled the deck together and would love your read before…",
    receivedAt: "Today · 8:12 AM",
    urgency: "high",
    body: `Hey,

Pulled the Q3 product brief together and would love your read before the 11am sync. The three open questions I'm still unresolved on:

1. Do we hold the launch until the mobile team catches up, or ship web-only and backfill?
2. What's your intuition on the pricing tier split — is a middle tier going to cannibalize enterprise?
3. Happy to move the retro earlier if it helps you prep.

Let me know when you get a minute.

Sarah`,
  },
  {
    id: "t2",
    from: "GitHub <noreply@github.com>",
    subject: "[astrus01/clarity] CI failed on main",
    snippet: "The workflow 'Test & Lint' failed on commit 78fcf8c.",
    receivedAt: "Today · 7:44 AM",
    urgency: "medium",
    body: "Workflow failure details...",
  },
  {
    id: "t3",
    from: "Danny Park <danny@investors.vc>",
    subject: "Coffee next week?",
    snippet: "Would love to catch up if you have a window…",
    receivedAt: "Yesterday · 4:21 PM",
    urgency: "low",
    body: "Would love to catch up when convenient.",
  },
  {
    id: "t4",
    from: "Amex <no-reply@americanexpress.com>",
    subject: "Statement available",
    snippet: "Your April statement is ready to view.",
    receivedAt: "Yesterday · 10:02 AM",
    urgency: "low",
    body: "Statement body.",
  },
];

export function listThreads(max = 10): EmailThread[] {
  return INBOX.slice(0, max);
}

export function readThread(id: string): EmailThread | null {
  return INBOX.find((t) => t.id === id) ?? null;
}

export function findMostUrgent(): EmailThread {
  const ranked = [...INBOX].sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 } as const;
    return order[b.urgency] - order[a.urgency];
  });
  return ranked[0];
}
