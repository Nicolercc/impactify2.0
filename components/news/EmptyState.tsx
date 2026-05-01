"use client";

import { CategoryPills } from "@/components/news/category-pills";
import type { NewsCategory } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

export function EmptyState({
  activeLabel,
  categories,
  className,
}: {
  activeLabel: string;
  categories: NewsCategory[];
  className?: string;
}) {
  return (
    <div className={cn("py-14", className)}>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-2xl text-plum-700">
          No articles in <span className="italic">{activeLabel}</span> yet
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-ink-muted">
          Check back soon or explore another topic.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-4xl">
        <CategoryPills categories={categories} />
      </div>
    </div>
  );
}

