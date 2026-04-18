import { NextRequest } from "next/server";
import { getOAuthClient } from "@/lib/tools/google";

// GET /api/google?action=login      -> redirect to Google consent screen
// GET /api/google/callback?code=... -> exchange code, set session cookie
// POST /api/google { action: "listMessages" | "listEvents" | ... } -> proxy

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  if (action === "login") {
    const oauth = getOAuthClient();
    const url = oauth.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar",
      ],
    });
    return Response.redirect(url);
  }
  return new Response("Not implemented", { status: 501 });
}

export async function POST(_req: NextRequest) {
  // TODO (hackathon): dispatch listMessages / draftReply / listEvents
  return new Response("Not implemented", { status: 501 });
}
