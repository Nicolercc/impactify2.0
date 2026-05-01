"use client";

export function RelatedSkeleton() {
  return (
    <div className="mt-16 border-t border-plum-100 pt-10">
      <div className="h-4 w-32 animate-pulse rounded bg-plum-100" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-plum-100/50 p-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-2.5 w-16 rounded bg-plum-100/60" />
            <div className="mt-3 h-3.5 w-full rounded bg-plum-100/50" />
            <div className="mt-1.5 h-3.5 w-[75%] rounded bg-plum-100/50" />
            <div className="mt-3 h-2.5 w-28 rounded bg-plum-100/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

