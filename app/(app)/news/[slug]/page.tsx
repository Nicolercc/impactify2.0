import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, User, Sparkles } from "lucide-react";
import { fetchGuardianArticleByPath, fetchGuardianArticles } from "@/lib/news/guardian-client";
import { fetchAiBriefingRowForArticle } from "@/lib/news/queries";
import { briefingFromRow } from "@/lib/news/briefing";
import { BriefingPanel } from "@/components/news/briefing-panel";
import { BriefingProvider } from "@/components/news/briefing-store";
import { RelatedEventsSection } from "@/components/news/related-events";
import { BriefingSkeleton } from "@/components/news/briefing-skeleton";
import { RelatedSkeleton } from "@/components/news/related-skeleton";
import { FlagDialog } from "@/components/news/flag-dialog";
import { ArticleBriefingToggleLayout } from "@/components/news/article-briefing-toggle-layout";
import { cn } from "@/lib/utils";
import { assignCategoryToArticle } from "@/lib/utils/categoryMapper";
import { NextSteps } from "@/components/news/next-steps";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await fetchGuardianArticles({ pageSize: 20 }).catch(() => []);
  return articles.map((a) => ({ slug: encodeURIComponent(a.id) }));
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function takePreviewParagraphs(
  paragraphs: string[],
  opts: { maxWords: number; maxParagraphs: number },
): { preview: string[]; truncated: boolean } {
  let words = 0;
  const preview: string[] = [];

  for (const p of paragraphs) {
    if (preview.length >= opts.maxParagraphs) break;
    const pWords = p.split(/\s+/).filter(Boolean);
    if (preview.length > 0 && words >= opts.maxWords) break;

    preview.push(p);
    words += pWords.length;

    if (words >= opts.maxWords) break;
  }

  return {
    preview,
    truncated: preview.length < paragraphs.length,
  };
}

