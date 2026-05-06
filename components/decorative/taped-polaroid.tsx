"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const tapeColorClass = {
  chartreuse: "bg-chartreuse-500/60",
  peach: "bg-peach-400/60",
  plum: "bg-plum-500/60",
} as const;

export function TapedPolaroid({
  src,
  alt,
  rotate = -3,
  tapeColor = "chartreuse",
  width = 220,
  height = 200,
}: {
  src: string;
  alt: string;
  rotate?: number;
  tapeColor?: keyof typeof tapeColorClass;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className="relative inline-block drop-shadow-[0_12px_24px_rgba(43,11,42,0.18)]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="relative bg-parchment-100 px-3 pb-12 pt-3"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 0 rgba(26,15,26,0.06)",
        }}
      >
        <div
          className={cn(
            "absolute -left-1 -top-3 h-6 w-16 -rotate-6 shadow-sm",
            tapeColorClass[tapeColor],
          )}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)",
          }}
          aria-hidden
        />
        <div className="relative overflow-hidden" style={{ width, height }}>
          <Image src={src} alt={alt} width={width} height={height} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
