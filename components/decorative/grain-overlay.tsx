"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function GrainOverlay({ className }: { className?: string }) {
  const id = useId();
  const filterId = `impactify-grain-${id.replace(/:/g, "")}`;

  return (
    <div
      className={cn(
        "grain-overlay pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}
