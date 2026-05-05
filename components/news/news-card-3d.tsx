"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type NewsTopic =
  | "housing"
  | "climate"
  | "immigration"
  | "justice"
  | "voting"
  | "labor"
  | "tech"
  | "other";

export type NewsTag = {
  id: string;
  label: string;
  topic: NewsTopic;
};

export interface NewsCard3DProps {
  href: string;
  headline: string;
  publication: string;
  publishedLabel: string; // e.g. "2h ago"
  readTimeLabel: string; // e.g. "8 min read"
  issueTags: NewsTag[];
  imageUrl?: string | null;
  imageAlt: string;
}

const FALLBACK_IMAGE = "/images/fallback-cover.svg";

function topicTagClass(topic: NewsTopic): string {
  // Pastels by topic (semi-transparent bg), tuned for navy surfaces.
  switch (topic) {
    case "housing":
    case "climate":
      return "bg-[#a8c9a8]/25 text-[#dff0df] border-[#a8c9a8]/35";
    case "immigration":
    case "justice":
      return "bg-[#e8a8a0]/25 text-[#ffe8e5] border-[#e8a8a0]/35";
    case "voting":
      return "bg-[#c8b8e8]/25 text-[#f1ebff] border-[#c8b8e8]/35";
    case "labor":
      return "bg-[#d4c8a0]/25 text-[#fff7df] border-[#d4c8a0]/35";
    case "tech":
      return "bg-[#a8d4e8]/25 text-[#e9f8ff] border-[#a8d4e8]/35";
    default:
      return "bg-white/10 text-white/90 border-white/15";
  }
}

function use3dEnabled() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }

    const mqHover = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    const mqWidth = window.matchMedia?.("(min-width: 768px)");

    const compute = () => {
      const canHover = mqHover?.matches ?? false;
      const wideEnough = mqWidth?.matches ?? false;
      setEnabled(canHover && wideEnough);
    };

    compute();
    mqHover?.addEventListener?.("change", compute);
    mqWidth?.addEventListener?.("change", compute);
    return () => {
      mqHover?.removeEventListener?.("change", compute);
      mqWidth?.removeEventListener?.("change", compute);
    };
  }, [reducedMotion]);

  return enabled;
}

export const newsCard3DVariants = {
  rest: { scale: 1, boxShadow: "0 12px 34px rgba(0,0,0,0.28)" },
  hover: { scale: 1.01, boxShadow: "0 18px 54px rgba(0,0,0,0.38)" },
} as const;

export function NewsCard3D(props: NewsCard3DProps) {
  const {
    href,
    headline,
    publication,
    publishedLabel,
    readTimeLabel,
    issueTags,
    imageUrl,
    imageAlt,
  } = props;

  const tags = useMemo(() => issueTags.filter(Boolean), [issueTags]);
  const topTags = tags.slice(0, 2);
  const extraCount = Math.max(0, tags.length - topTags.length);

  const imgSrc = (imageUrl?.trim() ? imageUrl.trim() : FALLBACK_IMAGE) as string;

  const enable3d = use3dEnabled();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring keeps 60fps while avoiding jank on rapid pointer updates.
  const sx = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.7 });
  const sy = useSpring(my, { stiffness: 260, damping: 28, mass: 0.7 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const imgZ = useTransform(sx, [-0.5, 0.5], [16, 26]);

  function onPointerMove(e: React.PointerEvent) {
    if (!enable3d) return;
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px);
    my.set(py);
  }

  function onPointerLeave() {
    if (!enable3d) return;
    mx.set(0);
    my.set(0);
  }

  return (
    <Link
      href={href}
      className={cn(
        "group block",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8d4e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1b2a]",
      )}
      aria-label={headline}
    >
      <motion.article
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10",
          "bg-[#132d47]",
        )}
        variants={newsCard3DVariants}
        initial="rest"
        whileHover="hover"
        animate="rest"
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "linear-gradient(180deg, rgba(19,45,71,0.98) 0%, rgba(19,45,71,0.92) 100%)",
        }}
      >
        <motion.div
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="relative aspect-16/10 overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            perspective: 900,
            rotateX: enable3d ? rotateX : 0,
            rotateY: enable3d ? rotateY : 0,
          }}
          data-testid="news-card-3d-surface"
        >
          <motion.div
            className="absolute inset-0"
            style={{
              translateZ: enable3d ? imgZ : 0,
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src={imgSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 92vw, (max-width: 1280px) 48vw, 25vw"
              className="object-cover"
              loading="lazy"
            />
            {/* Navy overlay for consistent contrast */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0d1b2a]/75 via-[#0d1b2a]/15 to-transparent" aria-hidden />
          </motion.div>

          {/* Issue tags */}
          <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
            {topTags.map((t) => (
              <span
                key={t.id}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1",
                  "font-mono text-[10px] font-semibold tracking-[0.16em]",
                  topicTagClass(t.topic),
                )}
              >
                {t.label.toUpperCase()}
              </span>
            ))}
            {extraCount > 0 ? (
              <span
                className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-white/90"
                aria-label={`${extraCount} more tags`}
              >
                +{extraCount}
              </span>
            ) : null}
          </div>
        </motion.div>

        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2 font-sans text-[12px] text-white/70">
            <span className="text-white/75">{publication}</span>
            <span className="text-white/30">·</span>
            <time className="text-white/70">{publishedLabel}</time>
            <span className="text-white/30">·</span>
            <span className="text-white/70">{readTimeLabel}</span>
          </div>

          <h3 className="font-serif text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-[#f0f0f0]">
            <span className="line-clamp-3">{headline}</span>
          </h3>

          <div className="pt-1 font-sans text-sm font-medium text-white/85">
            <span className="inline-flex items-center gap-2">
              Open briefing <span aria-hidden>→</span>
            </span>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100",
          )}
          style={{
            boxShadow: "0 0 0 1px rgba(168, 212, 232, 0.18) inset, 0 0 80px rgba(168, 212, 232, 0.12)",
          }}
          aria-hidden
        />
      </motion.article>
    </Link>
  );
}

