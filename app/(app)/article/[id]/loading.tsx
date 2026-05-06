export default function ArticleReadLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-13 sm:px-6 md:px-8">
      {/* Header */}
      <div className="py-8">
        <div className="h-4 w-20 animate-pulse rounded-full bg-plum-100" />
        <div className="mt-5 space-y-3">
          <div className="h-9 w-5/6 animate-pulse rounded-lg bg-plum-100" />
          <div className="h-9 w-4/5 animate-pulse rounded-lg bg-plum-100" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-plum-50" />
          <div className="h-4 w-24 animate-pulse rounded bg-plum-50" />
        </div>
        <div className="mt-6 aspect-video w-full animate-pulse rounded-xl bg-plum-50" />
      </div>

      {/* Content grid — matches article-reading-layout.tsx */}
      <div className="mt-8 grid w-full gap-6 pb-28 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Article body */}
        <div className="max-w-[68ch] space-y-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-plum-50" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-plum-50" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-plum-50" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-5">
          {/* Briefing card */}
          <div className="overflow-hidden rounded-2xl border border-plum-100">
            <div className="border-b border-plum-100 px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-plum-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-plum-100" />
              </div>
              <div className="h-3 w-44 animate-pulse rounded bg-plum-50" />
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="h-3 w-full animate-pulse rounded bg-plum-50" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-plum-50" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-plum-50" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-plum-50" />
            </div>
            <div className="border-t border-plum-100 px-5 py-3">
              <div className="h-3 w-48 animate-pulse rounded bg-plum-50" />
            </div>
          </div>

          {/* ActionRail */}
          <div className="rounded-2xl border border-plum-100 p-5 space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-plum-100 mb-4" />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-plum-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
