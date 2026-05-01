"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CurvedTop } from "@/components/decorative/curved-top";
import { cn } from "@/lib/utils";
import type { GuardianArticle } from "@/lib/news/queries";
import { NEWS_CATEGORIES, NEWS_CATEGORY_BY_ID } from "@/lib/constants/categories";
import { assignCategoryToArticle } from "@/lib/utils/categoryMapper";
import { NewsCategoryFilter, type NewsCategoryFilterItem } from "@/components/sections/news-category-filter";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim();
}

function formatTimeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BriefingCard({ article }: { article: GuardianArticle }) {
  const href = `/news/${encodeURIComponent(article.id)}`;
  const trail = stripHtml(article.fields.trailText);
  const thumb = article.fields.thumbnail?.trim();
  const section = article.sectionName?.trim() || "News";

  return (
    <div className="[perspective:1200px]">
      <Link href={href} className="group block">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-plum-100/60 bg-parchment shadow-sm",
            "transform-gpu [transform-style:preserve-3d]",
            "[transform:rotateY(0deg)_rotateX(0deg)_scale(1)] transition-[transform,box-shadow,border-color] duration-300 ease-out",
            "group-hover:[transform:rotateY(4deg)_rotateX(2deg)_scale(1.02)]",
            "group-hover:border-plum-300 group-hover:shadow-[0_20px_60px_rgba(74,19,71,0.12)]",
          )}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 85vw, 25vw"
              />
            ) : (
              <div className="h-full w-full bg-plum-100" aria-hidden />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-plum-900/45 via-transparent to-transparent" />

            <span className="absolute left-3 top-3 rounded-full bg-plum-700 px-3 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-parchment">
              {section.toUpperCase()}
            </span>

            <span className="absolute right-3 top-3 rounded-full bg-chartreuse-500 px-2.5 py-1 font-sans text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-ink">
              Verified
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-[0.6875rem] text-ink-muted">
              <span className="font-medium text-ink">The Guardian</span>
              <span className="text-plum-300">·</span>
              <span>{formatTimeAgo(article.webPublicationDate)}</span>
            </div>

            <h3 className="mt-2.5 line-clamp-2 font-serif text-[1.05rem] font-semibold leading-[1.3] tracking-[-0.01em] text-plum-700 transition-colors group-hover:text-plum-500">
              {article.webTitle}
            </h3>

            <p className="mt-2 line-clamp-2 font-sans text-[0.8125rem] leading-[1.55] text-ink-muted">
              {trail || "\u00a0"}
            </p>

            <div className="mt-4 inline-flex items-center gap-1 font-sans text-[0.8125rem] font-medium text-plum-700 transition-colors group-hover:text-chartreuse-700">
              <span>Read briefing</span>
              <span aria-hidden>→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export interface NewsPreviewProps {
  articles: GuardianArticle[];
}

export function NewsPreview({ articles }: NewsPreviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollStep(dir: "left" | "right") {
    const root = scrollRef.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>("[data-briefing-card]");
    const step = (first?.offsetWidth ?? 300) + 20;
    root.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  const activeCategory = (searchParams.get("category") ?? "all").trim() || "all";

  const mapped = useMemo(() => {
    return articles.map((a) => {
      const trail = stripHtml(a.fields?.trailText ?? "");
      const categories = assignCategoryToArticle({
        title: a.webTitle,
        snippet: trail,
        source: "The Guardian",
        url: a.webUrl,
        upstreamCategory: a.sectionName,
      });
      return { article: a, categories };
    });
  }, [articles]);

  const liveCategoryItems = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mapped) {
      for (const id of m.categories) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    const allCount = mapped.length;
    counts.set("all", allCount);

    // Pick 3–7 categories: always include "all", then top N by count (excluding all/trending)
    const ranked = NEWS_CATEGORIES
      .filter((c) => c.id !== "trending")
      .map((c) => ({
        id: c.id,
        label: c.label,
        icon: c.icon,
        articleCount: counts.get(c.id) ?? 0,
      }))
      .filter((c) => c.articleCount > 0 || c.id === "all")
      .sort((a, b) => {
        if (a.id === "all") return -1;
        if (b.id === "all") return 1;
        return b.articleCount - a.articleCount;
      });

    const capped = ranked.slice(0, 7);
    return capped satisfies NewsCategoryFilterItem[];
  }, [mapped]);

  const filteredArticles = useMemo(() => {
    if (activeCategory === "all") return mapped.map((m) => m.article);
    // Only show if we have a live category; otherwise fall back to all.
    if (!NEWS_CATEGORY_BY_ID[activeCategory]) return mapped.map((m) => m.article);
    const out = mapped.filter((m) => m.categories.includes(activeCategory)).map((m) => m.article);
    return out.length > 0 ? out : mapped.map((m) => m.article);
  }, [activeCategory, mapped]);

  function onCategoryChange(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("category");
    else params.set("category", id);
    router.push(params.toString() ? `?${params.toString()}` : "?");
  }

  return (
    <CurvedTop
      bg="parchment"
      id="the-briefing"
      className="scroll-mt-20"
      overlapInsetPx={29}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <p className="font-sans text-eyebrow font-medium uppercase tracking-[0.14em] text-ink-muted">
              THE BRIEFING
            </p>
            <h2 className="font-serif text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] text-plum-700 md:text-[40px] lg:text-[52px]">
              Understand first,
              <br />
              <em className="font-serif font-semibold italic text-chartreuse-700">
                then act.
              </em>
            </h2>
            <p className="font-dm-sans-stack mx-auto max-w-[36rem] text-[1.0625rem] leading-[1.55] text-ink-muted md:text-[1.125rem]">
              Real stories, real context, powered by AI. Every article includes a
              structured clarity report — perspectives, stakeholders, and what you
              can actually do.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="w-full max-w-4xl">
            <NewsCategoryFilter
              categories={liveCategoryItems}
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
            />
          </div>
        </div>

        <div className="relative mt-10 lg:mt-14">
          <button
            type="button"
            aria-label="Scroll carousel left"
            onClick={() => scrollStep("left")}
            className="absolute left-[-24px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-plum-100 bg-parchment text-plum-700 shadow-[0_4px_16px_rgba(74,19,71,0.12)] transition-all hover:scale-105 hover:bg-plum-700 hover:text-parchment md:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            aria-label="Scroll carousel right"
            onClick={() => scrollStep("right")}
            className="absolute right-[-24px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-plum-100 bg-parchment text-plum-700 shadow-[0_4px_16px_rgba(74,19,71,0.12)] transition-all hover:scale-105 hover:bg-plum-700 hover:text-parchment md:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            id="news-preview-cards"
          >
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                data-briefing-card
                className={cn(
                  "w-[min(85vw,340px)] shrink-0 snap-start",
                  "lg:w-[calc((100%-3.75rem)/4)]",
                )}
              >
                <BriefingCard article={article} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-plum-700 px-6 py-3 font-sans text-sm font-medium text-plum-700 transition-all hover:bg-plum-700 hover:text-parchment"
          >
            Explore the briefing
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </CurvedTop>
  );
}
