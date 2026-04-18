import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { GOOGLE_COOKIE, getOAuthClient } from "@/lib/tools/google";

// Path matches the GOOGLE_REDIRECT_URI in .env.local:
//   http://localhost:3000/api/auth/callback/google

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const home = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (error) {
    return Response.redirect(`${home}?google_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  try {
    const oauth = getOAuthClient();
    const { tokens } = await oauth.getToken(code);
    if (!tokens.access_token) {
      return new Response("No access token returned", { status: 500 });
    }

    const payload = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? undefined,
    });

    const store = await cookies();
    store.set(GOOGLE_COOKIE, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return Response.redirect(`${home}?google_connected=1`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return new Response(`OAuth exchange failed: ${msg}`, { status: 500 });
  }
}
