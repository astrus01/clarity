import { NextRequest } from "next/server";

// Generates a short chat title from the first user message
export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(() => ({ message: "" }));
  const title = String(message ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");
  return Response.json({ title: title || "New chat" });
}
