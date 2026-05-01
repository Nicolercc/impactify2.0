"use client";

export function BriefingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-plum-100 bg-parchment">
      <div className="border-b border-plum-100 bg-plum-50/50 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 animate-pulse rounded-full bg-plum-100" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-plum-100" />
            <div className="h-2.5 w-36 animate-pulse rounded bg-plum-100" />
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-chartreuse-500" />
          <span className="animate-pulse font-sans text-[0.7rem] text-ink-muted">
            Generating briefing...
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="h-3 w-full animate-pulse rounded bg-plum-100/70" />
          <div
            className="h-3 w-[92%] animate-pulse rounded bg-plum-100/70"
            style={{ animationDelay: "75ms" }}
          />
          <div
            className="h-3 w-[85%] animate-pulse rounded bg-plum-100/70"
            style={{ animationDelay: "150ms" }}
          />
        </div>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-plum-100/50 p-3"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-2.5 w-24 rounded bg-plum-100/60" />
            <div className="mt-2 h-2.5 w-full rounded bg-plum-100/40" />
            <div className="mt-1.5 h-2.5 w-[80%] rounded bg-plum-100/40" />
          </div>
        ))}

        <div className="flex gap-2 pt-1">
          <div className="h-7 w-24 animate-pulse rounded-full bg-plum-100/50" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-plum-100/50" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-plum-100/50" />
        </div>
      </div>
    </div>
  );
}

