"use client";

import Link from "next/link";
import { Share2, Bookmark, Compass, FileText, Calendar, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublishedEventListItem } from "@/lib/events/queries";

export type ActionRailCause = { title: string; slug: string };

async function shareArticle(url: string, title: string) {
  if (typeof navigator === "undefined") return;
  if (navigator.share) {
    try {
      await navigator.share({ url, title });
      return;
    } catch {
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // clipboard unavailable — silently ignore
  }
}

const btn = cn(
  "flex min-h-11 w-full items-center gap-3",
  "px-4 py-3 text-left font-sans text-sm font-semibold",
  "border border-plum-200 bg-white text-plum-900",
  "rounded-lg transition-[background-color,border-color] duration-200",
  "hover:bg-plum-50 hover:border-plum-300",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum-400 focus-visible:ring-offset-2",
  "dark:border-white/10 dark:bg-white/5 dark:text-parchment dark:hover:bg-white/10 dark:hover:border-white/20",
);

export function ActionRail(props: {
  className?: string;
  govtrackBillId: number;
  issue: string;
  events: PublishedEventListItem[];
  causes: ActionRailCause[];
  sourceUrl: string;
  sourceLabel: string;
  articleTitle?: string;
  isAuthenticated?: boolean;
}) {
  const {
    className,
    issue,
    events,
    sourceUrl,
    sourceLabel,
    articleTitle = "",
    isAuthenticated = false,
  } = props;

  return (
    <div
      id="action-rail"
      role="complementary"
      className={cn("w-full", className)}
      aria-label="Related actions and context"
    >
      <div className="rounded-2xl border border-plum-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0E0A14]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-plum-700 dark:text-[#F4EFE3]">
          Take Action
        </h2>

        <div className="flex flex-col gap-2">
          {/* Call your rep — rep finder coming soon */}
          <button
            type="button"
            disabled
            title="Coming soon — Rep finder launching May 2026"
            aria-label="Call your rep — coming soon"
            className={cn(
              btn,
              "cursor-not-allowed opacity-50",
              "hover:border-plum-200 hover:bg-white",
              "dark:hover:border-white/10 dark:hover:bg-white/5",
            )}
          >
            <Phone className="h-5 w-5 shrink-0 text-plum-400" aria-hidden />
            <span className="flex-1">Call your rep</span>
            <span className="ml-auto text-xs font-normal text-ink-muted">Soon</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => shareArticle(sourceUrl, articleTitle)}
            aria-label="Share this article"
            className={btn}
          >
            <Share2 className="h-5 w-5 shrink-0 text-plum-500" aria-hidden />
            <span className="flex-1">Share</span>
          </button>

          {/* Save to causes */}
          <button
            type="button"
            aria-label={isAuthenticated ? "Save to causes" : "Sign in to save to causes"}
            className={btn}
          >
            <Bookmark className="h-5 w-5 shrink-0 text-plum-500" aria-hidden />
            <span className="flex-1">Save to causes</span>
          </button>

          {/* Read more on topic */}
          <Link
            href={`/news?category=${encodeURIComponent(issue)}`}
            aria-label={`Read more on ${issue}`}
            className={btn}
          >
            <Compass className="h-5 w-5 shrink-0 text-plum-500" aria-hidden />
            <span className="flex-1">Read more</span>
          </Link>

          {/* View sources */}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${sourceLabel} (opens in new tab)`}
            className={btn}
          >
            <FileText className="h-5 w-5 shrink-0 text-plum-500" aria-hidden />
            <span className="flex-1">View sources</span>
          </a>

          {/* Linked events — only shown when events exist */}
          {events.length > 0 && (
            <button
              type="button"
              aria-label={`${events.length} linked event${events.length !== 1 ? "s" : ""}`}
              className={btn}
            >
              <Calendar className="h-5 w-5 shrink-0 text-plum-500" aria-hidden />
              <span className="flex-1">Linked events</span>
              <span
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                aria-hidden
              >
                {events.length}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
