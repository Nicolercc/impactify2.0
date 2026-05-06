"use client";

import Link from "next/link";
import { Calendar, ExternalLink, HeartHandshake, Link2 } from "lucide-react";
import { RepsPanel } from "@/components/reps/reps-panel";
import { cn } from "@/lib/utils";
import type { PublishedEventListItem } from "@/lib/events/queries";

export type ActionRailCause = { title: string; slug: string };

export function ActionRail(props: {
  className?: string;
  govtrackBillId: number;
  issue: string;
  events: PublishedEventListItem[];
  causes: ActionRailCause[];
  sourceUrl: string;
  sourceLabel: string;
  isAuthenticated?: boolean;
}) {
  const {
    className,
    govtrackBillId,
    issue,
    events,
    causes,
    sourceUrl,
    sourceLabel,
    isAuthenticated = false,
  } = props;

  return (
    <div
      id="action-rail"
      role="complementary"
      className={cn(
        "flex w-full flex-col gap-6 lg:sticky lg:self-start",
        "lg:top-[124px] lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-10",
        className,
      )}
      aria-label="Related actions and context"
    >
      <div id="reps-panel">
        <RepsPanel govtrackBillId={govtrackBillId} issue={issue} title="Your representatives" />
      </div>

      <section
        aria-labelledby="rail-events-heading"
        className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0E0A14]"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-plum-600" aria-hidden />
          <h2 id="rail-events-heading" className="text-sm font-semibold text-ink dark:text-[#F4EFE3]">
            Upcoming near you
          </h2>
        </div>
        <ul className="mt-3 space-y-2">
          {events.length === 0 ? (
            <li className="text-sm text-ink-muted">No upcoming events listed.</li>
          ) : (
            events.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.slug}`}
                  className="group flex min-h-[44px] flex-col rounded-xl border border-transparent px-1 py-2 hover:border-plum-100 hover:bg-plum-50/40 dark:hover:border-white/10 dark:hover:bg-white/5"
                >
                  <span className="text-sm font-medium text-plum-900 group-hover:underline dark:text-[#F4EFE3]">
                    {e.title}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {new Date(e.starts_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {e.city ? ` · ${e.city}` : ""}
                    {e.state ? `, ${e.state}` : ""}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section
        aria-labelledby="rail-causes-heading"
        className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0E0A14]"
      >
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-4 w-4 text-plum-600" aria-hidden />
          <h2 id="rail-causes-heading" className="text-sm font-semibold text-ink dark:text-[#F4EFE3]">
            Saved causes
          </h2>
        </div>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-ink-muted">
            Sign in to sync causes from your profile.{" "}
            <Link href="/auth/sign-in" className="font-semibold text-plum-700 underline">
              Sign in
            </Link>
          </p>
        ) : null}
        <ul className="mt-3 flex flex-wrap gap-2">
          {causes.map((c) => (
            <li key={c.slug}>
              <span className="inline-flex min-h-[36px] items-center rounded-full bg-plum-50 px-3 text-xs font-semibold text-plum-900 dark:bg-white/10 dark:text-[#F4EFE3]">
                {c.title}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="rail-sources-heading"
        className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0E0A14]"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-plum-600" aria-hidden />
          <h2 id="rail-sources-heading" className="text-sm font-semibold text-ink dark:text-[#F4EFE3]">
            Sources
          </h2>
        </div>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-plum-800 underline-offset-4 hover:underline dark:text-chartreuse-200"
        >
          {sourceLabel}
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      </section>
    </div>
  );
}
