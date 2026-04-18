// Exa.ai semantic search tool
// TODO (hackathon): wire up `exa-search` package with EXA_API_KEY; return URLs + snippets
// for the agent to pass to Stagehand or synthesize directly.

export type ExaResult = {
  url: string;
  title?: string;
  text?: string;
  publishedDate?: string;
};

export async function searchExa(query: string): Promise<ExaResult[]> {
  if (!process.env.EXA_API_KEY) {
    throw new Error("Missing EXA_API_KEY");
  }
  // Placeholder — replace with real Exa SDK call
  return [];
}
