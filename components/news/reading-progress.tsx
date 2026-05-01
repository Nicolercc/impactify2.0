"use client";

import { useReducedMotion, useScroll, useSpring, motion } from "framer-motion";

export function ReadingProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
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
