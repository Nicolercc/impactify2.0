import { ArticleCardSkeleton } from "@/components/news/article-card-skeleton";

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-6 md:pt-8">
        <div className="h-12 w-2/3 max-w-sm animate-pulse rounded-lg bg-parchment-100 md:h-14 md:max-w-md" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-parchment-100" />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-parchment-100 md:w-28"
            />
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 pt-10 md:grid-cols-2 md:gap-8">
          <div className="md:col-span-2">
            <ArticleCardSkeleton featured />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
