"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleChapter } from "@/lib/article/build-chapters";
import type { ArticleReadMode } from "@/lib/article/parse-read-mode";
import { ARTICLE_SCROLL_MARGIN_TOP_PX } from "@/lib/article/article-read-constants";

function firstSentence(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  const idx = t.search(/(?<=[.!?])\s/);
  if (idx === -1) return t.length > 220 ? `${t.slice(0, 220)}…` : t;
  return t.slice(0, idx + 1).trim();
}

function filterChaptersForMode(
  chapters: ArticleChapter[],
  mode: ArticleReadMode,
): ArticleChapter[] {
  if (mode === "tldr") {
    const first = chapters[0];
    if (!first) return [];
    return [{ ...first, title: "TL;DR", paragraphs: first.paragraphs.slice(0, 2) }];
  }
  if (mode === "clarity") {
    return chapters.slice(0, 1).map((c) => ({
      ...c,
      paragraphs: c.paragraphs.slice(0, 2),
    }));
  }
  return chapters;
}

function ArticlePreviewFooter(props: {
  sourceUrl: string;
  onViewFullStory: () => void;
}) {
  const { sourceUrl, onViewFullStory } = props;

  return (
    <div className="mx-auto mt-8 mb-8 max-w-[68ch]">
      <div
        className="mb-6 h-0.5 w-full rounded-full bg-gradient-to-r from-transparent via-[#D4F25A]/80 to-transparent"
        aria-hidden
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Continue reading on The Guardian (opens in new tab)"
          className={cn(
            "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2",
            "font-sans text-sm font-semibold text-plum-900",
            "bg-[#D4F25A] shadow-sm",
            "transition-[transform,box-shadow] duration-200 sm:w-auto sm:justify-start",
            "hover:-translate-y-px hover:bg-[#c9e853] hover:shadow-[0_10px_24px_rgba(74,19,71,0.12)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          )}
        >
          Continue reading on The Guardian
          <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
        </a>

        <button
          type="button"
          onClick={onViewFullStory}
          aria-label="View the full article on this page"
          className={cn(
            "inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2",
            "border border-plum-200 bg-white font-sans text-sm font-semibold text-plum-800",
            "transition-colors duration-200 sm:w-auto",
            "hover:bg-plum-50 hover:border-plum-300",
            "dark:border-white/20 dark:bg-white/5 dark:text-parchment dark:hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          )}
        >
          View full story
        </button>
      </div>
    </div>
  );
}

export function ArticleBodyChapters(props: {
  chapters: ArticleChapter[];
  mode: ArticleReadMode;
  sourceUrl?: string;
  onModeChange?: (mode: ArticleReadMode) => void;
}) {
  const { mode, sourceUrl, onModeChange } = props;
  const [skim, setSkim] = useState(true);

  const visible = useMemo(
    () => filterChaptersForMode(props.chapters, mode),
    [props.chapters, mode],
  );

  return (
    <section aria-label="Article chapters" className="mt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-plum-800 sm:text-2xl">Story</h2>
        <button
          type="button"
          onClick={() => setSkim((v) => !v)}
          aria-pressed={skim}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4",
            "font-sans text-sm font-semibold transition-colors duration-200",
            skim
              ? "border-plum-700 bg-plum-700 text-parchment"
              : "border-plum-200 bg-white text-plum-800 hover:bg-plum-50 dark:bg-white/5 dark:hover:bg-white/10",
          )}
        >
          {skim ? "Skim mode on" : "Skim mode off"}
        </button>
      </div>

      <div className="space-y-14">
        {visible.map((ch, idx) => (
          <article
            key={ch.slug}
            data-article-chapter
            data-chapter-index={String(idx)}
            id={`chapter-${ch.slug}`}
            style={{ scrollMarginTop: ARTICLE_SCROLL_MARGIN_TOP_PX }}
            className="max-w-[68ch]"
          >
            <h3 className="font-serif text-2xl font-semibold text-plum-800">{ch.title}</h3>

            {skim && ch.pullQuote ? (
              <blockquote className="mt-4 border-l-4 border-chartreuse-500 pl-4 font-serif text-lg italic leading-relaxed text-ink">
                "{ch.pullQuote}"
              </blockquote>
            ) : null}

            {ch.image && !skim ? (
              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-plum-50 ring-1 ring-plum-100">
                <Image
                  src={ch.image.src}
                  alt={ch.image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className={cn("mt-6 space-y-5", skim && "space-y-3")}>
              {ch.paragraphs.map((p, j) => (
                <p
                  key={`${ch.slug}-${j}`}
                  className="text-pretty font-prose text-[1.05rem] leading-[1.8] text-ink sm:text-[1.125rem]"
                >
                  {skim ? firstSentence(p) : p}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {mode !== "full" && sourceUrl && onModeChange ? (
        <ArticlePreviewFooter
          sourceUrl={sourceUrl}
          onViewFullStory={() => onModeChange("full")}
        />
      ) : null}
    </section>
  );
}
