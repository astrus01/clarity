import { NextRequest } from "next/server";

// TODO (hackathon): replace with streaming Claude planner+tools loop (see lib/agent/planner.ts).
// For now returns a mock spec so the frontend renders something in dev mode.

export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(() => ({ message: "" }));

  const mockSpec = {
    $schema: "https://json-render.org/spec/v1",
    root: "placeholder-card",
    elements: {
      "placeholder-card": {
        type: "Card",
        props: { title: "Clarity — Demo Response" },
        children: ["placeholder-text", "placeholder-badge"],
      },
      "placeholder-text": {
        type: "Text",
        props: {
          content: `You asked: "${message}". The real agent will stream tool calls + a JSONL spec here during the hackathon.`,
        },
      },
      "placeholder-badge": {
        type: "Badge",
        props: { variant: "secondary", text: "Skeleton mode" },
      },
    },
  };

  return Response.json({ spec: mockSpec });
}
