import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowRight, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  slug: string;
  isVirtual?: boolean;
}

export function EventCard({
  title,
  date,
  location,
  imageUrl,
  category,
  slug,
  isVirtual = false,
}: EventCardProps) {
  return (
    <Card className="group relative overflow-hidden border-plum-100 bg-parchment transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lg hover:shadow-plum-500/10">
      <Link
        href={`/events/${slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View event: ${title}`}
      />

      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Event image for ${title}`}
          fill
          className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Category Badge */}
        <Badge
          className="absolute left-0 top-4 rounded-none rounded-br rounded-tr border-chartreuse-500 bg-plum-500 text-xs font-medium uppercase tracking-wide text-parchment"
          style={{ borderRadius: "0 4px 4px 0" }}
        >
          {category}
        </Badge>

        {/* Virtual Badge */}
        {isVirtual && (
          <Badge
            variant="secondary"
            className="absolute right-4 top-4 gap-1 bg-parchment/90 text-ink"
          >
            <Video className="h-3 w-3" />
            Virtual
          </Badge>
        )}

        {/* Date Chip */}
        <div className="absolute bottom-4 left-4 rounded-md bg-parchment/95 px-3 py-1.5 text-sm font-medium text-plum-700 shadow-sm backdrop-blur-sm">
          {date}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-serif text-lg font-medium text-ink transition-colors group-hover:text-plum-700">
          {title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-chartreuse-700 transition-colors group-hover:text-plum-500">
          <span>RSVP</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden border-plum-100 bg-parchment">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-4 h-4 w-20" />
      </CardContent>
    </Card>
  );
}
