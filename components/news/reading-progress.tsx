"use client";

import { useReducedMotion, useScroll, useSpring, motion } from "framer-motion";
import type { RefObject } from "react";

export function ReadingProgress({
  targetRef,
}: {
  /** If provided, progress tracks this element (e.g. article preview), not the full page. */
  targetRef?: RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll(
    targetRef
      ? {
          target: targetRef,
          offset: ["start start", "end start"],
        }
      : undefined,
  );
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "left" }}
      className="fixed left-0 right-0 top-0 z-50 h-[3px] bg-chartreuse-500 shadow-[0_0_8px_0_theme(colors.chartreuse.500/60%)]"
    />
  );
}
