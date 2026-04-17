import { convertToModelMessages } from "ai";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { pipeJsonRender } from "@json-render/core";

// TODO: Replace with actual LangGraph agent implementation
export function createAgent(sessionId: string) {
  // Skeleton: Returns an agent-like object with .stream() method
  return {
    async stream({ messages }: { messages: any[] }) {
      // Placeholder: should invoke LangGraph and stream UI messages
      throw new Error("LangGraph agent.stream() not implemented yet");
    },
  };
}

// Helper to handle agent requests (used in API routes)
export async function handleAgentRequest(
  uiMessages: any[],
  sessionId: string
) {
  const agent = createAgent(sessionId);
  let modelMessages = await convertToModelMessages(uiMessages);

  // TODO: Inject system context, swarm status, etc.

  const result = await agent.stream({ messages: modelMessages });

  const stream = createUIMessageStream({
    originalMessages: uiMessages,
    execute: async ({ writer }) => {
      writer.merge(pipeJsonRender(result.toUIMessageStream()));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
