"use client";

import { ArticleCard, type ArticleCardProps } from "@/components/news/ArticleCard";
import { FeaturedCard } from "@/components/news/FeaturedCard";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { SkeletonCard } from "@/components/news/SkeletonCard";
import type { NewsCategory } from "@/lib/constants/categories";
import { EmptyState } from "@/components/news/EmptyState";

export function ArticleGrid({
  articles,
  className,
  animationKey,
  isPending,
  emptyState,
}: {
  articles: ArticleCardProps[];
  className?: string;
  /** Keyed to selected category so AnimatePresence can crossfade */
  animationKey?: string;
  isPending?: boolean;
  emptyState?: { activeLabel: string; categories: NewsCategory[] };
}) {
  const prefersReducedMotion = useReducedMotion();
  const [first, ...rest] = articles;

  if (isPending) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 pt-10",
          "gap-3 md:gap-4 lg:gap-6",
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
        aria-busy
      >
        <div className="lg:col-span-2">
          <SkeletonCard featured />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0 && emptyState) {
    return (
      <EmptyState
        activeLabel={emptyState.activeLabel}
        categories={emptyState.categories}
      />
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        when: "beforeChildren",
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
    exit: { opacity: 0, transition: { duration: prefersReducedMotion ? 0 : 0.3 } },
  };

  const easeMaterial = [0.4, 0, 0.2, 1] as [number, number, number, number];

  const item: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.6, ease: easeMaterial },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey ?? "grid"}
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
        className={cn(
          "grid grid-cols-1 pt-10",
          // mobile 12px, tablet 16px, desktop 24px
          "gap-3 md:gap-4 lg:gap-6",
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          className,
        )}
      >
        {first ? (
          <motion.div variants={item} className="lg:col-span-2">
            <FeaturedCard {...first} />
          </motion.div>
        ) : null}
        {rest.map((a) => (
          <motion.div variants={item} key={a.id}>
            <ArticleCard {...a} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

