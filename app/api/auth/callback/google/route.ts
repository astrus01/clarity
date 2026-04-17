import { NextResponse } from "next/server";
import { google } from "googleapis";

// OAuth2 configuration (these should be in env vars)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export async function GET(req: NextRequest) {
  try {
    const code = new URL(req.url!).searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/?error=no_code", req.url));
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    // In production: store tokens securely (e.g., encrypted in DB, or in httpOnly cookie)

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL("/?auth=success", req.url));
  } catch (error) {
    console.error("[Google OAuth] Error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
