"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BriefingPanel } from "@/components/news/briefing-panel";
import { BriefingProvider, useBriefingData } from "@/components/news/briefing-store";
import { BriefingSkeleton } from "@/components/news/briefing-skeleton";
import { BriefingErrorBoundary } from "@/components/article/briefing-error-boundary";
import type { BriefingContent } from "@/lib/news/briefing";

function BriefingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#0E0A14]">
      <div className="border-b border-plum-100 px-5 py-4 dark:border-white/10">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-plum-600" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wider text-plum-700 dark:text-[#F4EFE3]">
            AI Briefing
          </p>
        </div>
        <p className="text-xs italic text-plum-500 dark:text-plum-400">
          Context on this story — powered by Claude
        </p>
      </div>

      <div className="px-5 py-4">{children}</div>

      <div className="border-t border-plum-100 px-5 py-3 dark:border-white/10">
        <p className="text-xs leading-relaxed text-ink-muted/80">
          Generated from article text. Verify with primary sources before acting.
        </p>
      </div>
    </div>
  );
}

function BriefingInner({ articleUrl }: { articleUrl?: string }) {
  const { phase, errorMessage } = useBriefingData();

  if (phase === "error") {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-medium text-orange-900">
          {errorMessage ?? "Briefing unavailable."}{" "}
          {articleUrl && (
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-orange-950"
            >
              Read on The Guardian →
            </a>
          )}
        </p>
      </div>
    );
  }

  if (phase === "loading") {
    return <BriefingSkeleton />;
  }

  return <BriefingPanel />;
}

export function ArticleBriefingSlot(props: {
  articleId: string;
  articleTitle: string;
  articleBody: string;
  existingBriefing: BriefingContent | null;
  articleUrl?: string;
  className?: string;
}) {
  const { articleId, articleTitle, articleBody, existingBriefing, articleUrl, className } = props;

  return (
    <section aria-label="AI briefing" className={cn("mt-8", className)}>
      <BriefingProvider
        articleId={articleId}
        articleTitle={articleTitle}
        articleBody={articleBody}
        existingBriefing={existingBriefing}
      >
        <BriefingErrorBoundary>
          <BriefingChrome>
            <BriefingInner articleUrl={articleUrl} />
          </BriefingChrome>
        </BriefingErrorBoundary>
      </BriefingProvider>
    </section>
  );
}
