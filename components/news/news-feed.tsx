"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleCardProps } from "@/components/news/ArticleCard";
import { NEWS_CATEGORIES, NEWS_CATEGORY_BY_ID } from "@/lib/constants/categories";
import { flattenArticleCauses } from "@/lib/news/helpers";
import type { ArticleListItem } from "@/lib/news/queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CategoryPills } from "@/components/news/category-pills";
import { ArticleGrid } from "@/components/news/ArticleGrid";
import { filterByCategory, type Article as FilterArticle } from "@/lib/utils/filterArticles";

function toCardProps(row: ArticleListItem): ArticleCardProps {
  const causes = flattenArticleCauses(row.article_causes);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek,
    publishedAt: row.published_at,
    sourceName: row.source_name,
    coverImageUrl: row.cover_image_url,
    categories: (row as unknown as { categories?: string[] }).categories,
  };
}

function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 pt-10 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4" aria-busy>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "overflow-hidden rounded-[12px] border border-border/60 bg-white shadow-sm",
            i === 0 && "lg:col-span-2",
          )}
        >
          <div className={cn("w-full bg-parchment-100 animate-pulse", i === 0 ? "h-[220px]" : "h-[180px]")} />
          <div className="space-y-3 p-4">
            <div className="h-3 w-40 rounded bg-parchment-100 animate-pulse" />
            <div className="h-5 w-5/6 rounded bg-parchment-100 animate-pulse" />
            <div className="h-5 w-2/3 rounded bg-parchment-100 animate-pulse" />
            <div className="h-3 w-full rounded bg-parchment-100 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-parchment-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeed({
  articles,
  activeCause,
}: {
  articles: ArticleListItem[];
  activeCause?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // New URL param: ?category=reproductive-rights
  const categoryId = (searchParams.get("category") ?? "all").trim() || "all";
  const [editorialOnly, setEditorialOnly] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string>("All");

  const filtered = useMemo(() => {
    const base = articles.filter((a) => (editorialOnly ? a.is_editorial : true));

    // Normalize to the shape expected by filterByCategory()
    const normalized: FilterArticle[] = base.map((a) => ({
      id: a.id,
      title: a.title,
      snippet: a.dek ?? "",
      imageUrl: a.cover_image_url,
      source: a.source_name ?? "News",
      date: a.published_at,
      url: a.source_url ?? "",
      categories: (a.categories ?? ["all"]).filter(Boolean),
    }));

    const out = filterByCategory(normalized, categoryId);

    // Map back to ArticleListItem order (stable)
    const allow = new Set(out.map((x) => x.id));
    return base.filter((a) => allow.has(a.id));
  }, [articles, editorialOnly, categoryId]);

  const cards = filtered.map(toCardProps);
  const [featured, ...rest] = cards;

  useEffect(() => {
    const c = NEWS_CATEGORY_BY_ID[categoryId] ?? NEWS_CATEGORY_BY_ID.all;
    setActiveLabel(c?.label ?? "All");
  }, [categoryId]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border/60 py-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <CategoryPills
            categories={NEWS_CATEGORIES}
            onActiveChange={(id) => {
              const c = NEWS_CATEGORY_BY_ID[id] ?? NEWS_CATEGORY_BY_ID.all;
              setActiveLabel(c?.label ?? "All");
            }}
            navigate={(href) => {
              startTransition(() => {
                router.push(href);
              });
            }}
            replace={(href) => {
              startTransition(() => {
                router.replace(href);
              });
            }}
          />
          <p className="mt-4 font-sans text-sm text-ink-muted">
            Showing <span className="font-semibold text-ink">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "article" : "articles"} in{" "}
            <span className="font-semibold text-ink">{activeLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="editorial-only" className="text-sm text-ink-muted">
            Editorial
          </Label>
          <Switch id="editorial-only" checked={editorialOnly} onCheckedChange={setEditorialOnly} />
        </div>
      </div>

      <ArticleGrid
        articles={cards}
        isPending={isPending}
        animationKey={categoryId}
        emptyState={{ activeLabel, categories: NEWS_CATEGORIES }}
      />
    </div>
  );
}
