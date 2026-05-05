import { describe, expect, it } from "vitest";
import { parseArticleReadMode } from "@/lib/article/parse-read-mode";
import { filterEventsForArticleRail } from "@/lib/article/filter-events-by-state";
import type { PublishedEventListItem } from "@/lib/events/queries";

const mk = (state: string | null): PublishedEventListItem => ({
  id: "x",
  slug: "x",
  title: "T",
  description: null,
  starts_at: new Date().toISOString(),
  ends_at: null,
  city: null,
  state,
  is_virtual: false,
  venue_name: null,
  cover_image_url: null,
  category: null,
  attendee_count: null,
  capacity: null,
  status: "published",
  event_causes: null,
});

describe("parseArticleReadMode", () => {
  it("parses clarity by default and common aliases", () => {
    expect(parseArticleReadMode(undefined)).toBe("clarity");
    expect(parseArticleReadMode("CLARITY")).toBe("clarity");
    expect(parseArticleReadMode("tldr")).toBe("tldr");
    expect(parseArticleReadMode("full")).toBe("full");
  });
});

describe("filterEventsForArticleRail", () => {
  it("prefers in-state events when state is set", () => {
    const events = [mk("CA"), mk("NY"), mk("NY")];
    const out = filterEventsForArticleRail(events, "NY", 5);
    expect(out.every((e) => e.state === "NY")).toBe(true);
    expect(out.length).toBe(2);
  });

  it("falls back to the head of the list when no state match", () => {
    const events = [mk("CA"), mk("OR")];
    const out = filterEventsForArticleRail(events, "NY", 5);
    expect(out.length).toBeGreaterThan(0);
  });
});
