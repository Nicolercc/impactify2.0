"use server";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { fetchGuardianArticles, type GuardianArticle } from "@/lib/news/guardian-client";

const SECTION_TO_CAUSE: Record<string, string> = {
  environment: "climate-action",
  society: "affordable-housing",
  "us-news": "protect-democracy",
  education: "public-education",
  law: "civil-rights",
  world: "immigration-support",
  business: "local-economy",
};

function formatShortDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d");
  } catch {
    return "";
  }
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").trim();
}

function RelatedArticleCard({ article }: { article: GuardianArticle }) {
  const dek = article.fields?.trailText ? stripHtml(article.fields.trailText) : "";
  return (
    <Link
      href={article.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-plum-100 bg-parchment p-5 hover:border-plum-300 transition-colors"
    >
      <div className="font-sans text-eyebrow font-medium uppercase tracking-widest text-chartreuse-700">
        {article.sectionName}
      </div>
      <h4 className="mt-2 line-clamp-2 font-serif text-base text-plum-700 group-hover:text-plum-500 transition-colors">
        {article.webTitle}
      </h4>
      {dek ? (
        <div className="mt-3 line-clamp-2 font-sans text-caption text-ink-muted">
          {dek}
        </div>
      ) : null}
      <div className="mt-3 font-sans text-caption text-ink-muted">Read on The Guardian →</div>
    </Link>
  );
}

export async function RelatedEventsSection({ sectionId }: { sectionId: string }) {
  const causeSlug = SECTION_TO_CAUSE[sectionId] ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      slug,
      title,
      starts_at,
      city,
      state,
      category,
      is_virtual,
      cover_image_url,
      event_causes (
        causes ( slug )
      )
    `,
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(12);

  const rows = (error ? [] : (data ?? [])) as unknown as Array<{
    id: string;
    slug: string;
    title: string;
    starts_at: string;
    city: string | null;
    state: string | null;
    category: string | null;
    is_virtual: boolean;
    event_causes: Array<{ causes: { slug: string } | { slug: string }[] | null }> | null;
  }>;

  const filtered = causeSlug
    ? rows.filter((e) => {
        const slugs =
          (e.event_causes ?? []).flatMap((r) => {
            const c = r.causes;
            if (!c) return [];
            return Array.isArray(c) ? c.map((x) => x.slug) : [c.slug];
          }) ?? [];
        return slugs.includes(causeSlug);
      })
    : rows;

  const events = filtered.slice(0, 3);

  if (events.length > 0) {
    return (
      <section className="mt-16 border-t border-plum-100 pt-12">
        <div className="mb-8 flex items-center gap-3">
          <span className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted font-medium">
            Related events
          </span>
          <div className="flex-1 h-px bg-plum-100" />
          <Link href="/events" className="text-caption text-plum-700 hover:text-chartreuse-700">
            Browse all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group block rounded-xl border border-plum-100 bg-parchment p-5 hover:border-plum-300 transition-colors"
            >
              <div className="text-eyebrow uppercase tracking-widest text-chartreuse-700 font-sans font-medium">
                {event.category ?? "Event"}
              </div>
              <h4 className="mt-2 font-serif text-base text-plum-700 group-hover:text-plum-500 transition-colors line-clamp-2">
                {event.title}
              </h4>
              <div className="mt-3 text-caption text-ink-muted">
                {formatShortDate(event.starts_at)} ·{" "}
                {event.is_virtual ? "Virtual" : `${event.city ?? ""}${event.city && event.state ? ", " : ""}${event.state ?? ""}`.trim()}
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  const fallbackArticles = await fetchGuardianArticles({
    section: sectionId,
    pageSize: 3,
    page: 1,
  });

  if (!fallbackArticles.length) return null;

  return (
    <section className="mt-16 border-t border-plum-100 pt-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="font-sans text-eyebrow uppercase tracking-widest text-ink-muted font-medium">
          Related events
        </span>
        <div className="flex-1 h-px bg-plum-100" />
        <Link href="/news" className="text-caption text-plum-700 hover:text-chartreuse-700">
          More news →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {fallbackArticles.map((a) => (
          <RelatedArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

