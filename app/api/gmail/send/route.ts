import { NextRequest } from "next/server";
import { gmailSend } from "@/lib/tools/google";

export const runtime = "nodejs";
export const maxDuration = 15;

type SendRequest = { to?: string; subject?: string; body?: string };

export async function POST(req: NextRequest) {
  const payload = (await req.json().catch(() => ({}))) as SendRequest;
  const to = String(payload.to ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const body = String(payload.body ?? "");

  if (!to || !body) {
    return Response.json(
      { sent: false, error: "Missing 'to' or 'body'" },
      { status: 400 },
    );
  }

  const result = await gmailSend({ to, subject, body });

  if (result.sent) {
    return Response.json({ sent: true, id: result.id });
  }

  if (result.reason === "not-connected") {
    return Response.json(
      { sent: false, notConnected: true },
      { status: 401 },
    );
  }

  if (result.reason === "forbidden") {
    return Response.json(
      {
        sent: false,
        needsReconnect: true,
        error:
          "Google returned 403. The connected account is missing the 'gmail.send' scope. Reconnect Google and approve the send permission.",
      },
      { status: 403 },
    );
  }

  return Response.json({ sent: false, error: result.error }, { status: 500 });
}
