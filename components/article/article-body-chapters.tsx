"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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

function filterChaptersForMode(chapters: ArticleChapter[], mode: ArticleReadMode): ArticleChapter[] {
  if (mode === "tldr") {
    const first = chapters[0];
    if (!first) return [];
    return [
      {
        ...first,
        title: "TL;DR",
        paragraphs: first.paragraphs.slice(0, 2),
      },
    ];
  }
  if (mode === "clarity") {
    return chapters.slice(0, 3).map((c) => ({
      ...c,
      paragraphs: c.paragraphs.slice(0, 2),
    }));
  }
  return chapters;
}

export function ArticleBodyChapters(props: {
  chapters: ArticleChapter[];
  mode: ArticleReadMode;
}) {
  const { mode } = props;
  const [skim, setSkim] = useState(false);

  const visible = useMemo(() => filterChaptersForMode(props.chapters, mode), [props.chapters, mode]);

  return (
    <section aria-label="Article chapters" className="mt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-semibold text-plum-800 sm:text-2xl">Story</h2>
        <button
          type="button"
          onClick={() => setSkim((v) => !v)}
          aria-pressed={skim}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center rounded-full border px-4 font-sans text-sm font-semibold transition-colors",
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
                “{ch.pullQuote}”
              </blockquote>
            ) : null}

            {ch.image && !skim ? (
              <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-plum-50 ring-1 ring-plum-100">
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
                  className="text-pretty font-prose text-[1.05rem] leading-[1.75] text-ink sm:text-[1.125rem]"
                >
                  {skim ? firstSentence(p) : p}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
