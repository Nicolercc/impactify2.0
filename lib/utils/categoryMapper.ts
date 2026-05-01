import { NEWS_CATEGORY_BY_ID } from "@/lib/constants/categories";

export type NormalizedArticleForCategory = {
  title: string;
  snippet?: string | null;
  source?: string | null;
  url?: string | null;
  /** Optional upstream category fields (e.g. NewsAPI). */
  upstreamCategory?: string | null;
};

export type NewsApiRawArticle = {
  title?: string | null;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  source?: { name?: string | null } | string | null;
  category?: string | null;
};

export type ProPublicaRawArticle = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
};

export type GovTrackRawArticle = {
  title?: string | null;
  summary?: string | null;
  url?: string | null;
};

export type RawArticle = NewsApiRawArticle | ProPublicaRawArticle | GovTrackRawArticle | NormalizedArticleForCategory;

function asLower(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase() : "";
}

function getTextBlob(a: RawArticle): { title: string; snippet: string; url: string; source: string; upstreamCategory: string } {
  const anyA = a as Record<string, unknown>;

  const title = (anyA.title as string | undefined | null) ?? "";
  const snippet =
    (anyA.snippet as string | undefined | null) ??
    (anyA.description as string | undefined | null) ??
    (anyA.summary as string | undefined | null) ??
    (anyA.content as string | undefined | null) ??
    "";
  const url = (anyA.url as string | undefined | null) ?? "";

  const sourceRaw = anyA.source;
  const source =
    typeof sourceRaw === "string"
      ? sourceRaw
      : sourceRaw && typeof sourceRaw === "object"
        ? ((sourceRaw as { name?: string | null }).name ?? "")
        : "";

  const upstreamCategory = (anyA.upstreamCategory as string | undefined | null) ?? (anyA.category as string | undefined | null) ?? "";

  return { title, snippet, url, source, upstreamCategory };
}

type Rule = {
  id: string;
  /** Any match pushes `id` into categories. */
  match: (x: { title: string; snippet: string; url: string; source: string; upstreamCategory: string }) => boolean;
};

const keyword = (re: RegExp) => (x: { title: string; snippet: string }) => re.test(x.title) || re.test(x.snippet);

const RULES: Rule[] = [
  // Reproductive Rights
  {
    id: "reproductive-rights",
    match: keyword(/\b(abortion|planned parenthood|reproductive|ivf|contracept|dobbs)\b/i),
  },
  // Climate Action
  {
    id: "climate-action",
    match: keyword(/\b(climate|emissions?|carbon|renewable|solar|wind|fossil|epa|wildfire|hurricane)\b/i),
  },
  // Voting Rights
  {
    id: "voting-rights",
    match: keyword(/\b(voting rights?|election|ballot|voter id|gerrymander|redistrict|democracy)\b/i),
  },
  // Racial Justice
  {
    id: "racial-justice",
    match: keyword(/\b(racial justice|civil rights|discrimination|equity|hate crime|police brutality)\b/i),
  },
  // Immigration
  {
    id: "immigration",
    match: keyword(/\b(immigration|asylum|border|deport|migrant|refugee)\b/i),
  },
  // Criminal Justice
  {
    id: "criminal-justice",
    match: keyword(/\b(police|prison|incarcerat|sentenc|bail|prosecut|criminal justice)\b/i),
  },
  // Elite Accountability (ProPublica investigations, corruption, ethics)
  {
    id: "elite-accountability",
    match: (x) => {
      const t = `${x.title} ${x.snippet}`.toLowerCase();
      const u = x.url.toLowerCase();
      const s = x.source.toLowerCase();
      if (s.includes("propublica")) return true;
      if (u.includes("propublica.org") && u.includes("/article/")) return true;
      return /\b(corruption|ethics|lobbyist|insider trading|investigation|bribery|fraud|misconduct)\b/i.test(t);
    },
  },
  // Affordable Housing
  {
    id: "affordable-housing",
    match: keyword(/\b(rent|housing|tenant|homeless|eviction|mortgage)\b/i),
  },
  // Healthcare Access
  {
    id: "healthcare-access",
    match: keyword(/\b(healthcare|medicaid|medicare|insurance|hospital|public health)\b/i),
  },
  // Labor Rights
  {
    id: "labor-rights",
    match: keyword(/\b(union|labor|strike|wage|worker|collective bargaining)\b/i),
  },
  // Tech & Privacy
  {
    id: "tech-privacy",
    match: keyword(/\b(privacy|surveillance|data broker|encryption|ai\b|algorithm|platform)\b/i),
  },
  // Local Economy
  {
    id: "local-economy",
    match: keyword(/\b(inflation|jobs|unemployment|small business|local economy|interest rates?)\b/i),
  },
  // Public Education
  {
    id: "public-education",
    match: keyword(/\b(public school|education|teachers?|student loans?|curriculum)\b/i),
  },
];

function mapUpstreamCategory(upstream: string): string[] {
  const u = upstream.trim().toLowerCase();
  if (!u) return [];

  // NewsAPI-like buckets
  if (u === "politics") return ["voting-rights", "elite-accountability"];
  if (u === "science" || u === "environment") return ["climate-action"];
  if (u === "technology") return ["tech-privacy"];
  if (u === "health") return ["healthcare-access", "reproductive-rights"];
  if (u === "business") return ["local-economy", "labor-rights"];

  return [];
}

/**
 * Assign one or more Impactify category IDs to an article.
 * Returns at least `["all"]` for safety.
 */
export function assignCategoryToArticle(article: RawArticle): string[] {
  const blob = getTextBlob(article);
  const title = asLower(blob.title);
  const snippet = asLower(blob.snippet);
  const url = asLower(blob.url);
  const source = asLower(blob.source);
  const upstreamCategory = asLower(blob.upstreamCategory);

  const matches: string[] = [];

  for (const c of mapUpstreamCategory(upstreamCategory)) {
    if (NEWS_CATEGORY_BY_ID[c]) matches.push(c);
  }

  for (const rule of RULES) {
    if (!NEWS_CATEGORY_BY_ID[rule.id]) continue;
    if (rule.match({ title, snippet, url, source, upstreamCategory })) matches.push(rule.id);
  }

  // De-dupe
  const uniq = Array.from(new Set(matches));

  if (uniq.length === 0) {
    // Required fallback: assign 'all' and log for review.
    if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn("[categoryMapper] No category match", {
        title: blob.title?.slice(0, 140),
        url: blob.url,
        source: blob.source,
        upstreamCategory: blob.upstreamCategory,
      });
    }
    return ["all"];
  }

  return uniq;
}

