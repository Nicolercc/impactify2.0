import { cn } from "@/lib/utils";

export function EyebrowBadge({
  children,
  tone = "chartreuse",
  className,
}: {
  children: React.ReactNode;
  tone?: "chartreuse" | "peach" | "plum";
  className?: string;
}) {
  const tones = {
    chartreuse: "bg-chartreuse-500 text-ink",
    peach: "bg-peach-400 text-ink",
    plum: "bg-plum-100 text-plum-700",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-sans text-eyebrow font-medium uppercase tracking-widest",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
