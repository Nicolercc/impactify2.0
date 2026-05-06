export default function LoadingArticle() {
  return (
    <div className="min-h-screen bg-parchment pb-20 font-sans text-ink">
      <div className="mx-auto max-w-[1200px] px-5 pt-6 md:px-10 md:pt-8 lg:px-16">
        <div
          className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10"
          aria-busy="true"
          aria-label="Loading article"
        >
          {/* Left: editorial article skeleton */}
          <div className="min-w-0">
            <div className="space-y-6">
              {/* Top row (back + flag) */}
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-28 rounded bg-plum-100/70" />
                <div className="h-9 w-9 rounded-full bg-plum-100/60" />
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-6 w-24 rounded-full bg-chartreuse-500/50" />
                <div className="h-4 w-44 rounded bg-plum-100/60" />
                <div className="h-4 w-28 rounded bg-plum-100/50" />
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <div className="h-10 w-[92%] rounded-lg bg-plum-100/70 md:h-12" />
                <div className="h-10 w-[78%] rounded-lg bg-plum-100/70 md:h-12" />
                <div className="hidden h-10 w-[55%] rounded-lg bg-plum-100/60 md:block md:h-12" />
              </div>

              {/* Deck */}
              <div className="space-y-2">
                <div className="h-5 w-[88%] rounded bg-plum-100/50" />
                <div className="h-5 w-[66%] rounded bg-plum-100/50" />
              </div>

              {/* Hero image - ONLY element with animation */}
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-plum-100/50">
                <div className="h-full w-full animate-pulse bg-linear-to-r from-plum-100/30 via-plum-100/65 to-plum-100/30" />
              </div>

              {/* Body paragraphs (varied rhythm) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-[96%] rounded bg-plum-100/50" />
                  <div className="h-4 w-[90%] rounded bg-plum-100/50" />
                  <div className="h-4 w-[82%] rounded bg-plum-100/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-[92%] rounded bg-plum-100/45" />
                  <div className="h-4 w-[86%] rounded bg-plum-100/45" />
                  <div className="h-4 w-[74%] rounded bg-plum-100/45" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-[95%] rounded bg-plum-100/45" />
                  <div className="h-4 w-[80%] rounded bg-plum-100/45" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI briefing + action sidebar skeleton */}
          <aside className="min-w-0">
            <div className="space-y-5">
              {/* AI briefing card */}
              <div className="overflow-hidden rounded-2xl border border-plum-100 bg-parchment">
                <div className="border-b border-plum-100 bg-plum-50/50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-chartreuse-500/60" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-24 rounded bg-plum-100/60" />
                      <div className="mt-2 h-3 w-40 rounded bg-plum-100/45" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    <div className="h-3 w-28 rounded bg-plum-100/55" />
                    <div className="space-y-2">
                      <div className="h-3 w-[92%] rounded bg-plum-100/45" />
                      <div className="h-3 w-[84%] rounded bg-plum-100/45" />
                      <div className="h-3 w-[76%] rounded bg-plum-100/45" />
                    </div>
                    <div className="h-3 w-24 rounded bg-plum-100/55" />
                    <div className="space-y-2">
                      <div className="h-3 w-[90%] rounded bg-plum-100/45" />
                      <div className="h-3 w-[82%] rounded bg-plum-100/45" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-plum-100 px-6 py-3">
                  <div className="h-3 w-[86%] rounded bg-plum-100/35" />
                </div>
              </div>

              {/* Action widget skeleton */}
              <div className="rounded-2xl border border-plum-100 bg-parchment px-6 py-5">
                <div className="h-3 w-28 rounded bg-plum-100/55" />
                <div className="mt-4 space-y-2.5">
                  <div className="h-11 w-full rounded-xl bg-plum-100/45" />
                  <div className="h-11 w-full rounded-xl bg-plum-100/45" />
                  <div className="h-11 w-full rounded-xl bg-plum-100/45" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
