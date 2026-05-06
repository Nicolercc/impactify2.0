"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleReadMode } from "@/lib/article/parse-read-mode";

export type ArticleHeaderProps = {
  headline: string;
  dek: string | null;
  sectionLabel: string;
  byline: string | null;
  publishedLabel: string | null;
  publishedIso: string | null;
  readMinutesFull: number;
  heroSrc: string | null;
  heroAlt: string;
  mode: ArticleReadMode;
  onModeChange: (m: ArticleReadMode) => void;
};

const MODE_META: Record<
  ArticleReadMode,
  { label: string; hint: string; target: string }
> = {
  tldr: { label: "TL;DR", hint: "≈ 15s", target: "15 second scan" },
  clarity: { label: "Clarity", hint: "≈ 90s", target: "90 second clarity pass" },
  full: { label: "Full", hint: "Full read", target: "12 min deep read" },
};

export function ArticleHeader(props: ArticleHeaderProps) {
  const {
    headline,
    dek,
    sectionLabel,
    byline,
    publishedLabel,
    publishedIso,
    readMinutesFull,
    heroSrc,
    heroAlt,
    mode,
    onModeChange,
  } = props;

  return (
    <header className="border-b border-plum-100/80 pb-8">
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1 font-sans text-xs text-ink-muted sm:text-sm">
          <li>
            <Link href="/" className="hover:text-plum-700">
              Home
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            <Link href="/news" className="hover:text-plum-700">
              The Briefing
            </Link>
          </li>
          <li className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
            <span className="truncate text-ink">{headline}</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-chartreuse-500 px-3 py-1 font-sans text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink">
          {sectionLabel}
        </span>
        {byline ? (
          <span className="flex items-center gap-1.5 font-sans text-xs text-ink-muted sm:text-sm">
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {byline}
          </span>
        ) : null}
        {publishedLabel ? (
          <>
            <span className="text-plum-200" aria-hidden>
              ·
            </span>
            <time className="font-sans text-xs text-ink-muted sm:text-sm" dateTime={publishedIso ?? undefined}>
              {publishedLabel}
            </time>
          </>
        ) : null}
        <span className="text-plum-200" aria-hidden>
          ·
        </span>
        <span className="flex items-center gap-1 font-sans text-xs text-ink-muted sm:text-sm">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Est. {readMinutesFull} min read (full)
        </span>
      </div>

      <h1 className="mt-4 max-w-[22ch] font-serif text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.02em] text-plum-800 sm:max-w-none sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3rem]">
        {headline}
      </h1>

      {dek ? (
        <p className="mt-4 max-w-[68ch] font-serif text-base leading-relaxed text-ink-muted sm:text-lg">{dek}</p>
      ) : null}

      <div
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        role="group"
        aria-label="Reading mode"
      >
        <p className="font-sans text-xs text-ink-muted sm:text-sm">Choose how you want to read this story.</p>
        <div className="inline-flex rounded-full border border-plum-200 bg-white/80 p-1 shadow-sm dark:bg-white/5">
          {(Object.keys(MODE_META) as ArticleReadMode[]).map((m) => {
            const meta = MODE_META[m];
            const on = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                aria-pressed={on}
                aria-label={`${meta.label} mode, ${meta.target}`}
                className={cn(
                  "rounded-full px-3 py-2 font-sans text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                  on ? "bg-plum-700 text-parchment shadow-sm" : "text-plum-800 hover:bg-plum-50 dark:hover:bg-white/10",
                )}
              >
                {meta.label}
                <span className={cn("ml-1 text-[0.65rem] font-normal opacity-80", on && "text-parchment/90")}>
                  {meta.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {heroSrc ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-plum-50 ring-1 ring-plum-100">
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1240px) 90vw, 1200px"
          />
        </div>
      ) : null}
    </header>
  );
}
