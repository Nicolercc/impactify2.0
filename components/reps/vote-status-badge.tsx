"use client";

import { cn } from "@/lib/utils";

export type VoteStatus = "YEA" | "NAY" | "PENDING" | "ABSTAIN" | "UNDECIDED";

export function VoteStatusBadge({ status, className }: { status: VoteStatus; className?: string }) {
  const tone =
    status === "YEA"
      ? "bg-chartreuse-500/20 text-chartreuse-500 ring-chartreuse-500/30"
      : status === "NAY"
        ? "bg-[#E07856]/20 text-[#E07856] ring-[#E07856]/30"
        : status === "ABSTAIN"
          ? "bg-white/10 text-white/80 ring-white/15 dark:bg-white/5 dark:text-[#d4c9bc]"
          : status === "PENDING"
            ? "bg-white/10 text-white/80 ring-white/15 dark:bg-white/5 dark:text-[#d4c9bc]"
            : "bg-ink/5 text-ink-muted ring-ink/10 dark:bg-white/5 dark:text-[#d4c9bc] dark:ring-white/10";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] ring-1",
        tone,
        className,
      )}
    >
      {status}
    </span>
  );
}

