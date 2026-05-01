import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, User, Sparkles } from "lucide-react";
import { fetchGuardianArticleByPath } from "@/lib/news/guardian-client";
import { BriefingPanel } from "@/components/news/briefing-panel";
import { RelatedEventsSection } from "@/components/news/related-events";
import { BriefingSkeleton } from "@/components/news/briefing-skeleton";
import { RelatedSkeleton } from "@/components/news/related-skeleton";

async function BriefingPanelWrapper({
  articleId,
  articleText,
  articleTitle,
}: {
  articleId: string;
  articleText: string;
  articleTitle: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-plum-100 bg-parchment">
      <div className="border-b border-plum-100 bg-plum-50/50 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-chartreuse-500">
            <Sparkles className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <div>
            <span className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.1em] text-plum-700">
              AI Briefing
            </span>
            <p className="font-sans text-[0.65rem] text-ink-muted">
              Context on this story — powered by Claude
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <BriefingPanel
          articleId={articleId}
          articleTitle={articleTitle}
          articleBody={articleText}
          existingBriefing={null}
          relatedCauseSlug={null}
        />
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
  const article = await fetchGuardianArticleByPath(guardianPath);

  if (!article) notFound();

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

  return (
    <article className="mx-auto max-w-[1200px] px-5 pb-20 md:px-10 lg:px-16">
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 font-sans text-sm text-ink-muted transition-colors hover:text-plum-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        The Briefing
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-chartreuse-500 px-3.5 py-1 font-sans text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink">
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
                <span className="text-plum-200">·</span>
                <span className="font-sans text-sm text-ink-muted">{pubDate}</span>
              </>
            ) : null}
          </div>

          <h1 className="mt-5 font-serif text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-plum-700 md:text-[2.75rem] lg:text-[3.25rem]">
            {headline}
          </h1>

          {trailText ? (
            <p
              className="mt-4 font-serif text-[1.15rem] italic leading-[1.5] text-ink-muted md:text-[1.3rem]"
              dangerouslySetInnerHTML={{ __html: trailText }}
            />
          ) : null}

          {thumbnail ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={thumbnail}
                alt={headline}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 720px"
              />
            </div>
          ) : null}

          {bodyText ? (
            <div className="mt-8 space-y-5">
              {bodyText
                .split("\n\n")
                .filter(Boolean)
                .slice(0, 12)
                .map((para, i) => (
                  <p key={i} className="font-sans text-[1.0625rem] leading-[1.8] text-ink">
                    {para}
                  </p>
                ))}
            </div>
          ) : null}

          <div className="mt-10 border-t border-plum-100 pt-8">
            <a
              href={webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-plum-700 px-7 py-3 font-sans text-sm font-medium text-parchment transition-colors hover:bg-plum-500"
            >
              Continue reading on The Guardian
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <p className="mt-3 font-sans text-xs text-ink-muted">
              This article is sourced from The Guardian.
            </p>
          </div>

          <Suspense fallback={<RelatedSkeleton />}>
            <RelatedEventsSection sectionId={sectionId} />
          </Suspense>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Suspense fallback={<BriefingSkeleton />}>
            <BriefingPanelWrapper
              articleId={article.id}
              articleTitle={headline}
              articleText={bodyText ?? headline}
            />
          </Suspense>
        </aside>
      </div>
    </article>
  );
}
