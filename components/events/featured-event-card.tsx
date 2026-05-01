import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MapPin } from "lucide-react";
import type { PublishedEventListItem } from "@/lib/events/queries";

function flattenCause(
  c:
    | { id: string; slug: string; title: string }
    | { id: string; slug: string; title: string }[]
    | null
    | undefined,
): { slug: string; title: string }[] {
  if (!c) return [];
  return Array.isArray(c) ? c : [c];
}

function whenLine(iso: string) {
  try {
    return format(parseISO(iso), "EEEE, MMM d · h:mm a");
  } catch {
    return "Date TBA";
  }
}

function locationLine(event: PublishedEventListItem) {
  if (event.is_virtual) return "Virtual";
  if (event.city && event.state) return `${event.city}, ${event.state}`;
  if (event.city) return event.city;
  if (event.state) return event.state;
  return "Location TBA";
}

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1600&q=80";

export function FeaturedEventCard({ event }: { event: PublishedEventListItem }) {
  const causes = (event.event_causes ?? []).flatMap((row) => flattenCause(row.causes));
  const category = event.category?.replace(/_/g, " ") || causes[0]?.title || "Featured";
  const imageSrc = event.cover_image_url?.trim() || FALLBACK_COVER;
  const dek =
    event.description?.slice(0, 140) ||
    "A curated pick from organizers in your region — RSVP early, bring a friend, make the room count.";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group mb-8 block overflow-hidden rounded-2xl border border-plum-100/60 bg-parchment shadow-sm transition-all hover:shadow-lg hover:border-plum-300/50"
    >
      <article className="grid grid-cols-1 lg:grid-cols-3">
        <div className="relative aspect-[4/3] min-h-[240px] lg:col-span-2 lg:aspect-auto lg:min-h-[320px]">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>
        <div className="flex flex-col justify-center p-8 lg:col-span-1">
          <div className="font-sans text-eyebrow uppercase tracking-widest text-chartreuse-700">
            {category}
          </div>
          <div className="mt-2 font-sans text-sm text-ink-muted">{whenLine(event.starts_at)}</div>
          <h2 className="mt-3 max-w-[20ch] font-serif text-[1.75rem] leading-[1.1] text-plum-700">
            {event.title}
          </h2>
          <p className="mt-3 line-clamp-3 font-serif text-[1.0625rem] italic text-ink-muted">
            {dek}
          </p>
          <div className="mt-4 flex items-center gap-2 font-sans text-caption text-ink-muted">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            <span>{locationLine(event)}</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-plum-700 group-hover:text-chartreuse-700">
            View event →
          </span>
        </div>
      </article>
    </Link>
  );
}
