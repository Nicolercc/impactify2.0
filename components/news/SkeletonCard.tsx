"use client";

import { cn } from "@/lib/utils";

export function SkeletonCard({ featured }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-plum-100 bg-white shadow-sm",
        featured ? "h-[380px]" : "h-[320px]",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "w-full bg-gradient-to-r from-parchment-100 via-white to-parchment-100",
          "animate-pulse [animation-duration:1.2s]",
          featured ? "h-[220px]" : "h-[180px]",
        )}
        style={{ opacity: 0.6 }}
      />
      <div className="space-y-3 p-4">
        <div className="h-5 w-28 rounded bg-parchment-100 animate-pulse" />
        <div className="h-6 w-5/6 rounded bg-parchment-100 animate-pulse" />
        <div className="h-6 w-2/3 rounded bg-parchment-100 animate-pulse" />
        <div className="h-4 w-full rounded bg-parchment-100 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-parchment-100 animate-pulse" />
      </div>
    </div>
  );
}

