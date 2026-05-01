import { EventCardSkeleton } from "@/components/events/event-card-skeleton";

export default function EventsLoading() {
  return (
    <>
      <div className="bg-plum-700 py-section">
        <div className="mx-auto max-w-content px-6">
          <div className="h-6 w-28 animate-pulse rounded-full bg-parchment/20" />
          <div className="mt-4 h-14 max-w-xl animate-pulse rounded-lg bg-parchment/15" />
          <div className="mt-4 h-6 max-w-lg animate-pulse rounded bg-parchment/10" />
          <div className="mt-block grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-parchment/10" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-content px-6 pb-16 pt-10">
        <div className="grid grid-cols-1 gap-content md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
