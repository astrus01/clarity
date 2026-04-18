// Google Workspace (Gmail + Calendar) — real OAuth2 + API calls.
// Access token lives in an httpOnly cookie set by /api/google/callback.
// When no cookie is present, callers fall back to mock fixtures.

import { google } from "googleapis";
import { cookies } from "next/headers";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const GOOGLE_COOKIE = "clarity-google";

export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
};

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export async function readTokenCookie(): Promise<GoogleTokens | null> {
  try {
    const store = await cookies();
    const raw = store.get(GOOGLE_COOKIE)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleTokens;
    if (!parsed.access_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAuthedClient() {
  const tokens = await readTokenCookie();
  if (!tokens) return null;
  const client = getOAuthClient();
  client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });
  return client;
}

// =============================================================================
// Gmail
// =============================================================================

export type RealGmailThread = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  urgency: "low" | "medium" | "high";
  body: string;
};

function headerValue(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  name: string,
): string {
  if (!headers) return "";
  const found = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase(),
  );
  return found?.value ?? "";
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(normalized, "base64").toString("utf8");
  } catch {
    return "";
  }
}

type GmailPart = {
  mimeType?: string | null;
  body?: { data?: string | null; size?: number | null } | null;
  parts?: GmailPart[] | null;
};

function extractBody(payload: GmailPart | undefined | null): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    const html = decodeBase64Url(payload.body.data);
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+\n/g, "\n")
      .trim();
  }
  return "";
}

function formatReceivedAt(rfc2822: string): string {
  if (!rfc2822) return "";
  const d = new Date(rfc2822);
  if (isNaN(d.getTime())) return rfc2822;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return `Yesterday · ${time}`;
  }
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + time
  );
}

function scoreUrgency(
  subject: string,
  body: string,
): "low" | "medium" | "high" {
  const text = `${subject} ${body}`.toLowerCase();
  const highWords = [
    "urgent",
    "asap",
    "today",
    "deadline",
    "eod",
    "action required",
    "needs your",
    "blocked",
    "outage",
    "escalation",
    "payment overdue",
  ];
  const medWords = [
    "review",
    "feedback",
    "reply",
    "confirm",
    "tomorrow",
    "this week",
    "question",
  ];
  if (highWords.some((w) => text.includes(w))) return "high";
  if (medWords.some((w) => text.includes(w))) return "medium";
  return "low";
}

export async function gmailList(max = 10): Promise<RealGmailThread[]> {
  const auth = await getAuthedClient();
  if (!auth) return [];
  const gmail = google.gmail({ version: "v1", auth });
  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: Math.min(Math.max(max, 1), 25),
    q: "-category:promotions -category:social newer_than:30d",
  });
  const ids = (list.data.messages ?? []).map((m) => m.id).filter(Boolean) as string[];
  if (ids.length === 0) return [];
  const threads = await Promise.all(
    ids.map((id) =>
      gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      }),
    ),
  );
  return threads.map((res) => {
    const m = res.data;
    const headers = m.payload?.headers ?? undefined;
    const subject = headerValue(headers, "Subject") || "(no subject)";
    const snippet = m.snippet ?? "";
    return {
      id: m.id ?? "",
      from: headerValue(headers, "From") || "Unknown",
      subject,
      snippet,
      receivedAt: formatReceivedAt(headerValue(headers, "Date")),
      urgency: scoreUrgency(subject, snippet),
      body: "",
    } satisfies RealGmailThread;
  });
}

export async function gmailRead(id: string): Promise<RealGmailThread | null> {
  const auth = await getAuthedClient();
  if (!auth) return null;
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });
  const m = res.data;
  const headers = m.payload?.headers ?? undefined;
  const subject = headerValue(headers, "Subject") || "(no subject)";
  const body = extractBody(m.payload as GmailPart | undefined) || (m.snippet ?? "");
  return {
    id: m.id ?? "",
    from: headerValue(headers, "From") || "Unknown",
    subject,
    snippet: m.snippet ?? "",
    receivedAt: formatReceivedAt(headerValue(headers, "Date")),
    urgency: scoreUrgency(subject, body),
    body,
  };
}

export async function gmailMostUrgent(): Promise<RealGmailThread | null> {
  const threads = await gmailList(15);
  if (threads.length === 0) return null;
  const ranked = [...threads].sort((a, b) => {
    const order = { high: 3, medium: 2, low: 1 } as const;
    return order[b.urgency] - order[a.urgency];
  });
  const top = ranked[0];
  // Upgrade to full body for the winner.
  const full = await gmailRead(top.id);
  return full ?? top;
}

