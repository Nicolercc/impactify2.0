import { cn } from "@/lib/utils";

export function FilterChip({
  children,
  active,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
        active
          ? "border-plum-700 bg-plum-700 text-parchment"
          : "border-plum-100 bg-transparent text-ink hover:bg-plum-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
