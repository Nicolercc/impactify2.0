export function BriefingPanelSkeleton() {
  return (
    <div aria-busy>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mb-6">
          <div className="h-3 w-24 animate-pulse rounded bg-plum-100" />
          <div className="mt-2 h-2 w-full animate-pulse rounded bg-plum-100/80" />
          <div className="mt-2 h-2 w-5/6 animate-pulse rounded bg-plum-100/80" />
          <div className="mt-2 h-2 w-4/5 animate-pulse rounded bg-plum-100/80" />
        </div>
      ))}
    </div>
  );
}
