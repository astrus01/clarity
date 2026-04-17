import { NextRequest, NextResponse } from "next/server";
import { handleAgentRequest } from "@/lib/agent/agent";

// Allow 5 minutes for agent execution
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId = "demo-session" } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Handle the agent request
    const response = await handleAgentRequest(messages, sessionId);
    return response;
  } catch (error) {
    console.error("[Agent API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process agent request" },
      { status: 500 }
    );
  }
}
