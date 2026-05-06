import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchGuardianArticles } from "@/lib/news/guardian-client";
import { CAUSE_TO_GUARDIAN, DEFAULT_GUARDIAN_SECTION } from "@/lib/news/cause-to-guardian";
import { assignCategoryToArticle } from "@/lib/utils/categoryMapper";

const GUARDIAN_OPEN_BASE = "https://content.guardianapis.com";
const GUARDIAN_TEST_API_KEY = "test";
const DEFAULT_GUARDIAN_NEWS_QUERY =
  "politics OR housing OR climate OR immigration OR democracy";
const GUARDIAN_SHOW_FIELDS = "thumbnail,trailText,bodyText,byline";

const guardianFetchInit = { next: { revalidate: 3600 } } as const;

/** Raw Guardian Open Platform article (search or item endpoint). */
export type GuardianArticle = {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  sectionName: string;
  fields: {
    thumbnail: string;
    trailText: string;
    bodyText: string;
    byline: string;
  };
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function normalizeGuardianArticle(raw: unknown): GuardianArticle | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = asString(o.id);
  const webTitle = asString(o.webTitle);
  const webUrl = asString(o.webUrl);
  const webPublicationDate = asString(o.webPublicationDate);
  if (!id || !webTitle) return null;

  const fr = o.fields;
  const f =
    fr && typeof fr === "object"
      ? (fr as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  return {
    id,
    webTitle,
    webUrl,
    webPublicationDate,
    sectionName: asString(o.sectionName),
    fields: {
      thumbnail: asString(f.thumbnail),
      trailText: asString(f.trailText),
      bodyText: asString(f.bodyText),
      byline: asString(f.byline),
    },
  };
}

/**
 * Top 20 Guardian articles for a free-text query, newest first (Open Platform, test key).
 */
export async function fetchNewsArticles(query?: string): Promise<GuardianArticle[]> {
  try {
    const q = (query?.trim() || DEFAULT_GUARDIAN_NEWS_QUERY).trim();
    const url = new URL(`${GUARDIAN_OPEN_BASE}/search`);
    url.searchParams.set("q", q);
    url.searchParams.set("show-fields", GUARDIAN_SHOW_FIELDS);
    url.searchParams.set("api-key", GUARDIAN_TEST_API_KEY);
    url.searchParams.set("page-size", "20");
    url.searchParams.set("order-by", "newest");

    const res = await fetch(url.toString(), guardianFetchInit);
    if (!res.ok) return [];

    const json = (await res.json()) as {
      response?: { results?: unknown[] };
    };
    const results = json.response?.results ?? [];
    const out: GuardianArticle[] = [];
    for (const row of results) {
      const a = normalizeGuardianArticle(row);
      if (a) out.push(a);
    }
    return out;
  } catch {
    return [];
  }
}

function decodeGuardianId(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

/**
 * Single article by Guardian API id (e.g. politics/2024/jan/15/...).
 * Returns null on any error; does not throw.
 */
export async function fetchArticleById(id: string): Promise<GuardianArticle | null> {
  try {
    const path = decodeGuardianId(id).replace(/^\/+/, "");
    if (!path) return null;

    const url = new URL(`${GUARDIAN_OPEN_BASE}/${path}`);
    url.searchParams.set("show-fields", GUARDIAN_SHOW_FIELDS);
    url.searchParams.set("api-key", GUARDIAN_TEST_API_KEY);

    const res = await fetch(url.toString(), guardianFetchInit);
    if (!res.ok) return null;

    const json = (await res.json()) as {
      response?: { content?: unknown };
    };
    return normalizeGuardianArticle(json.response?.content ?? null);
  } catch {
    return null;
  }
}

export type ArticleCauseRow = {
  causes:
    | { id: string; slug: string; title: string }
    | { id: string; slug: string; title: string }[]
    | null;
};

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  published_at: string;
  source_name: string | null;
  author_name: string | null;
  section_name: string | null;
  source_url: string | null;
  cover_image_url: string | null;
  is_editorial: boolean;
  article_causes: ArticleCauseRow[] | null;
  /** Impactify category ids (kebab-case). */
  categories?: string[];
};

const listSelect = `
  id,
  slug,
  title,
  dek,
  published_at,
  source_name,
  cover_image_url,
  is_editorial,
  article_causes (
    causes ( id, slug, title )
  )
`;

export type NewsIssueId =
  | "all"
  | "climate-action"
  | "affordable-housing"
  | "voting-rights"
  | "labor-rights"
  | "immigration";

function issueToQuery(issue?: NewsIssueId): string | undefined {
  if (!issue || issue === "all") return undefined;
  if (issue === "climate-action") return "climate OR emissions OR renewable OR energy";
  if (issue === "affordable-housing") return "housing OR rent OR tenant OR eviction";
  if (issue === "voting-rights") return "voting OR election OR gerrymander OR redistrict";
  if (issue === "labor-rights") return "labor OR union OR wage OR worker";
  if (issue === "immigration") return "immigration OR asylum OR migrant OR refugee";
  return undefined;
}

export async function fetchArticleListItems(filters?: {
  causeSlug?: string;
  q?: string;
  issue?: NewsIssueId;
  page?: number;
  pageSize?: number;
}): Promise<ArticleListItem[]> {
  // Data source: The Guardian API — https://open-platform.theguardian.com
  // TODO: store articles in Supabase for offline/caching when traffic warrants

  const causeSlug = filters?.causeSlug?.trim() || undefined;
  const q = filters?.q?.trim() || undefined;
  const issue = filters?.issue;
  const page = Math.max(1, Math.floor(filters?.page ?? 1));
  const pageSize = Math.min(50, Math.max(10, Math.floor(filters?.pageSize ?? 30)));

  const mapped = (causeSlug && CAUSE_TO_GUARDIAN[causeSlug]) || {};
  const section = mapped.section ?? DEFAULT_GUARDIAN_SECTION;

  const issueQ = issueToQuery(issue);
  const combinedQ =
    [mapped.q, issueQ, q].filter(Boolean).join(" ").trim() || undefined;

  const results = await fetchGuardianArticles({
    section,
    tag: mapped.tag,
    q: combinedQ,
    pageSize,
    page,
  });

  const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

  return results.map((a) => {
    const dek = a.fields?.trailText ? stripHtml(a.fields.trailText) : null;
    const sourceUrl = a.webUrl ?? null;
    const categories = assignCategoryToArticle({
      title: a.webTitle,
      snippet: dek,
      source: "The Guardian",
      url: sourceUrl,
      upstreamCategory: a.sectionName ?? "",
    });

    return {
      id: a.id,
      // Full Guardian path, URL-encoded so it round-trips through /news/[slug]
      slug: encodeURIComponent(a.id),
      title: a.webTitle,
      dek,
      published_at: a.webPublicationDate,
      source_name: "The Guardian",
      author_name: a.fields?.byline ? stripHtml(a.fields.byline) : null,
      section_name: a.sectionName ?? null,
      source_url: sourceUrl,
      cover_image_url: a.fields?.thumbnail ?? null,
      is_editorial: false,
      article_causes: null,
      categories,
    } satisfies ArticleListItem;
  });
}

export type AiBriefingRow = {
  id: string;
  article_id: string;
  background: string | null;
  key_players: unknown;
  timeline: unknown;
  whats_at_stake: string | null;
  generated_at: string;
  model: string | null;
  deleted_at: string | null;
};

export type ArticleDetailRow = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  body_md: string;
  source_name: string | null;
  source_url: string | null;
  author_name: string | null;
  cover_image_url: string | null;
  published_at: string;
  is_editorial: boolean;
  deleted_at: string | null;
  article_causes: ArticleCauseRow[] | null;
};

