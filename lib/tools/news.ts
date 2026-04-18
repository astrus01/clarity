// NewsAPI.ai (Event Registry) — https://newsapi.ai/documentation
// POST /api/v1/article/getArticles with apiKey in the body.

export type NewsArticle = {
  source: string;
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  publishedAt?: string;
  author?: string;
};

export type NewsCategory =
  | "business"
  | "entertainment"
  | "general"
  | "health"
  | "science"
  | "sports"
  | "technology";

// newsapi.ai uses URIs (dmoz-style) for categories. Mapping kept minimal —
// we pass these as optional concept filters. If the concept lookup fails
// newsapi.ai just ignores them, which is fine.
const CATEGORY_CONCEPTS: Record<NewsCategory, string> = {
  business: "news/Business",
  entertainment: "news/Arts_and_Entertainment",
  general: "news",
  health: "news/Health",
  science: "news/Science",
  sports: "news/Sports",
  technology: "news/Technology",
};

type NewsApiAiResponse = {
  articles?: {
    results?: Array<{
      uri?: string;
      title?: string;
      body?: string;
      url?: string;
      image?: string | null;
      dateTimePub?: string;
      dateTime?: string;
      source?: { title?: string; uri?: string };
      authors?: Array<{ name?: string }>;
    }>;
  };
  error?: string;
};

export async function searchNews(opts: {
  query?: string;
  category?: NewsCategory;
  country?: string;
  pageSize?: number;
}): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const count = Math.min(Math.max(opts.pageSize ?? 8, 1), 20);

  const body: Record<string, unknown> = {
    apiKey,
    articlesCount: count,
    articlesSortBy: "date",
    articlesPage: 1,
    resultType: "articles",
    lang: "eng",
    dataType: ["news"],
  };

  if (opts.query) body.keyword = opts.query;
  if (opts.category) {
    body.categoryUri = CATEGORY_CONCEPTS[opts.category];
  }

  try {
    const res = await fetch("https://newsapi.ai/api/v1/article/getArticles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as NewsApiAiResponse;
    const results = data.articles?.results;
    if (!Array.isArray(results)) return [];

    return results
      .filter((a) => typeof a.url === "string" && typeof a.title === "string")
      .map((a) => ({
        source: a.source?.title ?? a.source?.uri ?? hostOf(a.url!),
        title: a.title!,
        description: a.body ? a.body.slice(0, 400) : undefined,
        url: a.url!,
        urlToImage: a.image ?? undefined,
        publishedAt: a.dateTimePub ?? a.dateTime,
        author: a.authors?.[0]?.name,
      }));
  } catch {
    return [];
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
