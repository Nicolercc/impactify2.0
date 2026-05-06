import { NewsFeed } from "@/components/news/news-feed";
import { fetchArticleListItems } from "@/lib/news/queries";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const articles = await fetchArticleListItems({
    q: sp.q,
  });

  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-6 md:pt-8">
        <h1 className="font-serif text-[48px] font-medium leading-tight text-plum-700">The Briefing</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-muted">News on the issues that matter, with context.</p>
      </header>

      <NewsFeed articles={articles} activeCause={undefined} />
    </div>
  );
}
