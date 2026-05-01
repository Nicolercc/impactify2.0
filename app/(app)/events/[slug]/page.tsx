import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RsvpWidget } from "@/components/events/rsvp-widget";
import { ShareLinkButton } from "@/components/events/share-link-button";
import { RelatedCoverageSection } from "@/components/events/related-coverage";
import {
  fetchUserRsvpStatus,
  getEventMetaBySlug,
  resolveEventForRequest,
  type EventDetailRow,
} from "@/lib/events/queries";
import { getSession } from "@/lib/supabase/get-session";

const PLACEHOLDER = "/og-image.jpg";

function normalizeOrganizer(event: EventDetailRow) {
  const o = event.organizer;
  if (!o) return null;
  return Array.isArray(o) ? o[0] ?? null : o;
}

function formatRange(event: EventDetailRow) {
  try {
    const start = format(parseISO(event.starts_at), "EEE, MMM d · h:mm a");
    if (event.ends_at) {
      const end = format(parseISO(event.ends_at), "h:mm a");
      return `${start} – ${end}`;
    }
    return start;
  } catch {
    return "Schedule TBA";
  }
}

function absoluteMediaUrl(url: string | null) {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return url;
  return new URL(url, base).toString();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getEventMetaBySlug(slug);
  if (!meta) return { title: "Event | Impactify" };
  const title = `${meta.title} | Impactify`;
  const ogImage = absoluteMediaUrl(meta.cover_image_url);
  return {
    title,
    description: meta.description?.slice(0, 155) ?? undefined,
    openGraph: {
      title: meta.title,
      description: meta.description ?? undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await resolveEventForRequest(slug);
  const session = await getSession();
  const rsvpStatus = await fetchUserRsvpStatus(event.id);
  const organizer = normalizeOrganizer(event);

  const causes = (event.event_causes ?? []).flatMap((r) => {
    const c = r.causes;
    if (!c) return [];
    return Array.isArray(c) ? c : [c];
  });

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const shareUrl = `${baseUrl || ""}/events/${event.slug}`;

  const cover = event.cover_image_url?.trim() || PLACEHOLDER;
  const capacity = event.capacity ?? null;
  const attending = event.attendee_count ?? 0;
  const pct =
    capacity && capacity > 0 ? Math.min(100, Math.round((attending / capacity) * 100)) : 0;

  const locationLine = event.is_virtual
    ? "Virtual event"
    : [event.city, event.state].filter(Boolean).join(", ") || "Location TBA";

  const fullAddress = event.is_virtual
    ? event.virtual_url ?? "Virtual event"
    : [event.venue_name, event.address, event.city, event.state].filter(Boolean).join(", ") ||
      "Address TBA";

  return (
    <article className="mx-auto max-w-[1152px] px-6 pb-24 pt-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-2 rounded-sm font-sans text-caption text-ink-muted hover:text-plum-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to events
      </Link>

      <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl bg-parchment-100">
        <Image src={cover} alt={event.title} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute left-0 top-6 rounded-r-full bg-chartreuse-500 px-5 py-2 font-sans text-eyebrow font-bold uppercase tracking-widest text-ink">
          {event.category?.replace(/_/g, " ") ?? "Event"}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {causes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {causes.map((c) => (
                <Badge key={c.id} className="rounded-full bg-chartreuse-100 px-3 py-1 text-xs font-medium text-ink">
                  {c.title}
                </Badge>
              ))}
            </div>
          ) : null}

          <h1 className="mt-4 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.025em] text-plum-700 md:text-[3.5rem]">
            {event.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-sm text-ink-muted">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-plum-700" aria-hidden />
              {formatRange(event)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-plum-700" aria-hidden />
              {locationLine}
            </span>
            {organizer ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-plum-700" aria-hidden />
                {organizer.display_name ?? organizer.username}
              </span>
            ) : null}
          </div>

          <div className="mt-8 space-y-4">
            <p className="whitespace-pre-wrap text-[1.0625rem] leading-[1.75] text-ink">
              {event.description?.trim() || "No description has been added for this event yet."}
            </p>
          </div>

          <RelatedCoverageSection causeSlug={causes[0]?.slug} eventTitle={event.title} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-plum-100 bg-parchment p-6">
            <h2 className="font-serif text-xl text-plum-700">Attend this event</h2>
            <div className="mt-4 space-y-3 text-sm text-ink-muted">
              <div>📅 {formatRange(event)}</div>
              <div>📍 {fullAddress}</div>
            </div>

            <div className="mt-6">
              <RsvpWidget
                eventId={event.id}
                eventTitle={event.title}
                initialStatus={rsvpStatus}
                isSignedIn={Boolean(session)}
              />
            </div>

            <p className="mt-3 text-center text-xs text-ink-muted">
              {/* TODO: restore attendee count when RSVP table is wired */}
            </p>

            {capacity ? (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs text-ink-muted">
                  <span>Capacity</span>
                  <span>
                    {attending} / {capacity}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="h-2 bg-plum-100 [&>[data-slot=progress-indicator]]:bg-chartreuse-500"
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-plum-100 bg-plum-50 p-6">
            <h3 className="font-sans text-eyebrow font-medium uppercase tracking-widest text-ink-muted">
              Share this event
            </h3>
            <div className="mt-4 flex gap-3">
              <ShareLinkButton url={shareUrl} />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
