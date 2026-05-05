import type { PublishedEventListItem } from "@/lib/events/queries";

/**
 * Prefer events in the reader's state; fall back to the full list (capped).
 */
export function filterEventsForArticleRail(
  events: PublishedEventListItem[],
  state: string | null,
  limit = 5,
): PublishedEventListItem[] {
  if (!state || state.length !== 2) {
    return events.slice(0, limit);
  }
  const u = state.toUpperCase();
  const inState = events.filter((e) => (e.state ?? "").toUpperCase() === u);
  if (inState.length > 0) return inState.slice(0, limit);
  return events.slice(0, limit);
}
