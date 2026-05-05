import type { GuardianArticle } from "@/lib/news/queries";

/** Offline-friendly article for layout / CI when Guardian id is `demo`. */
export const DEMO_GUARDIAN_ARTICLE: GuardianArticle = {
  id: "demo/impactify-read-demo",
  webTitle: "Practice read: how civic tools meet the news",
  webUrl: "https://www.theguardian.com/world",
  webPublicationDate: new Date().toISOString(),
  sectionName: "Demo",
  fields: {
    thumbnail:
      "https://images.unsplash.com/photo-1529107387015-e8c68f35e008?auto=format&fit=crop&w=1600&q=80",
    trailText:
      "This demo article exercises the reading layout: briefing stream, chapters, progress, and the action rail.",
    byline: "Impactify",
    bodyText: `Local organizers often start with a question, not a slogan. Who is harmed today, and what lever can neighbors pull without waiting for a distant agency?

City councils move on agendas published days in advance. That rhythm rewards people who can read dense PDFs quickly and translate them for friends.

When coverage is clear, residents show up with better questions. When coverage is noisy, the same room fills with certainty and very little shared fact.

School boards and district budgets look like accounting exercises. In practice, they are values documents: class sizes, nurses, librarians, counselors.

Transit agencies publish route changes as minor notices. Riders experience them as early mornings and missed shifts.

Housing debates mix finance, safety, and aesthetics. Most participants are acting in good faith—and talking past each other.

Climate policy spans international treaties and backyard composting. The middle layer—state rules and utility planning—is where many fights are won or lost.

Immigration policy touches workplaces, schools, and courts at once. That complexity is not a reason to avoid civic engagement; it is a reason to pace the work.

Democracy is a skill: reading, showing up, following up. Tools that respect attention spans help people practice that skill without burning out.`,
  },
};
