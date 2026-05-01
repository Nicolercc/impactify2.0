"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const stroke: Record<NonNullable<UnderlineFlourishProps["color"]>, string> = {
  chartreuse: "var(--chartreuse-500)",
  peach: "var(--peach-400)",
};

export type UnderlineFlourishProps = {
  children: ReactNode;
  color?: "chartreuse" | "peach";
  className?: string;
};

export function UnderlineFlourish({
  children,
  color = "chartreuse",
  className,
}: UnderlineFlourishProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(wrapRef, { once: true, margin: "-20px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <span ref={wrapRef} className={`relative inline-block ${className ?? ""}`}>
      {children}
      <svg
        className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full overflow-visible"
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M2 8 Q30 2 60 8 T118 7"
          fill="none"
          stroke={stroke[color]}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={isInView || prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </span>
  );
}
