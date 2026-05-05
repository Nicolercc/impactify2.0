"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  useReducedMotion,
  useScroll,
  useSpring,
  motion,
  useMotionValueEvent,
} from "framer-motion";
import { NAV_HEIGHT_PX } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";

type Props = {
  articleRef: RefObject<HTMLElement | null>;
  chapterTitles: string[];
  totalReadMinutes: number;
};

export function ArticleProgressBar({ articleRef, chapterTitles, totalReadMinutes }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 36,
    restDelta: 0.001,
  });

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-article-chapter]"));
    if (nodes.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible?.target) return;
        const idx = Number((visible.target as HTMLElement).dataset.chapterIndex ?? "0");
        if (!Number.isNaN(idx)) setActiveIdx(idx);
      },
      { root: null, rootMargin: "-40% 0px -40% 0px", threshold: [0.05, 0.15, 0.35, 0.55] },
    );

    for (const n of nodes) obs.observe(n);
    return () => obs.disconnect();
  }, [articleRef, chapterTitles.length]);

  const label = chapterTitles[activeIdx] ?? chapterTitles[0] ?? "Article";
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(v);
  });

  const pctRounded = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const minutesLeft = Math.max(0, Math.ceil((1 - progress) * totalReadMinutes));

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 border-b border-plum-100/80 bg-parchment/95 backdrop-blur-md",
        prefersReducedMotion && "backdrop-blur-none",
      )}
      style={{ top: NAV_HEIGHT_PX }}
      role="region"
      aria-label="Reading progress"
    >
      {!prefersReducedMotion ? (
        <motion.div
          aria-hidden
          style={{ scaleX, transformOrigin: "left" }}
          className="h-1 bg-chartreuse-500/90"
        />
      ) : (
        <div className="h-1 bg-chartreuse-500/40" aria-hidden />
      )}

      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="min-w-0 truncate font-sans text-xs font-semibold text-plum-800 sm:text-sm">
          <span className="text-ink-muted">Section · </span>
          {label}
        </p>
        <div className="flex shrink-0 items-center gap-3 font-sans text-xs text-ink-muted sm:text-sm">
          <span aria-live="polite">{pctRounded}%</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span className="hidden sm:inline" aria-live="polite">
            ~{minutesLeft} min left
          </span>
        </div>
      </div>
    </div>
  );
}
