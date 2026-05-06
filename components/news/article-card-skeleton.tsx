import { cn } from "@/lib/utils";

export function ArticleCardSkeleton({ featured }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm",
      )}
    >
      <div
        className={cn(
          "w-full animate-pulse bg-parchment-100",
          featured ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[2/1]",
        )}
      />
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <div className="flex gap-2">
          <div className="h-3 w-16 animate-pulse rounded-full bg-parchment-100" />
          <div className="h-3 w-14 animate-pulse rounded-full bg-parchment-100" />
        </div>
        <div
          className={cn(
            "animate-pulse rounded-lg bg-parchment-100",
            featured ? "h-9 max-w-2xl w-full md:h-10" : "h-6 w-full",
          )}
        />
        <div className="h-3 w-full max-w-xl animate-pulse rounded bg-parchment-100" />
        <div className="h-3 w-full max-w-md animate-pulse rounded bg-parchment-100" />
        <div className="mt-auto flex gap-2 pt-1">
          <div className="h-5 w-16 animate-pulse rounded-full bg-plum-50" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-plum-50" />
        </div>
      </div>
    </div>
  );
}
