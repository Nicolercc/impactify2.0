"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { EventCard, type EventCardData } from "@/components/events/event-card";
import { FeaturedEventCard } from "@/components/events/featured-event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAUSES } from "@/lib/constants/categories";
import type { PublishedEventListItem } from "@/lib/events/queries";
import { cn } from "@/lib/utils";

function flattenCause(
  c:
    | { id: string; slug: string; title: string }
    | { id: string; slug: string; title: string }[]
    | null
    | undefined,
): { id: string; slug: string; title: string }[] {
  if (!c) return [];
  return Array.isArray(c) ? c : [c];
}

function toCardData(e: PublishedEventListItem): EventCardData {
  const causes = (e.event_causes ?? []).flatMap((row) => flattenCause(row.causes)).map((c) => ({
    title: c.title,
    slug: c.slug,
  }));

  return {
    title: e.title,
    slug: e.slug,
    startsAt: e.starts_at,
    city: e.city,
    state: e.state,
    isVirtual: e.is_virtual,
    coverImageUrl: e.cover_image_url,
    category: e.category,
    causes,
  };
}

type CauseFilter = "all" | string;
type FormatFilter = "all" | "virtual" | "in_person";

export function EventsDiscovery({ events }: { events: PublishedEventListItem[] }) {
  const [cause, setCause] = useState<CauseFilter>("all");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter((e) => {
      if (cause !== "all") {
        const slugs = (e.event_causes ?? []).flatMap((r) => flattenCause(r.causes)).map((c) => c.slug);
        if (!slugs.includes(cause)) return false;
      }
      if (format === "virtual" && !e.is_virtual) return false;
      if (format === "in_person" && e.is_virtual) return false;
      if (needle) {
        const hay = `${e.title} ${e.description ?? ""} ${e.city ?? ""} ${e.state ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [events, cause, format, q]);

  const featured = filtered.length > 1 ? filtered[0] : null;
  const rest = filtered.length > 1 ? filtered.slice(1) : filtered;
  const cards = rest.map(toCardData);

  function clearFilters() {
    setCause("all");
    setFormat("all");
    setQ("");
  }

  return (
    <div className="mx-auto max-w-[1152px] px-6 md:px-12 lg:px-16">
      {/* TODO: location-aware filtering — add slim strip when
          geolocation hook is wired */}

      <div className="mb-8 space-y-3 pt-2">
        <div role="toolbar" aria-label="Filter by cause" className="flex flex-wrap gap-2 pb-1">
          <button
            type="button"
            aria-pressed={cause === "all"}
            onClick={() => setCause("all")}
            className={cn(
              "rounded-full px-4 py-2 font-sans text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
              cause === "all"
                ? "bg-plum-700 text-parchment"
                : "border border-plum-200 bg-transparent text-ink hover:bg-plum-50 hover:border-plum-300 transition-colors",
            )}
          >
            All causes
          </button>
          {CAUSES.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={cause === c.slug}
              onClick={() => setCause(c.slug)}
              className={cn(
                "rounded-full px-4 py-2 font-sans text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
                cause === c.slug
                  ? "bg-plum-700 text-parchment"
                  : "border border-plum-200 bg-transparent text-ink hover:bg-plum-50 hover:border-plum-300 transition-colors",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <span className="sr-only">Event format</span>
            {(
              [
                { id: "all" as const, label: "All formats" },
                { id: "virtual" as const, label: "Virtual" },
                { id: "in_person" as const, label: "In person" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={format === opt.id}
                onClick={() => setFormat(opt.id)}
                className={cn(
                  "rounded-full border border-plum-200 bg-transparent px-4 py-2 font-sans text-sm font-medium text-ink hover:bg-plum-50 hover:border-plum-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500",
                  format === opt.id
                    ? "bg-plum-700 text-parchment border-plum-700 hover:bg-plum-700"
                    : "",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Label htmlFor="events-search" className="sr-only">
              Search events
            </Label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <Input
              id="events-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or location"
              className="h-11 pl-10"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="font-serif text-[1.5rem] text-plum-700">No events found.</div>
          <p className="mt-3 text-sm text-ink-muted">Try clearing your filters or check back soon.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-full bg-chartreuse-500 px-6 py-3 font-medium text-ink hover:bg-chartreuse-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {featured ? <FeaturedEventCard event={featured} /> : null}
          <h2 className="mb-6 mt-10 font-serif text-[1.5rem] tracking-[-0.02em] text-plum-700">
            Upcoming events
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <EventCard key={c.slug} {...c} />
            ))}
          </div>
        </>
      )}

      <div className="mt-16 border-t border-plum-100 pt-8 text-center">
        <p className="text-sm text-ink-muted">
          Organizing a civic event?{" "}
          <Link
            href="/events/new"
            className="font-medium text-plum-700 underline-offset-4 hover:underline"
          >
            Create an event →
          </Link>
        </p>
      </div>
    </div>
  );
}
