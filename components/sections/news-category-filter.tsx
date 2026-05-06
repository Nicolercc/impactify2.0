"use client";

import { useEffect, useMemo, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type NewsCategoryFilterItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  articleCount: number;
};

export type NewsCategoryFilterProps = {
  categories: NewsCategoryFilterItem[]; // includes counts
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
};

export function NewsCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: NewsCategoryFilterProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const liveCategories = useMemo(
    () => categories.filter((c) => c.articleCount > 0),
    [categories],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-cat='${CSS.escape(activeCategory)}']`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategory]);

  return (
    <div
      ref={scrollerRef}
      className="flex gap-3 overflow-x-auto snap-x pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:gap-4"
      role="tablist"
      aria-label="Filter by category"
    >
      {liveCategories.map((cat) => {
        const active = activeCategory === cat.id;
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="news-preview-cards"
            tabIndex={active ? 0 : -1}
            data-cat={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "relative inline-flex h-11 snap-start items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap",
              "transition-[background-color,color,transform,box-shadow] duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
              active
                ? "bg-plum-700 text-parchment font-medium"
                : "bg-parchment-100 text-ink hover:bg-plum-50",
              "active:scale-[0.98]",
            )}
            aria-label={`${cat.label}, ${cat.articleCount} articles`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            <span>{cat.label}</span>
            <span className={cn("text-xs", active ? "text-parchment/80" : "text-ink-muted")}>
              {cat.articleCount}
            </span>
            <AnimatePresence>
              {active ? (
                <motion.span
                  layoutId="news-filter-underline"
                  className="absolute -bottom-1 left-4 right-4 h-[2px] rounded-full bg-chartreuse-500"
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
                  }
                />
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

