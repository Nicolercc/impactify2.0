"use server";

import Image from "next/image";
import Link from "next/link";
import { fetchGuardianArticles, type GuardianArticle } from "@/lib/news/guardian-client";
import { CAUSE_TO_GUARDIAN } from "@/lib/news/cause-to-guardian";

export async function RelatedCoverageSection({
  causeSlug,
  eventTitle,
}: {
  causeSlug?: string;
  eventTitle: string;
}) {
  const mapped = (causeSlug && CAUSE_TO_GUARDIAN[causeSlug]) || null;
  const titleWords = eventTitle.trim().split(/\s+/).filter(Boolean).slice(0, 3).join(" ");

  const articles = await fetchGuardianArticles({
    section: mapped?.section,
    tag: mapped?.tag,
    q: mapped?.q ?? (mapped ? undefined : titleWords || undefined),
    pageSize: 3,
    page: 1,
  });

  if (!articles.length) return null;

  return (
    <section className="mt-16 border-t border-plum-100 pt-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="font-sans text-eyebrow font-medium uppercase tracking-widest text-ink-muted">
          Related coverage
        </span>
        <div className="h-px flex-1 bg-plum-100" />
        <Link href="/news" className="font-sans text-caption text-plum-700 hover:text-chartreuse-700">
          More news →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <RelatedArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").trim();
}

function RelatedArticleCard({ article }: { article: GuardianArticle }) {
  const cover = article.fields?.thumbnail || "/og-image.jpg";
  const dek = article.fields?.trailText ? stripHtml(article.fields.trailText) : "";

  return (
    <Link
      href={article.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-plum-100 bg-parchment"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-parchment-100">
        <Image src={cover} alt="" fill className="object-cover" sizes="(min-width: 768px) 320px, 100vw" />
      </div>
      <div className="p-5">
        <span className="inline-flex items-center rounded-full bg-chartreuse-500 px-3 py-1 font-sans text-eyebrow font-medium uppercase tracking-widest text-ink">
          {article.sectionName}
        </span>
        <h3 className="mt-4 line-clamp-2 font-serif text-lg text-plum-700">{article.webTitle}</h3>
        {dek ? (
          <p className="mt-2 line-clamp-2 font-sans text-caption text-ink-muted">
            {dek}
          </p>
        ) : null}
        <p className="mt-4 font-sans text-caption text-plum-700 group-hover:text-chartreuse-700">
          Read on The Guardian →
        </p>
      </div>
    </Link>
  );
}

