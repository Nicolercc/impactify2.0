"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type AnimatedCounterProps = {
  value: number;
  duration?: number;
  delay?: number;
};

function easeCubicOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedCounter({ value, duration, delay = 0 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startAtRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  const final = Number.isFinite(value) ? value : 0;
  const dur = useMemo(() => {
    // Calm by default: deterministic duration, no jitter.
    const base = typeof duration === "number" ? duration : 900;
    return Math.max(200, base);
  }, [duration]);

  useEffect(() => {
    function cleanup() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (delayTimerRef.current) window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
      startAtRef.current = null;
    }

    cleanup();

    // Respect reduced motion: no counting animation.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false);
    if (prefersReducedMotion) {
      setDisplay(final);
      hasAnimatedRef.current = true;
      return cleanup;
    }

    // Animate once (first paint). Subsequent value changes snap to final
    // to avoid “fake live” vibes and repeated churn.
    if (hasAnimatedRef.current) {
      setDisplay(final);
      return cleanup;
    }

    const start = () => {
      const tick = (now: number) => {
        if (startAtRef.current == null) startAtRef.current = now;
        const elapsed = now - startAtRef.current;
        const t = Math.min(1, elapsed / dur);
        const eased = easeCubicOut(t);
        setDisplay(Math.round(eased * final));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          hasAnimatedRef.current = true;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      delayTimerRef.current = window.setTimeout(start, delay);
    } else {
      start();
    }

    return cleanup;
  }, [final, dur, delay]);

  return <>{display.toLocaleString()}</>;
}

