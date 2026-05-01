"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function NumberCounter({
  to,
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? to : 0);

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setDisplay(to);
      return;
    }

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(eased * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, to, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