export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetailRow | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      article_causes (
        causes ( id, slug, title )
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[news] detail error", error.message);
    return null;
  }

  return data as unknown as ArticleDetailRow | null;
});

export const fetchAiBriefingRowForArticle = cache(
  async (articleId: string): Promise<AiBriefingRow | null> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("ai_briefings")
        .select("*")
        .eq("article_id", articleId)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) {
        // Treat DB lookup as best-effort; avoid hard failures during deploys or
        // when Supabase is unreachable.
        if (process.env.NODE_ENV !== "production") {
          console.error("[news] briefing row error", error.message);
        }
        return null;
      }

      return (data ?? null) as AiBriefingRow | null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (process.env.NODE_ENV !== "production") {
        console.error("[news] briefing row exception", msg);
      }
      return null;
    }
  },
);

export async function resolveArticleForPage(slug: string): Promise<ArticleDetailRow> {
  const article = await getArticleBySlug(slug);
  if (!article || article.deleted_at) {
    notFound();
  }
  return article;
}

export type ArticleMeta = {
  title: string;
  dek: string | null;
  cover_image_url: string | null;
};

export const getArticleMetaBySlug = cache(async (slug: string): Promise<ArticleMeta | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("title, dek, cover_image_url, deleted_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data || data.deleted_at) return null;

  return {
    title: data.title as string,
    dek: (data.dek as string | null) ?? null,
    cover_image_url: (data.cover_image_url as string | null) ?? null,
  };
});

