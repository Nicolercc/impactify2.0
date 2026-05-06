import { cn } from "@/lib/utils";

export type CurvedTopProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: "parchment" | "plum-50" | "plum-700" | "peach-200";
  /** Curve overlap + top padding (px). Default 48. Tighter landing band uses ~40% less. */
  overlapInsetPx?: number;
};

const bgClass: Record<NonNullable<CurvedTopProps["bg"]>, string> = {
  parchment: "bg-parchment",
  "plum-50": "bg-plum-50",
  "plum-700": "bg-plum-700",
  "peach-200": "bg-peach-200",
};

export function CurvedTop({
  children,
  className,
  id,
  bg = "parchment",
  overlapInsetPx = 48,
}: CurvedTopProps) {
  return (
    <div
      id={id}
      className={cn("relative z-10 overflow-hidden rounded-t-[40px]", bgClass[bg], className)}
      style={{ marginTop: `-${overlapInsetPx}px`, paddingTop: `${overlapInsetPx}px` }}
    >
      {children}
    </div>
  );
}
