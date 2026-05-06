"use client";

import { Sparkles } from "lucide-react";
import { BriefingPanel } from "@/components/news/briefing-panel";
import { BriefingProvider } from "@/components/news/briefing-store";
import { BriefingSkeleton } from "@/components/news/briefing-skeleton";
import { BriefingErrorBoundary } from "@/components/article/briefing-error-boundary";
import { useBriefingData } from "@/components/news/briefing-store";
import type { BriefingContent } from "@/lib/news/briefing";

function BriefingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-plum-100 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#0E0A14]">
      <div className="border-b border-plum-100 bg-plum-50/60 px-5 py-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-chartreuse-500">
            <Sparkles className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <div>
            <p className="font-ui text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#d4849a]">
              AI clarity report
            </p>
            <p className="font-sans text-[0.65rem] text-ink-muted">Streams automatically while you read</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
      <div className="border-t border-plum-100 px-5 py-3 dark:border-white/10">
        <p className="font-sans text-[0.65rem] leading-relaxed text-ink-muted/80">
          Generated from article text. Verify with primary sources before acting.
        </p>
      </div>
    </div>
  );
}

function BriefingInner() {
  const { phase, errorMessage } = useBriefingData();

  if (phase === "error" && errorMessage) {
    return (
      <p className="font-sans text-sm text-ink-muted" role="alert">
        {errorMessage}
      </p>
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
}) {
  const { articleId, articleTitle, articleBody, existingBriefing } = props;

  return (
    <section aria-label="AI briefing" className="mt-8">
      <BriefingProvider
        articleId={articleId}
        articleTitle={articleTitle}
        articleBody={articleBody}
        existingBriefing={existingBriefing}
      >
        <BriefingErrorBoundary>
          <BriefingChrome>
            <BriefingInner />
          </BriefingChrome>
        </BriefingErrorBoundary>
      </BriefingProvider>
    </section>
  );
}
