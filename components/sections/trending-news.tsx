"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuardianArticle } from "@/lib/news/queries";

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "").trim();
}

function formatTimeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function estimateReadMinutes(bodyText: string | undefined) {
  const text = (bodyText ?? "").trim();
  if (!text) return 4;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.min(12, Math.round(words / 220)));
}

function shimmerDataUrl(w: number, h: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g">
      <stop stop-color="rgba(74,31,79,0.20)" offset="0%"/>
      <stop stop-color="rgba(74,31,79,0.36)" offset="50%"/>
      <stop stop-color="rgba(74,31,79,0.20)" offset="100%"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="rgba(74,31,79,0.18)"/>
  <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function Card({ article, visible, index }: { article: GuardianArticle; visible: boolean; index: number }) {
  const href = `/article/${encodeURIComponent(article.id)}?mode=clarity`;
  const section = (article.sectionName?.trim() || "News").toUpperCase();
  const trail = stripHtml(article.fields?.trailText ?? "");
  const thumb = article.fields?.thumbnail?.trim() || "/images/fallback-cover.svg";
  const readMin = estimateReadMinutes(article.fields?.bodyText);

  return (
    <Link
      href={href}
      className={cn(
        "group block",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-background",
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(20px)",
        transitionProperty: "opacity, transform",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${index * 100}ms`,
        willChange: "transform, opacity",
      }}
    >
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-plum-100/70 bg-parchment shadow-sm",
          "transition-[transform,box-shadow,border-color] duration-200 ease-out",
          "md:group-hover:-translate-y-1 md:group-hover:shadow-[0_24px_70px_rgba(74,19,71,0.14)] md:group-hover:border-plum-300/80",
          "dark:border-[rgba(244,239,227,0.10)] dark:bg-[#2b1a35] dark:md:group-hover:border-[rgba(244,239,227,0.16)] dark:md:group-hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className="relative aspect-16/10 overflow-hidden bg-[linear-gradient(135deg,var(--plum-700),var(--plum-900))]">
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 768px) 70vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL={shimmerDataUrl(32, 20)}
          />
          <div className="absolute inset-0 bg-linear-to-t from-plum-900/45 via-transparent to-transparent" aria-hidden />

          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-plum-700/95 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-parchment">
            {section}
          </span>

          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-chartreuse-500 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] text-primary-foreground">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            VERIFIED
          </span>
        </div>

        <div className="flex h-full flex-col p-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-ink-muted dark:text-[#9d8f7f]">
            <span className="font-semibold text-ink dark:text-foreground">{article.fields?.byline ? "The Guardian" : "The Guardian"}</span>
            <span className="text-plum-300 dark:text-white/20">·</span>
            <span>{formatTimeAgo(article.webPublicationDate)}</span>
            <span className="text-plum-300 dark:text-white/20">·</span>
            <span>{readMin} min read</span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-serif text-[1.05rem] font-semibold leading-tight tracking-[-0.01em] text-plum-700 transition-colors duration-200 group-hover:text-plum-500 dark:text-[#F4EFE3] dark:group-hover:text-chartreuse-500">
            {article.webTitle}
          </h3>

          <p className="mt-2 line-clamp-2 font-sans text-[0.875rem] leading-[1.55] text-ink-muted dark:text-[#d4c9bc]">
            {trail || "\u00a0"}
          </p>

          <div className="mt-4 pt-2">
            <span className="inline-flex items-center gap-2 font-sans text-sm font-medium text-plum-700 transition-colors duration-200 group-hover:text-chartreuse-700 dark:text-chartreuse-500">
              Read briefing <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function TrendingNews({ articles }: { articles: GuardianArticle[] }) {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  const trending = useMemo(() => articles.slice(0, 12), [articles]);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const any = entries.some((e) => e.isIntersecting);
        if (any) setVisible(true);
      },
      { root: null, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  function scrollStep(dir: "left" | "right") {
    const root = railRef.current;
    if (!root) return;
    const first = root.querySelector<HTMLElement>("[data-briefing-card]");
    const step = (first?.offsetWidth ?? 320) + 24;
    root.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  return (
    <section ref={rootRef} id="news" className="bg-parchment py-16 md:py-20 dark:bg-[#1a0618]">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-ink-muted dark:text-[#9d8f7f]">
            THE BRIEFING
          </p>
          <h2 className="mt-4 font-serif text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-plum-700 dark:text-[#F4EFE3] md:text-[44px] lg:text-[52px]">
            Understand first,{" "}
            <em className="font-serif italic text-plum-500 dark:text-[#e8a87c]">then act.</em>
          </h2>
          <p className="mt-4 font-dm-sans-stack text-[1.0625rem] leading-[1.6] text-ink-muted dark:text-[#d4c9bc] md:text-[1.125rem]">
            Real stories, real context, powered by AI. Every article includes a
            structured clarity report — perspectives, stakeholders, and what you
            can actually do.
          </p>
        </div>

        {/* Desktop: single-row trending rail */}
        <div className="relative mt-10 hidden md:block">
          <button
            type="button"
            onClick={() => scrollStep("left")}
            className={cn(
              "absolute left-0 top-1/2 z-10 -translate-y-1/2",
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              "bg-white/90 text-plum-700 shadow-sm backdrop-blur transition-colors hover:bg-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
              "dark:border-white/10 dark:bg-[#0E0A14]/80 dark:text-white dark:hover:bg-[#0E0A14]",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
            aria-label="Scroll trending left"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollStep("right")}
            className={cn(
              "absolute right-0 top-1/2 z-10 -translate-y-1/2",
              "inline-flex h-10 w-10 items-center justify-center rounded-full border",
              "bg-white/90 text-plum-700 shadow-sm backdrop-blur transition-colors hover:bg-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
              "dark:border-white/10 dark:bg-[#0E0A14]/80 dark:text-white dark:hover:bg-[#0E0A14]",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
            aria-label="Scroll trending right"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div
            ref={railRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-12 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {trending.map((a, idx) => (
              <div
                key={a.id}
                data-briefing-card
                className={cn(
                  "shrink-0 snap-start",
                  "w-[min(78vw,360px)]",
                  "md:w-[calc((100%-1.5rem)/2)]",
                  "lg:w-[calc((100%-3rem)/3)]",
                  "xl:w-[calc((100%-4.5rem)/4)]",
                )}
              >
                <Card
                  article={a}
                  visible={visible}
                  index={reducedMotion ? 0 : idx}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="mt-10 md:hidden">
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trending.slice(0, 10).map((a, idx) => (
              <div key={a.id} className="w-[min(78vw,320px)] shrink-0 snap-start">
                <Card article={a} visible={visible} index={reducedMotion ? 0 : idx} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-plum-700 px-6 py-3 font-sans text-sm font-medium text-plum-700 transition-colors hover:bg-plum-700 hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:border-[rgba(244,239,227,0.2)] dark:text-[#F4EFE3] dark:hover:bg-white/5 dark:hover:text-[#F4EFE3] dark:focus-visible:ring-offset-background"
          >
            Explore the briefing <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

