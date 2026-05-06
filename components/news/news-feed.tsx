"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleCardProps } from "@/components/news/ArticleCard";
import type { ArticleListItem, NewsIssueId } from "@/lib/news/queries";
import { ArticleGrid } from "@/components/news/ArticleGrid";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";

function toCardProps(row: ArticleListItem): ArticleCardProps {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek,
    publishedAt: row.published_at,
    sourceName: row.source_name,
    coverImageUrl: row.cover_image_url,
    categories: (row as unknown as { categories?: string[] }).categories,
  };
}

export function NewsFeed({
  articles,
  activeCause,
  initialIssue,
  initialQuery,
  page,
  pageSize,
  hasNextPage,
}: {
  articles: ArticleListItem[];
  activeCause?: string;
  initialIssue: string;
  initialQuery: string;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}) {
  void activeCause;
  void pageSize;

  const router = useRouter();
  const searchParams = useSearchParams();

  const issueFromUrl = (searchParams.get("issue") ?? initialIssue ?? "all").trim() || "all";
  const qFromUrl = (searchParams.get("q") ?? initialQuery ?? "").trim();

  const [draftQ, setDraftQ] = useState<string>(qFromUrl);
  const [searchPending, setSearchPending] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setDraftQ(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  const cards = useMemo(() => articles.map(toCardProps), [articles]);

  const ISSUE_PILLS: { id: NewsIssueId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "climate-action", label: "Climate" },
    { id: "affordable-housing", label: "Housing" },
    { id: "voting-rights", label: "Voting Rights" },
    { id: "labor-rights", label: "Labor" },
    { id: "immigration", label: "Immigration" },
  ];

  function pushParams(next: { issue?: string; q?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.issue) {
      if (next.issue === "all") params.delete("issue");
      else params.set("issue", next.issue);
    }
    if (next.q !== undefined) {
      const trimmed = next.q.trim();
      if (!trimmed) params.delete("q");
      else params.set("q", trimmed);
    }
    if (next.page !== undefined) {
      if (next.page <= 1) params.delete("page");
      else params.set("page", String(next.page));
    }
    const href = params.toString() ? `/news?${params.toString()}` : "/news";
    router.push(href);
  }

  function setActiveIssue(nextIssue: NewsIssueId) {
    if (nextIssue === "all") {
      setDraftQ("");
      pushParams({ issue: nextIssue, q: "", page: 1 });
      return;
    }
    pushParams({ issue: nextIssue, q: qFromUrl, page: 1 });
  }

  function flushSearchImmediate(next: string) {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setDraftQ(next);
    setSearchPending(false);
    pushParams({ issue: issueFromUrl, q: next, page: 1 });
  }

  function onSearchChange(next: string, immediate?: boolean) {
    setDraftQ(next);
    if (immediate) {
      flushSearchImmediate(next);
      return;
    }
    setSearchPending(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      pushParams({ issue: issueFromUrl, q: next, page: 1 });
      setSearchPending(false);
    }, 350);
  }

  function clearFilters() {
    setDraftQ("");
    pushParams({ issue: "all", q: "", page: 1 });
  }

  const canPrev = page > 1;
  const canNext = hasNextPage;

  const pageWindow = useMemo(() => {
    // Without a known total page count, render a stable, Google-ish window:
    // [1] … [p-1] [p] [p+1] … (Next)
    const p = Math.max(1, page);
    const nums: number[] = [];
    nums.push(1);
    if (p - 1 > 1) nums.push(p - 1);
    if (p !== 1) nums.push(p);
    if (p + 1 !== p && p + 1 > 1) nums.push(p + 1);
    // de-dupe + sort
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  }, [page]);

  function Pagination() {
    return (
      <nav
        className="mt-8 flex w-full items-center justify-center gap-2"
        aria-label="Pagination"
      >
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => pushParams({ page: page - 1 })}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold",
            "bg-white text-plum-700 shadow-sm hover:bg-plum-50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </button>

        <div className="mx-1 flex items-center gap-2">
          {pageWindow.map((n, idx) => {
            const prev = pageWindow[idx - 1];
            const needsEllipsis = idx > 0 && prev !== undefined && n - prev > 1;
            return (
              <div key={n} className="flex items-center gap-2">
                {needsEllipsis ? (
                  <span className="px-1 text-sm text-ink-muted" aria-hidden>
                    …
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => pushParams({ page: n })}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
                    n === page
                      ? "bg-plum-700 text-parchment shadow-sm"
                      : "bg-white text-plum-700 shadow-sm hover:bg-plum-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                  )}
                >
                  {n}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => pushParams({ page: page + 1 })}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold",
            "bg-[#D4F25A] text-ink shadow-sm hover:bg-[#c0d94a]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
          )}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </nav>
    );
  }

  const showEmptyState = cards.length === 0;
  const hasActiveFilters =
    (issueFromUrl && issueFromUrl !== "all") || Boolean(qFromUrl.trim());

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
      {/* Centered cluster: pills + search stay adjacent (small gap), not left-hugging. */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 py-8 md:gap-x-4">
        <div
          className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start"
          role="tablist"
          aria-label="Filter by issue"
        >
          {ISSUE_PILLS.map((p) => {
            const active = (issueFromUrl || "all") === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-pressed={active}
                tabIndex={0}
                onClick={() => setActiveIssue(p.id)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold",
                  "transition-[transform,box-shadow,background-color,border-color] duration-150",
                  active
                    ? cn(
                        "bg-[#D4F25A] text-ink shadow-md",
                        "ring-1 ring-ink/10 hover:bg-[#c9e853]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0d94a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                      )
                    : cn(
                        "border border-[#D4C4B8] bg-white text-plum-700",
                        "hover:-translate-y-0.5 hover:bg-plum-50/80 hover:shadow-sm",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                      ),
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto w-full max-w-md shrink-0 sm:mx-0 sm:w-auto sm:min-w-[200px] sm:max-w-[300px]">
          <label className="sr-only" htmlFor="news-search">
            Search articles
          </label>
          <div className="relative">
            <Search
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                searchPending ? "text-ink-muted/50" : "text-ink-muted",
              )}
              aria-hidden
            />
            <input
              id="news-search"
              value={draftQ}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  flushSearchImmediate("");
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchChange(draftQ, true);
                }
              }}
              placeholder="Search the briefing…"
              className={cn(
                "h-10 w-full rounded-lg border border-[#D4C4B8] bg-white pl-10 pr-10 text-sm text-ink",
                "shadow-sm placeholder:text-ink-muted/70",
                "focus-visible:border-plum-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
              )}
              aria-busy={searchPending}
              aria-describedby={searchPending ? "news-search-status" : undefined}
            />
            {searchPending ? (
              <Loader2
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-muted"
                aria-hidden
              />
            ) : null}
            <span id="news-search-status" className="sr-only" aria-live="polite">
              {searchPending ? "Applying search..." : ""}
            </span>
            {draftQ && !searchPending ? (
              <button
                type="button"
                onClick={() => onSearchChange("", true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted hover:bg-plum-50 hover:text-plum-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className="mb-10 h-0.5 max-w-none rounded-full bg-linear-to-r from-transparent via-[#D4F25A]/90 to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "transition-opacity duration-150",
          searchPending && !showEmptyState && "opacity-[0.72]",
        )}
      >
        {showEmptyState ? (
          <div className="mx-auto max-w-lg py-14 text-center">
            <h2 className="font-serif text-2xl text-plum-700">
              No articles found
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Try another topic or clear your filters to see the full briefing.
            </p>
            <div className="mx-auto mt-8 flex flex-wrap justify-center gap-2">
              {ISSUE_PILLS.slice(1).map((p) => (
                <button
                  key={`empty-${p.id}`}
                  type="button"
                  onClick={() => setActiveIssue(p.id)}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full border border-[#D4C4B8] bg-white px-4 text-sm font-semibold text-plum-700",
                    "hover:-translate-y-0.5 hover:bg-plum-50/80 hover:shadow-sm",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 text-sm font-semibold text-plum-700 underline decoration-plum-200 underline-offset-4 hover:text-plum-900"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        ) : (
          <ArticleGrid
            articles={cards}
            animationKey={`${issueFromUrl}|${qFromUrl}|${page}`}
          />
        )}
      </div>
      {!showEmptyState ? <Pagination /> : null}
    </div>
  );
}
