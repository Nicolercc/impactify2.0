"use client";

import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { NEWS_CATEGORY_BY_ID } from "@/lib/constants/categories";

const PLACEHOLDER = "/images/fallback-cover.svg";

export type ArticleCardProps = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  publishedAt: string;
  sourceName: string | null;
  coverImageUrl: string | null;
  /** Optional category ids from API (kebab-case). */
  categories?: string[];
  featured?: boolean;
};

function formatPublished(iso: string) {
  try {
    return format(parseISO(iso), "MMM d");
  } catch {
    return "";
  }
}

function resolveCategoryId(categories?: string[]) {
  const first = categories?.find((c) => typeof c === "string" && c.trim())?.trim();
  if (first && NEWS_CATEGORY_BY_ID[first]) return first;
  return "all";
}

export function ArticleCard({
  id,
  slug: _slug,
  title,
  dek,
  publishedAt,
  sourceName,
  coverImageUrl,
  categories,
  featured = false,
}: ArticleCardProps) {
  const cover = coverImageUrl?.trim() || PLACEHOLDER;
  const categoryId = resolveCategoryId(categories);
  const category = NEWS_CATEGORY_BY_ID[categoryId] ?? NEWS_CATEGORY_BY_ID.all;

  const cardHeight = featured ? "h-[380px]" : "h-[320px]";
  const imgHeight = featured ? "h-[220px]" : "h-[180px]";
  // Mobile requirement: titles 20px; desktop standard 16px.
  const titleSize = featured
    ? "text-[20px] leading-[1.3] md:text-[20px]"
    : "text-[20px] leading-[1.3] md:text-[16px]";
  const titleClamp = featured ? "line-clamp-3" : "line-clamp-2";
  const dekClamp = featured ? "line-clamp-4" : "line-clamp-2";

  return (
    <Link
      href={`/article/${encodeURIComponent(id)}?mode=clarity`}
      className={cn(
        "group block focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-4 focus-visible:ring-offset-parchment",
      )}
    >
      <article
        className={cn(
          "overflow-hidden rounded-[12px] border border-plum-100 bg-white",
          cardHeight,
          "transition-all duration-200 ease-in-out",
          // Mobile: subtle shadow, no lift. Desktop hover lift.
          "shadow-sm md:shadow-none md:group-hover:-translate-y-1 md:group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)]",
        )}
        aria-label={title}
      >
        {/* Image */}
        <div className={cn("relative w-full overflow-hidden rounded-t-[12px]", imgHeight)}>
          <Image
            src={cover}
            alt=""
            fill
            className={cn(
              "object-cover transition-transform duration-300 ease-out",
              "group-hover:scale-[1.02]",
              "filter-[brightness(1)] group-hover:filter-[brightness(0.92)]",
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmN2YyZTgiLz48L3N2Zz4="
          />
        </div>

        {/* Content */}
        <div className={cn("flex flex-col p-4", featured ? "h-[160px]" : "h-[140px]")}>
          <div className="flex items-start justify-between gap-3">
            {/* Category pill */}
            <span
              className="inline-flex items-center rounded-full px-[10px] py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white"
              style={{ backgroundColor: category?.color ?? "#e8e8e8" }}
              title={category?.description}
            >
              {category?.label ?? "All"}
            </span>
            <time className="shrink-0 pt-0.5 font-sans text-[12px] text-ink-muted">
              {formatPublished(publishedAt)}
            </time>
          </div>

          <h3
            className={cn(
              "mt-2 font-prose tracking-[-0.01em] text-[#2c2c2c] transition-colors",
              titleSize,
              titleClamp,
              "group-hover:text-[#d4849a]",
            )}
          >
            {title}
          </h3>

          {dek ? (
            <p className={cn("mt-2 text-[14px] leading-normal text-[#666]", dekClamp)}>
              {dek}
            </p>
          ) : (
            <div className="mt-2 flex-1" />
          )}

          <p className="mt-auto pt-2 font-sans text-[12px] text-ink-muted">
            {sourceName ?? "The Guardian"}
          </p>
        </div>
      </article>
    </Link>
  );
}

