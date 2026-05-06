import { NewsFeed } from "@/components/news/news-feed";
import { fetchArticleListItems } from "@/lib/news/queries";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ issue?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const issue = (sp.issue ?? "all").trim() || "all";
  const q = (sp.q ?? "").trim() || undefined;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = 20;
  const articles = await fetchArticleListItems({
    q,
    issue:
      issue === "climate-action" ||
      issue === "affordable-housing" ||
      issue === "voting-rights" ||
      issue === "labor-rights" ||
      issue === "immigration" ||
      issue === "all"
        ? issue
        : "all",
    page,
    pageSize,
  });
  const hasNextPage = articles.length === pageSize;

  return (
    <div className="min-h-screen bg-parchment font-sans text-ink">
      <header className="mx-auto max-w-7xl px-4 pb-10 pt-10 text-center md:px-6 md:pb-12 md:pt-14 lg:px-8">
        <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-plum-700 md:text-[clamp(2.25rem,5vw,3.25rem)]">
          Civic News, Contextualized.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:mt-6 md:text-base">
          Real articles from trusted sources. AI-generated context to help you
          understand what&apos;s happening and why it matters.
        </p>
      </header>

      <NewsFeed
        key={`${issue}|${q ?? ""}|${page}`}
        articles={articles}
        activeCause={undefined}
        initialIssue={issue}
        initialQuery={q ?? ""}
        page={page}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
