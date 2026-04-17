import { Exa } from "exa-js";

let exaClient: Exa | null = null;

function getExaClient() {
  if (!exaClient) {
    exaClient = new Exa({
      apiKey: process.env.EXA_API_KEY,
    });
  }
  return exaClient;
}

export async function exaSearch(
  query: string,
  options?: {
    type?: "neural" | "keyword" | "auto";
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {}
) {
  const client = getExaClient();
  if (!client) {
    console.warn("[Exa] API key not set");
    return { results: [] };
  }

  try {
    const results = await client.search(query, {
      type: options.type || "neural",
      numResults: options.numResults || 10,
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
    });

    return {
      results: results.results.map((r) => ({
        url: r.url,
        title: r.title,
        text: r.text,
        publishedDate: r.publishedDate,
      })),
    };
  } catch (error) {
    console.error("[Exa] Search error:", error);
    return { results: [] };
  }
}

export async function exaGetContents(urls: string[]) {
  const client = getExaClient();
  if (!client) {
    console.warn("[Exa] API key not set");
    return { contents: [] };
  }

  try {
    const results = await client.getContents(urls);
    return {
      contents: results.results.map((r) => ({
        url: r.url,
        text: r.text,
      })),
    };
  } catch (error) {
    console.error("[Exa] Get contents error:", error);
    return { contents: [] };
  }
}

export async function exaSearchAndContents(
  query: string,
  options?: { numResults?: number; type?: "neural" | "keyword" | "auto" }
) {
  const searchRes = await exaSearch(query, options);
  const urls = searchRes.results.map((r) => r.url);
  const contentsRes = await exaGetContents(urls);
  return {
    results: searchRes.results.map((r, i) => ({
      ...r,
      text: contentsRes.contents[i]?.text || r.text,
    })),
  };
}
