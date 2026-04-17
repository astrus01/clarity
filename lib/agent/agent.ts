import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Handles agent requests: location detection, Anthropic Haiku for others
export async function handleAgentRequest(
  uiMessages: any[],
  sessionId: string
) {
  // Extract the last user message content
  const lastUserMsg = [...uiMessages].reverse().find((m) => m.role === "user");
  let query = "";
  if (lastUserMsg) {
    if (typeof lastUserMsg.content === "string") {
      query = lastUserMsg.content;
    } else if (Array.isArray(lastUserMsg.parts)) {
      const textPart = lastUserMsg.parts.find((p: any) => p.type === "text");
      if (textPart && textPart.text) query = textPart.text;
    }
  }

  // Simple location detection: if query contains location keywords
  const locationKeywords = [
    "map",
    "where",
    "locate",
    "show me",
    "find",
    "coordinates",
  ];
  const lowerQuery = query.toLowerCase();
  const isLocation = locationKeywords.some((kw) => lowerQuery.includes(kw));

  if (isLocation) {
    // Extract location name by removing common prefixes
    let location = query;
    location = location.replace(/^(show me|map of|where is|locate|find)\s+/i, "");
    location = location.replace(/[.!?;:,]+$/, "").trim();

    // Return location map UI spec immediately
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: uiMessages,
        execute: async ({ writer }) => {
          writer.write({
            type: "data-spec",
            data: { type: "location-map", location },
          });
        },
      }),
    });
  }

  // Non-location queries: use Anthropic Claude Haiku (lowest cost) for direct text answers
  try {
    const result = await anthropic.generateText({
      model: "claude-3-5-haiku-20241022",
      prompt: query,
      system:
        "You are Clarity, an AI assistant. Provide concise, helpful answers.",
    });

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: uiMessages,
        execute: async ({ writer }) => {
          const id = `text-${Date.now()}`;
          writer.write({ type: "text-start", id });
          writer.write({ type: "text-delta", id, delta: result.text });
          writer.write({ type: "text-end", id });
        },
      }),
    });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        originalMessages: uiMessages,
        execute: async ({ writer }) => {
          const id = `text-${Date.now()}`;
          writer.write({ type: "text-start", id });
          writer.write({
            type: "text-delta",
            id,
            delta: "Sorry, I encountered an error. Please try again.",
          });
          writer.write({ type: "text-end", id });
        },
      }),
    });
  }
}
