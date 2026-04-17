import * as dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

// This script helps generate a Google OAuth token for testing
// Run: npx tsx scripts/setup-google.ts

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error("Missing environment variables");
    console.error("Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  // Generate the URL for user consent
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  console.log("Authorize this app by visiting this URL:");
  console.log(authUrl);
  console.log("\nAfter granting permission, you'll be redirected to your redirect URI.");
  console.log("Copy the 'code' parameter from the URL and exchange it manually or via /api/auth/callback/google.");
}

main().catch(console.error);
