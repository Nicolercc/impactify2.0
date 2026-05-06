import type { GuardianArticle } from "@/lib/news/queries";

export type ArticleChapter = {
  slug: string;
  title: string;
  paragraphs: string[];
  pullQuote: string | null;
  image: { src: string; alt: string } | null;
};

function slugify(s: string, idx: number) {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || `chapter-${idx + 1}`;
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function pickPullQuote(paragraphs: string[]): string | null {
  for (const p of paragraphs) {
    const t = p.replace(/\s+/g, " ").trim();
    if (t.length >= 90 && t.length <= 320) return t;
  }
  const joined = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  if (joined.length < 40) return null;
  return joined.slice(0, 200) + (joined.length > 200 ? "…" : "");
}

/**
 * Group flat paragraphs into reading chapters (static structure for layout / progress).
 */
export function buildArticleChaptersFromBody(
  article: Pick<GuardianArticle, "webTitle" | "fields">,
  opts?: { paragraphsPerChapter?: number },
): ArticleChapter[] {
  const body = article.fields?.bodyText?.trim() ?? "";
  if (!body) {
    return [
      {
        slug: "overview",
        title: "Overview",
        paragraphs: [article.fields?.trailText?.replace(/<[^>]+>/g, "").trim() || article.webTitle],
        pullQuote: null,
        image: null,
      },
    ];
  }

  const paras = splitParagraphs(body);
  const chunk = Math.max(2, Math.min(5, opts?.paragraphsPerChapter ?? 3));
  const out: ArticleChapter[] = [];

  for (let i = 0; i < paras.length; i += chunk) {
    const slice = paras.slice(i, i + chunk);
    const idx = out.length;
    const title = `Part ${idx + 1}`;
    out.push({
      slug: slugify(`${title}-${slice[0]?.slice(0, 24) ?? ""}`, idx),
      title,
      paragraphs: slice,
      pullQuote: pickPullQuote(slice),
      // Hero is rendered in ArticleHeader; body images are optional extras only.
      image:
        idx === 2
          ? {
              src: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80",
              alt: "Community discussion",
            }
          : null,
    });
  }

  return out;
}

export function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}
