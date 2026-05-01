"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArticleCard, type ArticleCardProps } from "@/components/news/article-card";
import { CAUSES } from "@/lib/constants/categories";
import { flattenArticleCauses } from "@/lib/news/helpers";
import type { ArticleListItem } from "@/lib/news/queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
    isEditorial: row.is_editorial,
    causes,
  };
}

function ArticleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 pt-10 md:grid-cols-2 md:gap-8" aria-busy>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm",
            i === 0 && "md:col-span-2",
          )}
        >
          <div className={cn("w-full bg-parchment-100 animate-pulse", i === 0 ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[2/1]")} />
          <div className="space-y-3 p-4 md:p-5">
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

  const causeSlug = (activeCause ?? searchParams.get("cause") ?? "all").trim() || "all";
  const [editorialOnly, setEditorialOnly] = useState(false);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (editorialOnly && !a.is_editorial) return false;
      return true;
    });
  }, [articles, editorialOnly]);

  const cards = filtered.map(toCardProps);
  const [featured, ...rest] = cards;

  function handleCauseSelect(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("cause");
    else params.set("cause", slug);
    startTransition(() => {
      router.push(params.toString() ? `/news?${params.toString()}` : "/news");
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <div className="flex flex-col gap-4 border-b border-border/60 py-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={causeSlug === "all" ? "default" : "outline"}
            className={cn(
              "rounded-full",
              causeSlug === "all" && "bg-plum-700 text-parchment hover:bg-plum-700/90",
            )}
            aria-pressed={causeSlug === "all"}
            onClick={() => handleCauseSelect("all")}
          >
            All
          </Button>
          {CAUSES.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={causeSlug === c.slug ? "default" : "outline"}
              className={cn(
                "rounded-full",
                causeSlug === c.slug && "bg-plum-700 text-parchment hover:bg-plum-700/90",
              )}
              aria-pressed={causeSlug === c.slug}
              onClick={() => handleCauseSelect(c.slug)}
            >
              {c.title}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="editorial-only" className="text-sm text-ink-muted">
            Editorial
          </Label>
          <Switch id="editorial-only" checked={editorialOnly} onCheckedChange={setEditorialOnly} />
        </div>
      </div>

      {isPending ? (
        <ArticleGridSkeleton />
      ) : cards.length === 0 ? (
        <p className="py-16 text-center font-serif text-xl text-plum-700">No articles match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 pt-10 md:grid-cols-2 md:gap-8">
          {featured ? (
            <div className="md:col-span-2">
              <ArticleCard {...featured} featured />
            </div>
          ) : null}
          {rest.map((props) => (
            <ArticleCard key={props.id} {...props} />
          ))}
        </div>
      )}
    </div>
  );
}
