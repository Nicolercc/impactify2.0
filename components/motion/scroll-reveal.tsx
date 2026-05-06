"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  direction?: "up" | "left" | "right";
};

const initialFor = (direction: ScrollRevealProps["direction"]) => {
  switch (direction) {
    case "left":
      return { opacity: 0, x: -28, y: 0 };
    case "right":
      return { opacity: 0, x: 28, y: 0 };
    case "up":
    default:
      return { opacity: 0, x: 0, y: 28 };
  }
};

const active = { opacity: 1, x: 0, y: 0 };

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  once = true,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const from = initialFor(direction);

  return (
    <motion.div
      ref={ref}
      initial={from}
      animate={isInView ? active : from}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
