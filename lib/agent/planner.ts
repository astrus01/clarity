// Claude-powered planner. Decides whether to call tools (search, browse, gmail, calendar)
// and whether to respond with plain text or a JSONL UI spec.
//
// TODO (hackathon): port the LangGraph cyclic state machine from genUIne/lib/agent.ts
// and swap OpenAI -> Anthropic. Keep the tool set minimal: exa.search, stagehand.browse,
// google.listMessages, google.draftReply, google.listEvents.

import Anthropic from "@anthropic-ai/sdk";
import { CLARITY_SYSTEM_PROMPT } from "./system-prompt";

export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export type PlannerStreamEvent =
  | { type: "activity"; tool: string; status: string }
  | { type: "text"; delta: string }
  | { type: "spec"; spec: any }
  | { type: "done" };

export async function* runAgent(
  userMessage: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
): AsyncGenerator<PlannerStreamEvent> {
  // Placeholder streaming — hackathon day replaces this with real planner + tool loop
  yield { type: "activity", tool: "planner", status: "thinking" };
  yield { type: "text", delta: "" };
  yield { type: "done" };
}

export { CLARITY_SYSTEM_PROMPT };
