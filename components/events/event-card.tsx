import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export { EventCardSkeleton } from "@/components/events/event-card-skeleton";

const PLACEHOLDER_IMAGE = "/images/fallback-cover.svg";

export type EventCardData = {
  title: string;
  slug: string;
  startsAt: string;
  city: string | null;
  state: string | null;
  isVirtual: boolean;
  coverImageUrl: string | null;
  category: string | null;
  causes: { title: string; slug: string }[];
};

function monthShort(iso: string) {
  try {
    return format(parseISO(iso), "MMM").toUpperCase();
  } catch {
    return "—";
  }
}

function formatDay(iso: string) {
  try {
    return format(parseISO(iso), "d");
  } catch {
    return "—";
  }
}

function locationLine(data: EventCardData) {
  if (data.isVirtual) return "Virtual";
  if (data.city && data.state) return `${data.city}, ${data.state}`;
  if (data.city) return data.city;
  if (data.state) return data.state;
  return "Location TBA";
}

export function EventCard(data: EventCardData) {
  const location = locationLine(data);
  const imageSrc = data.coverImageUrl?.trim() || PLACEHOLDER_IMAGE;
  const categoryLabel =
    data.category?.replace(/_/g, " ") || data.causes[0]?.title || "Event";

  return (
    <Link href={`/events/${data.slug}`} className="group block">
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-plum-100 bg-parchment",
          "transition-all hover:-translate-y-0.5 hover:border-plum-200 hover:shadow-md",
        )}
      >
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={imageSrc}
            alt={data.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute left-0 top-3 rounded-r-full bg-plum-700 px-3 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-widest text-parchment shadow-sm">
            {categoryLabel}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0 text-center">
              <div className="font-sans text-eyebrow font-semibold uppercase tracking-widest text-chartreuse-700">
                {monthShort(data.startsAt)}
              </div>
              <div className="font-serif text-[1.75rem] font-medium leading-none text-plum-700">
                {formatDay(data.startsAt)}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 font-serif text-[1.0625rem] leading-[1.3] text-plum-700 transition-colors group-hover:text-plum-500">
                {data.title}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 font-sans text-caption text-ink-muted">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{location}</span>
              </div>
            </div>
          </div>

          {data.causes.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {data.causes.slice(0, 2).map((c) => (
                <span
                  key={c.slug}
                  className="font-sans text-[0.6875rem] uppercase tracking-widest text-ink-muted"
                >
                  {c.title}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between border-t border-plum-100/60 pt-4 font-sans text-caption">
            {/* TODO: restore when RSVP table is wired — see schema/rsvps */}
            <span className="inline-flex items-center gap-1 font-medium text-plum-700 transition-colors group-hover:text-chartreuse-700">
              Details
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