const LANDING_CAUSES = [
  {
    slug: "affordable-housing",
    label: "Housing",
    guardianSection: "society",
    guardianQuery: "housing affordable rent",
  },
  {
    slug: "climate-action",
    label: "Climate",
    guardianSection: "environment",
    guardianQuery: "climate energy",
  },
  {
    slug: "protect-democracy",
    label: "Democracy",
    guardianSection: "us-news",
    guardianQuery: "voting election democracy",
  },
  {
    slug: "civil-rights",
    label: "Civil Rights",
    guardianSection: "law",
    guardianQuery: "civil rights justice",
  },
] as const;

export interface LandingArticle {
  id: string;
  slug: string; // encodeURIComponent(guardianId)
  headline: string;
  source: string; // "The Guardian"
  causeLabel: string;
  causeSlug: string;
  summary: string;
  imageUrl: string | null;
  webUrl: string;
  publishedAt: string;
}

const SEED_LANDING_ARTICLES: LandingArticle[] = [
  {
    id: "seed-housing-001",
    slug: "seed-housing-001",
    headline:
      "NYC rent stabilization bill heads to final vote as tenant groups rally across five boroughs",
    source: "The Guardian",
    causeLabel: "Housing",
    causeSlug: "affordable-housing",
    summary:
      "A landmark bill capping annual rent increases at 2% would affect over one million apartments citywide.",
    imageUrl:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "seed-climate-001",
    slug: "seed-climate-001",
    headline:
      "Atlantic offshore wind project approved despite fierce local opposition in coastal communities",
    source: "The Guardian",
    causeLabel: "Climate",
    causeSlug: "climate-action",
    summary:
      "Federal regulators greenlit the 2.4 GW installation, the largest renewable energy project on the East Coast.",
    imageUrl:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "seed-democracy-001",
    slug: "seed-democracy-001",
    headline:
      "Voter registration deadline extended in three key swing states after court ruling",
    source: "The Guardian",
    causeLabel: "Democracy",
    causeSlug: "protect-democracy",
    summary:
      "A federal appeals court ordered extended registration windows, potentially adding 340,000 eligible voters.",
    imageUrl:
      "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "seed-rights-001",
    slug: "seed-rights-001",
    headline:
      "Supreme Court to hear challenge to state voter ID requirements in landmark case",
    source: "The Guardian",
    causeLabel: "Civil Rights",
    causeSlug: "civil-rights",
    summary:
      "The case could reshape voting access laws across 14 states ahead of the next election cycle.",
    imageUrl:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "seed-housing-002",
    slug: "seed-housing-002",
    headline:
      "Community land trusts expand rapidly as cities seek alternatives to traditional affordable housing",
    source: "The Guardian",
    causeLabel: "Housing",
    causeSlug: "affordable-housing",
    summary:
      "Over 300 CLTs now operate nationwide, removing properties from the speculative market permanently.",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "seed-climate-002",
    slug: "seed-climate-002",
    headline:
      "Record-breaking heat drives cities to rethink urban planning with green infrastructure",
    source: "The Guardian",
    causeLabel: "Climate",
    causeSlug: "climate-action",
    summary:
      "Tree canopy programs and reflective surfaces are becoming standard in municipal climate adaptation plans.",
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    webUrl: "#",
    publishedAt: new Date().toISOString(),
  },
];

export async function fetchLandingArticles(): Promise<LandingArticle[]> {
  try {
    const { fetchGuardianArticles } = await import("@/lib/news/guardian-client");

    const results = await Promise.allSettled(
      LANDING_CAUSES.map(async (cause) => {
        const articles = await fetchGuardianArticles({
          section: cause.guardianSection,
          q: cause.guardianQuery,
          pageSize: 2,
        });

        return articles.map((a) => ({
          id: a.id,
          slug: encodeURIComponent(a.id),
          headline: a.webTitle,
          source: "The Guardian",
          causeLabel: cause.label,
          causeSlug: cause.slug,
          summary: a.fields?.trailText ? a.fields.trailText.replace(/<[^>]*>/g, "") : "",
          imageUrl: a.fields?.thumbnail ?? null,
          webUrl: a.webUrl,
          publishedAt: a.webPublicationDate,
        })) satisfies LandingArticle[];
      }),
    );

    const buckets: LandingArticle[][] = results.map((r) =>
      r.status === "fulfilled" ? r.value : [],
    );

    const interleaved: LandingArticle[] = [];
    const maxLen = Math.max(...buckets.map((b) => b.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) interleaved.push(bucket[i]);
      }
    }

    if (interleaved.length === 0) return SEED_LANDING_ARTICLES;
    return interleaved;
  } catch (err) {
    console.error("[landing] article fetch failed", err);
    return SEED_LANDING_ARTICLES;
  }
}
