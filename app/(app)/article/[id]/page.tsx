import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchAiBriefingRowForArticle,
  fetchArticleById,
} from "@/lib/news/queries";
import { briefingFromRow } from "@/lib/news/briefing";
import { fetchPublishedUpcomingEvents } from "@/lib/events/queries";
import { filterEventsForArticleRail } from "@/lib/article/filter-events-by-state";
import { buildArticleChaptersFromBody } from "@/lib/article/build-chapters";
import { parseArticleReadMode } from "@/lib/article/parse-read-mode";
import { DEMO_GUARDIAN_ARTICLE } from "@/lib/article/demo-guardian-article";
import { ARTICLE_DEFAULT_GOVERNTRACK_BILL_ID } from "@/lib/article/article-read-constants";
import { ArticleReadingLayout } from "@/components/article/article-reading-layout";
import { getSession } from "@/lib/supabase/get-session";
import { actionCategories } from "@/lib/constants/categories";

export const revalidate = 3600;

function spOne(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let raw = id;
  try {
    raw = decodeURIComponent(id);
  } catch {
    raw = id;
  }

  const article =
    raw.trim().toLowerCase() === "demo"
      ? DEMO_GUARDIAN_ARTICLE
      : await fetchArticleById(raw);

  if (!article) {
    return { title: "Article", robots: { index: false, follow: false } };
  }

  const description = article.fields?.trailText
    ? article.fields.trailText.replace(/<[^>]+>/g, "").slice(0, 155)
    : undefined;

  return {
    title: article.webTitle,
    description,
    openGraph: {
      title: article.webTitle,
      description,
      type: "article",
    },
  };
}

export default async function ArticleReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  let rawId = id;
  try {
    rawId = decodeURIComponent(id);
  } catch {
    rawId = id;
  }

  const isDemo = rawId.trim().toLowerCase() === "demo";

  const [article, allEvents, user] = await Promise.all([
    isDemo ? Promise.resolve(DEMO_GUARDIAN_ARTICLE) : fetchArticleById(rawId),
    fetchPublishedUpcomingEvents(),
    getSession(),
  ]);

  if (!article) notFound();

  const row = await fetchAiBriefingRowForArticle(article.id);
  const existingBriefing = briefingFromRow(row);

  const chapters = buildArticleChaptersFromBody(article);

  const state = spOne(sp, "state")?.trim().toUpperCase() ?? null;
  const district = spOne(sp, "district")?.trim() ?? null;
  const events = filterEventsForArticleRail(allEvents, state, 6);

  const causes = actionCategories.slice(0, 5).map((c) => ({
    title: c.title,
    slug: c.id,
  }));

  const mode = parseArticleReadMode(spOne(sp, "mode"));

  const billRaw = spOne(sp, "billId");
  const govtrackBillId =
    billRaw && Number.isFinite(Number(billRaw)) && Number(billRaw) > 0
      ? Number(billRaw)
      : ARTICLE_DEFAULT_GOVERNTRACK_BILL_ID;

  const issue =
    (article.sectionName || "civic")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "civic";

  return (
    <ArticleReadingLayout
      article={article}
      chapters={chapters}
      existingBriefing={existingBriefing}
      events={events}
      causes={causes}
      initialMode={mode}
      locationState={state}
      locationDistrict={district}
      govtrackBillId={govtrackBillId}
      issue={issue}
      isAuthenticated={Boolean(user)}
    />
  );
}
