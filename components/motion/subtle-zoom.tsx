"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function SubtleZoom({ children, className }: { children: ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={paused ? { scale: 1 } : { scale: [1, 1.08] }}
      transition={
        paused
          ? { duration: 0.25 }
          : { duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
      }
      onHoverStart={() => setPaused(true)}
      onHoverEnd={() => setPaused(false)}
    >
      {children}
    </motion.div>
  );
}
