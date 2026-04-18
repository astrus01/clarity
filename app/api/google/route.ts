import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  GOOGLE_COOKIE,
  GOOGLE_SCOPES,
  fetchProfile,
  getOAuthClient,
} from "@/lib/tools/google";

// GET /api/google?action=login    -> Google consent screen
// GET /api/google?action=logout   -> clears cookie
// GET /api/google?action=status   -> { connected, email?, name?, picture? }

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  if (action === "login") {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return new Response("Google OAuth not configured", { status: 500 });
    }
    const oauth = getOAuthClient();
    const url = oauth.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_SCOPES,
    });
    return Response.redirect(url);
  }

  if (action === "logout") {
    const store = await cookies();
    store.delete(GOOGLE_COOKIE);
    const home = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    return Response.redirect(home);
  }

  if (action === "status") {
    const profile = await fetchProfile();
    return Response.json({
      connected: !!profile,
      email: profile?.email,
      name: profile?.name,
      picture: profile?.picture,
    });
  }

  return new Response("Unknown action", { status: 400 });
}
