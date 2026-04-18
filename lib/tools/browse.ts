// Lightweight page fetch + text extraction. Real network call — no mock.
// Strips script/style, collapses whitespace, keeps headings and first N paragraphs.

export type BrowseResult = {
  url: string;
  title?: string;
  description?: string;
  text: string;
};

function stripHtml(html: string): {
  title: string;
  description: string;
  text: string;
} {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : "";

  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i,
  );
  const ogDescMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
  );
  const description = decodeEntities(
    (descMatch?.[1] ?? ogDescMatch?.[1] ?? "").trim(),
  );

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<\/?(p|br|h[1-6]|li|div|section|article)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const text = decodeEntities(body)
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 6000);

  return { title, description, text };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)));
}

export async function browsePage(url: string): Promise<BrowseResult | null> {
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ClarityAgent/0.1; +https://clarity.dev)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("xml")) return null;
    const html = await res.text();
    const { title, description, text } = stripHtml(html);
    return {
      url: res.url,
      title: title || undefined,
      description: description || undefined,
      text,
    };
  } catch {
    return null;
  }
}
