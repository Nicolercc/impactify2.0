import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/og-image.jpg";

export type ArticleCardCause = { id: string; slug: string; title: string };

export type ArticleCardProps = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  publishedAt: string;
  sourceName: string | null;
  coverImageUrl: string | null;
  isEditorial: boolean;
  causes: ArticleCardCause[];
  featured?: boolean;
};

function formatPublished(iso: string) {
  try {
    return format(parseISO(iso), "MMM d");
  } catch {
    return "";
  }
}

export function ArticleCard({
  slug,
  title,
  dek,
  publishedAt,
  sourceName,
  coverImageUrl,
  isEditorial,
  causes,
  featured,
}: ArticleCardProps) {
  const cover = coverImageUrl?.trim() || PLACEHOLDER;
  const topCauses = causes.slice(0, 2);

  return (
    <Link
      href={`/news/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-parchment-100",
          featured ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[2/1]",
        )}
      >
        <Image
          src={cover}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes={featured ? "(min-width: 768px) 1200px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isEditorial ? (
            <span className="text-xs font-medium uppercase tracking-wide text-plum-700">Editorial</span>
          ) : (
            <span className="text-xs text-ink-muted">{sourceName ?? "News"}</span>
          )}
          <span className="text-xs text-ink-muted">· {formatPublished(publishedAt)}</span>
        </div>
        <h2
          className={cn(
            "font-serif font-medium leading-snug text-ink transition-colors group-hover:text-plum-700",
            featured ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          {title}
        </h2>
        {dek ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{dek}</p>
        ) : null}
        {topCauses.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {topCauses.map((c) => (
              <Badge
                key={c.id}
                variant="secondary"
                className="rounded-full bg-plum-50 text-xs font-normal text-plum-700"
              >
                {c.title}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
