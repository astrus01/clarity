export type ExaResult = {
  url: string;
  title?: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  image?: string;
  favicon?: string;
};

type ExaApiResult = {
  url?: string;
  title?: string;
  text?: string;
  publishedDate?: string;
  author?: string;
  image?: string;
  favicon?: string;
};

export async function searchExa(
  query: string,
  opts?: { numResults?: number; useAutoprompt?: boolean; type?: "neural" | "keyword" },
): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: opts?.numResults ?? 6,
        useAutoprompt: opts?.useAutoprompt ?? true,
        type: opts?.type ?? "neural",
        contents: {
          text: { maxCharacters: 1500 },
          livecrawl: "fallback",
        },
      }),
    });

    if (!res.ok) return [];
    const data = (await res.json()) as { results?: ExaApiResult[] };
    return (data.results ?? [])
      .filter((r): r is ExaApiResult & { url: string } => typeof r.url === "string")
      .map((r) => ({
        url: r.url,
        title: r.title,
        text: r.text,
        publishedDate: r.publishedDate,
        author: r.author,
        image: r.image,
        favicon: r.favicon,
      }));
  } catch {
    return [];
  }
}

export function hostFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