function encodeHeader(value: string): string {
  // Only apply RFC 2047 encoding if the value contains non-ASCII characters.
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  const b64 = Buffer.from(value, "utf8").toString("base64");
  return `=?UTF-8?B?${b64}?=`;
}

export type GmailSendResult =
  | { sent: true; id?: string }
  | { sent: false; reason: "not-connected" | "forbidden" | "error"; error?: string };

export async function gmailSend(opts: {
  to: string;
  subject: string;
  body: string;
}): Promise<GmailSendResult> {
  const auth = await getAuthedClient();
  if (!auth) return { sent: false, reason: "not-connected" };

  const headers = [
    `To: ${opts.to}`,
    `Subject: ${encodeHeader(opts.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
  ].join("\r\n");

  const message = `${headers}\r\n\r\n${opts.body}`;
  const raw = Buffer.from(message, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const gmail = google.gmail({ version: "v1", auth });
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    return { sent: true, id: res.data.id ?? undefined };
  } catch (err) {
    const e = err as { code?: number; status?: number; message?: string };
    const code = e.code ?? e.status ?? 0;
    if (code === 401 || code === 403) {
      return {
        sent: false,
        reason: "forbidden",
        error: e.message ?? `HTTP ${code}`,
      };
    }
    return {
      sent: false,
      reason: "error",
      error: e.message ?? String(err),
    };
  }
}

// =============================================================================
// Calendar
// =============================================================================

export type RealCalendarEvent = {
  title: string;
  start: string;
  end: string;
};

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export async function calendarListToday(): Promise<RealCalendarEvent[]> {
  const range = await calendarListRange({ daysAhead: 0 });
  return range[0]?.events ?? [];
}

export type CalendarDay = {
  label: string; // "Today · Apr 18" / "Fri · Apr 19"
  isoDate: string; // "2026-04-18"
  events: RealCalendarEvent[];
};

/**
 * List events from `daysBack` days ago through `daysAhead` days forward,
 * grouped by day. Day groups are included even if empty.
 */
export async function calendarListRange(opts: {
  daysBack?: number;
  daysAhead?: number;
}): Promise<CalendarDay[]> {
  const daysBack = Math.max(0, opts.daysBack ?? 0);
  const daysAhead = Math.max(0, Math.min(opts.daysAhead ?? 0, 30));
  const auth = await getAuthedClient();
  if (!auth) return [];

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - daysBack);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(now.getDate() + daysAhead);
  end.setHours(23, 59, 59, 999);

  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  const items = (res.data.items ?? []).filter(
    (e) => e.start?.dateTime || e.start?.date,
  );

  // Group by local YYYY-MM-DD
  const byDay = new Map<string, RealCalendarEvent[]>();
  for (const e of items) {
    const iso = e.start?.dateTime ?? e.start?.date ?? "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const ev: RealCalendarEvent = {
      title: e.summary ?? "(untitled)",
      start: e.start?.dateTime ? formatTime(e.start.dateTime) : "all day",
      end: e.end?.dateTime ? formatTime(e.end.dateTime) : "",
    };
    const bucket = byDay.get(key) ?? [];
    bucket.push(ev);
    byDay.set(key, bucket);
  }

  const days: CalendarDay[] = [];
  for (let i = -daysBack; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    days.push({
      label: labelForDate(d, i === 0),
      isoDate: key,
      events: byDay.get(key) ?? [],
    });
  }
  return days;
}

function labelForDate(d: Date, isToday: boolean): string {
  const weekday = d.toLocaleDateString([], { weekday: "short" });
  const month = d.toLocaleDateString([], { month: "short" });
  const day = d.getDate();
  if (isToday) return `Today · ${month} ${day}`;
  return `${weekday} · ${month} ${day}`;
}

// =============================================================================
// Profile — used by /api/google?action=status
// =============================================================================

export type GoogleProfile = { email: string; name?: string; picture?: string };

export async function fetchProfile(): Promise<GoogleProfile | null> {
  const auth = await getAuthedClient();
  if (!auth) return null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth });
    const res = await oauth2.userinfo.get();
    const d = res.data;
    if (!d.email) return null;
    return {
      email: d.email,
      name: d.name ?? undefined,
      picture: d.picture ?? undefined,
    };
  } catch {
    return null;
  }
}
