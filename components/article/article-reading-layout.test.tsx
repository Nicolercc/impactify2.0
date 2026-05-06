import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArticleReadingLayout } from "@/components/article/article-reading-layout";
import { DEMO_GUARDIAN_ARTICLE } from "@/lib/article/demo-guardian-article";
import { buildArticleChaptersFromBody } from "@/lib/article/build-chapters";
import type { PublishedEventListItem } from "@/lib/events/queries";

vi.mock("@/components/article/article-location-sync", () => ({
  ArticleLocationSync: () => null,
}));

vi.mock("@/components/article/article-progress-bar", () => ({
  ArticleProgressBar: () => (
    <div data-testid="article-progress" role="region" aria-label="Reading progress" />
  ),
}));

vi.mock("@/components/article/article-briefing-slot", () => ({
  ArticleBriefingSlot: () => <div data-testid="article-briefing">Briefing</div>,
}));

vi.mock("@/components/reps/reps-panel", () => ({
  RepsPanel: () => <div data-testid="reps-panel-mock">Reps</div>,
}));

vi.mock("@/components/article/commit-bar", () => ({
  CommitBar: () => <div data-testid="commit-bar">Commit</div>,
}));

const demoEvents: PublishedEventListItem[] = [
  {
    id: "e1",
    slug: "e1",
    title: "Town hall",
    description: null,
    starts_at: new Date().toISOString(),
    ends_at: null,
    city: "NYC",
    state: "NY",
    is_virtual: false,
    venue_name: null,
    cover_image_url: null,
    category: null,
    attendee_count: null,
    capacity: null,
    status: "published",
    event_causes: null,
  },
];

describe("ArticleReadingLayout", () => {
  it("renders headline, briefing slot, story landmark, and rail sections", () => {
    const chapters = buildArticleChaptersFromBody(DEMO_GUARDIAN_ARTICLE);

    render(
      <ArticleReadingLayout
        article={DEMO_GUARDIAN_ARTICLE}
        chapters={chapters}
        existingBriefing={null}
        events={demoEvents}
        causes={[{ title: "News", slug: "news" }]}
        initialMode="clarity"
        locationState="NY"
        locationDistrict={null}
        govtrackBillId={430139}
        issue="demo"
        isAuthenticated={false}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(DEMO_GUARDIAN_ARTICLE.webTitle);
    expect(screen.getByTestId("article-briefing")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Reading progress" })).toBeInTheDocument();

    const story = screen.getByRole("region", { name: "Article chapters" });
    expect(within(story).getByRole("heading", { name: "Story" })).toBeInTheDocument();

    const rail = screen.getByRole("complementary", { name: "Related actions and context" });
    expect(within(rail).getByRole("heading", { name: "Upcoming near you" })).toBeInTheDocument();
    expect(within(rail).getByRole("heading", { name: "Saved causes" })).toBeInTheDocument();
    expect(within(rail).getByRole("heading", { name: "Sources" })).toBeInTheDocument();
  });
});
