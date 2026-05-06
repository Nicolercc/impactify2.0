"use client";

import { useMemo, useRef, useState } from "react";
import type { GuardianArticle } from "@/lib/news/queries";
import type { PublishedEventListItem } from "@/lib/events/queries";
import type { BriefingContent } from "@/lib/news/briefing";
import type { ArticleChapter } from "@/lib/article/build-chapters";
import { estimateReadMinutes } from "@/lib/article/build-chapters";
import type { ArticleReadMode } from "@/lib/article/parse-read-mode";
import { ARTICLE_MAX_CONTENT_WIDTH_PX } from "@/lib/article/article-read-constants";
import { ArticleLocationSync } from "@/components/article/article-location-sync";
import { ArticleProgressBar } from "@/components/article/article-progress-bar";
import { ArticleHeader } from "@/components/article/article-header";
import { ArticleBriefingSlot } from "@/components/article/article-briefing-slot";
import { ArticleBodyChapters } from "@/components/article/article-body-chapters";
import { ActionRail, type ActionRailCause } from "@/components/article/action-rail";
import { CommitBar } from "@/components/article/commit-bar";
import { ArticleInformedSentinel } from "@/components/article/article-informed-footer";
import { cn } from "@/lib/utils";

/** Space for fixed progress bar under the main nav */
const PROGRESS_CHROME_PX = 52;

export type ArticleReadingLayoutProps = {
  article: GuardianArticle;
  chapters: ArticleChapter[];
  existingBriefing: BriefingContent | null;
  events: PublishedEventListItem[];
  causes: ActionRailCause[];
  initialMode: ArticleReadMode;
  locationState: string | null;
  locationDistrict: string | null;
  govtrackBillId: number;
  issue: string;
  isAuthenticated: boolean;
};

export function ArticleReadingLayout(props: ArticleReadingLayoutProps) {
  const {
    article,
    chapters,
    existingBriefing,
    events,
    causes,
    initialMode,
    locationState,
    locationDistrict,
    govtrackBillId,
    issue,
    isAuthenticated,
  } = props;

  const articleRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ArticleReadMode>(initialMode);

  const headline = article.webTitle;
  const dek = article.fields?.trailText
    ? article.fields.trailText.replace(/<[^>]+>/g, "").trim()
    : null;
  const byline = article.fields?.byline?.trim() || null;
  const publishedLabel = article.webPublicationDate
    ? new Date(article.webPublicationDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const readMinutesFull = useMemo(
    () => estimateReadMinutes(article.fields?.bodyText ?? article.webTitle),
    [article.fields?.bodyText, article.webTitle],
  );

  const chapterTitles = useMemo(() => chapters.map((c) => c.title), [chapters]);

  const briefingBody = article.fields?.bodyText?.trim() || article.webTitle;

  return (
    <div className="relative">
      <ArticleLocationSync state={locationState} district={locationDistrict} />

      <ArticleProgressBar
        articleRef={articleRef}
        chapterTitles={chapterTitles}
        totalReadMinutes={readMinutesFull}
      />

      <div
        className="mx-auto w-full px-4 sm:px-6"
        style={{ maxWidth: ARTICLE_MAX_CONTENT_WIDTH_PX }}
      >
        <div style={{ paddingTop: PROGRESS_CHROME_PX }}>
          <ArticleHeader
            headline={headline}
            dek={dek}
            sectionLabel={article.sectionName || "News"}
            byline={byline}
            publishedLabel={publishedLabel}
            publishedIso={article.webPublicationDate ?? null}
            readMinutesFull={readMinutesFull}
            heroSrc={article.fields?.thumbnail?.trim() || null}
            heroAlt={headline}
            mode={mode}
            onModeChange={setMode}
          />

          <div
            className={cn(
              "mt-8 grid w-full gap-10 pb-28",
              "grid-cols-1",
              "lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]",
              "xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]",
            )}
          >
            <div ref={articleRef} className="min-w-0">
              <ArticleBriefingSlot
                articleId={article.id}
                articleTitle={headline}
                articleBody={briefingBody}
                existingBriefing={existingBriefing}
              />

              <ArticleBodyChapters chapters={chapters} mode={mode} />

              <ArticleInformedSentinel />
            </div>

            <ActionRail
              className="order-last lg:order-0"
              govtrackBillId={govtrackBillId}
              issue={issue}
              events={events}
              causes={causes}
              sourceUrl={article.webUrl}
              sourceLabel="Original article"
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      <CommitBar />
    </div>
  );
}
