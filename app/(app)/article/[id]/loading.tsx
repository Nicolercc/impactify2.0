export default function ArticleReadLoading() {
  return (
    <div className="min-h-screen bg-parchment pb-20 font-sans text-ink">
      <div className="mx-auto max-w-[1240px] px-4 pt-13 sm:px-6 md:px-8">
        <div
          className="grid w-full grid-cols-1 gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10"
          aria-busy="true"
          aria-label="Loading article"
        >
          {/* LEFT: article column */}
          <div className="min-w-0">
            <div className="space-y-6">
              {/* Eyebrow + metadata */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-6 w-28 rounded-full bg-plum-100/70" />
                <div className="h-4 w-40 rounded bg-plum-100/55" />
                <div className="h-4 w-28 rounded bg-plum-100/45" />
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <div className="h-11 w-[92%] rounded-lg bg-plum-100/70 md:h-12" />
                <div className="h-11 w-[78%] rounded-lg bg-plum-100/70 md:h-12" />
              </div>

              {/* Deck */}
              <div className="space-y-2">
                <div className="h-5 w-[88%] rounded bg-plum-100/45" />
                <div className="h-5 w-[66%] rounded bg-plum-100/45" />
              </div>

              {/* Hero image */}
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-plum-100/45">
                <div className="h-full w-full animate-pulse bg-linear-to-r from-plum-100/30 via-plum-100/65 to-plum-100/30" />
              </div>

              {/* Body blocks (editorial rhythm) */}
              <div className="mt-6 space-y-4">
                {[
                  ["96%", "90%", "82%"],
                  ["92%", "86%", "74%"],
                  ["95%", "80%"],
                  ["90%", "84%", "76%"],
                ].map((row, i) => (
                  <div key={i} className="space-y-2">
                    {row.map((w) => (
                      <div
                        key={w}
                        className="h-4 rounded bg-plum-100/45"
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: sidebar column */}
          <aside className="hidden min-w-0 flex-col gap-5 lg:flex">
            {/* Briefing card */}
            <div className="overflow-hidden rounded-2xl border border-plum-100 bg-parchment">
              <div className="border-b border-plum-100 bg-plum-50/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-chartreuse-500/60" />
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-24 rounded bg-plum-100/60" />
                    <div className="mt-2 h-3 w-40 rounded bg-plum-100/45" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="space-y-3">
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
              <div className="border-t border-plum-100 px-5 py-3">
                <div className="h-3 w-[86%] rounded bg-plum-100/35" />
              </div>
            </div>

            {/* Action rail */}
            <div className="rounded-2xl border border-plum-100 bg-parchment px-5 py-4">
              <div className="h-3 w-20 rounded bg-plum-100/60" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-11 w-full rounded-xl bg-plum-100/45" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
