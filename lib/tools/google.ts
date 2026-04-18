// Google Workspace (Gmail + Calendar) tools via googleapis
// TODO (hackathon):
// - OAuth flow in /api/google/route.ts (GET = start, callback = exchange code)
// - Store tokens in httpOnly cookie (short-lived) or session store
// - listMessages / draftReply / sendDraft against Gmail v1
// - listEvents / createEvent against Calendar v3

import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export type GmailMessage = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date?: string;
};

export async function listMessages(
  _accessToken: string,
  _opts: { max?: number; q?: string } = {},
): Promise<GmailMessage[]> {
  throw new Error("listMessages not implemented — wire up during hackathon");
}

export async function draftReply(
  _accessToken: string,
  _opts: { threadId: string; body: string; to: string; subject: string },
): Promise<{ draftId: string }> {
  throw new Error("draftReply not implemented");
}

export async function sendDraft(
  _accessToken: string,
  _draftId: string,
): Promise<{ sent: boolean }> {
  throw new Error("sendDraft not implemented");
}

export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
};

export async function listEvents(
  _accessToken: string,
  _opts: { timeMin?: string; timeMax?: string } = {},
): Promise<CalendarEvent[]> {
  throw new Error("listEvents not implemented");
}