function BriefingPanelWrapper({
  focus,
}: {
  focus?: "context" | "timeline" | "stakes";
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-plum-100 bg-parchment transition-[transform,box-shadow] duration-200 ease-out lg:hover:translate-y-[-2px] lg:hover:shadow-[0_18px_50px_rgba(74,19,71,0.12)]">
      <div className="border-b border-plum-100 bg-plum-50/50 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chartreuse-500">
            <Sparkles className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <div>
            <span className="font-ui text-[0.875rem] font-semibold uppercase tracking-[0.2em] text-[#d4849a]">
              AI Briefing
            </span>
            <p className="font-sans text-[0.65rem] text-ink-muted">
              Context on this story — powered by Claude
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <BriefingPanel focus={focus} />
      </div>

      <div className="border-t border-plum-100 px-6 py-3">
        <p className="font-sans text-[0.6rem] leading-relaxed text-ink-muted/70">
          AI briefing generated from article content. Always verify with primary sources.
        </p>
      </div>
    </div>
  );
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guardianPath = decodeURIComponent(slug);

  const [article, briefingRow] = await Promise.all([
    fetchGuardianArticleByPath(guardianPath),
    fetchAiBriefingRowForArticle(guardianPath),
  ]);

  if (!article) notFound();

  const existingBriefing = briefingFromRow(briefingRow);

  const headline = article.webTitle ?? "Untitled";
  const byline = article.fields?.byline ?? null;
  const section = article.sectionName ?? "News";
  const pubDate = article.webPublicationDate
    ? new Date(article.webPublicationDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const trailText = article.fields?.trailText ?? null;
  const thumbnail = article.fields?.thumbnail ?? null;
  const bodyText = article.fields?.bodyText ?? null;
  const webUrl = article.webUrl ?? "#";
  const sectionId = article.sectionId ?? "";
  const categories = assignCategoryToArticle({
    title: headline,
    snippet: trailText,
    source: "The Guardian",
    url: webUrl,
    upstreamCategory: article.sectionName ?? "",
  });
  const primaryCategory = categories[0] ?? "all";

  const allParagraphs = bodyText ? splitParagraphs(bodyText) : [];
  const { preview: previewParagraphs, truncated } = takePreviewParagraphs(
    allParagraphs,
    { maxWords: 400, maxParagraphs: 4 },
  );

  const readMinutes = bodyText ? estimateReadTime(bodyText) : null;

  return (
    <>
      <BriefingProvider
        articleId={article.id}
        articleTitle={headline}
        articleBody={bodyText ?? headline}
        existingBriefing={existingBriefing}
      >
      <article className="mx-auto max-w-[1200px] px-5 pb-20 pt-6 md:px-10 lg:px-16">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted transition-colors hover:text-plum-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            The Briefing
          </Link>
          <FlagDialog
            articleId={article.id}
            isSignedIn={false}
            redirectPath={`/news/${encodeURIComponent(guardianPath)}`}
          />
        </div>

        <ArticleBriefingToggleLayout
          article={
            <>
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-chartreuse-500 px-3.5 py-1 font-sans text-[0.65rem] font-bold uppercase tracking-widest text-ink">
                  {section}
                </span>
                {byline ? (
                  <span className="flex items-center gap-1.5 font-sans text-sm text-ink-muted">
                    <User className="h-3.5 w-3.5" aria-hidden />
                    {byline}
                  </span>
                ) : null}
                {pubDate ? (
                  <>
                    <span className="text-plum-200" aria-hidden>·</span>
                    <time className="font-sans text-sm text-ink-muted">{pubDate}</time>
                  </>
                ) : null}
                {readMinutes ? (
                  <>
                    <span className="text-plum-200" aria-hidden>·</span>
                    <span className="flex items-center gap-1 font-sans text-sm text-ink-muted">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      Est. {readMinutes} min read
                    </span>
                  </>
                ) : null}
              </div>

              {/* Headline */}
              <h1 className="mt-5 font-serif text-[2rem] font-semibold leading-[1.12] tracking-tight text-plum-700 md:text-[2.75rem] lg:text-[3.25rem]">
                {headline}
              </h1>

              {/* Deck */}
              {trailText ? (
                <p
                  className="mt-4 max-w-[60ch] font-serif text-[1.15rem] italic leading-[1.65] text-ink-muted md:text-[1.3rem]"
                  dangerouslySetInnerHTML={{ __html: trailText }}
                />
              ) : null}

              {/* Hero image */}
              {thumbnail ? (
                <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
                  <Image
                    src={thumbnail}
                    alt={headline}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 720px"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmN2YyZTgiLz48L3N2Zz4="
                  />
                </div>
              ) : null}

              {/* Body copy */}
              {previewParagraphs.length > 0 ? (
                <div className="mt-8 max-w-[68ch] space-y-6">
                  {previewParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className={cn(
                        "text-pretty hyphens-auto font-prose text-[18px] leading-[1.7] tracking-[-0.01em] text-ink",
                        i === 0 && "font-medium",
                      )}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              ) : null}

              {/* CTA */}
              <div className="mt-10 border-t border-plum-100 pt-8">
                {truncated ? (
                  <p className="mb-5 font-sans text-sm leading-[1.7] text-ink-muted">
                    You&apos;re viewing a short preview for context. Continue on the original source for the full story.
                  </p>
                ) : null}
                <a
                  href={webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold text-parchment shadow-sm",
                    "bg-linear-to-r from-[#d4849a] to-[#9a4b63] hover:from-[#c7748c] hover:to-[#82394e]",
                    "transition-[transform,box-shadow,background-position] hover:translate-y-[-2px] hover:shadow-[0_12px_30px_rgba(154,75,99,0.22)]",
                  )}
                >
                  Continue reading on The Guardian
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <p className="mt-3 font-sans text-xs text-ink-muted">
                  This article is sourced from The Guardian.
                </p>
              </div>

              <div className="mt-10">
                <NextSteps readMoreHref={`/news?category=${encodeURIComponent(primaryCategory)}`} />
              </div>

              {/* Related — below the fold, deferred */}
              <div style={{ contentVisibility: "auto", containIntrinsicSize: "auto 600px" }}>
                <Suspense fallback={<RelatedSkeleton />}>
                  <RelatedEventsSection sectionId={sectionId} />
                </Suspense>
              </div>
            </>
          }
          briefingContext={<BriefingPanelWrapper focus="context" />}
          briefingTimeline={<BriefingPanelWrapper focus="timeline" />}
          briefingStakes={<BriefingPanelWrapper focus="stakes" />}
        />
      </article>
      </BriefingProvider>
    </>
  );
}
