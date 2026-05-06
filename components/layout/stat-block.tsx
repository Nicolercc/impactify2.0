import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatBlock({
  value,
  label,
  accentColor = "chartreuse",
  tone = "default",
}: {
  value: ReactNode;
  label: string;
  accentColor?: "chartreuse" | "peach";
  tone?: "default" | "parchment";
}) {
  const bar =
    accentColor === "peach"
      ? "bg-peach-400"
      : "bg-chartreuse-500";

  const valueClass =
    tone === "parchment"
      ? "font-serif text-display text-parchment"
      : "font-serif text-display text-plum-700";

  const labelClass =
    tone === "parchment"
      ? "mt-2 font-sans text-eyebrow uppercase tracking-widest text-parchment/75"
      : "mt-2 font-sans text-eyebrow uppercase tracking-widest text-ink-muted";

  return (
    <div className="flex gap-4">
      <div className={cn("w-1 shrink-0 rounded-full", bar)} aria-hidden />
      <div>
        <p className={valueClass}>{value}</p>
        <p className={labelClass}>{label}</p>
      </div>
    </div>
  );
}
