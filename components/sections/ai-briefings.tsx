"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Section } from "@/components/layout/section";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const titleClass =
  "font-serif text-[3.5rem] md:text-[5rem] leading-[0.95] tracking-[-0.035em] text-parchment max-w-[16ch]";

const SUMMARY_LINES = [
  "NYC's rent stabilization bill would cap annual increases at 2% for 1 million apartments.",
  "The city council votes Thursday. Tenant groups organized rallies in all five boroughs.",
  "This is one of the most contested housing policies in the country right now.",
];

const PERSPECTIVES = [
  {
    label: "Tenant advocates",
    color: "#D85A30",
    text: "Stabilization is the last protection against displacement for 1M+ households earning under median income.",
  },
  {
    label: "Property owners",
    color: "#378ADD",
    text: "Maintenance costs rose 34% since 2020. Without rent adjustments, buildings deteriorate.",
  },
  {
    label: "Policy analysts",
    color: "#1D9E75",
    text: "Neither side addresses supply. NYC needs 560K new units by 2030.",
  },
] as const;

const ACTIONS = ["Attend town hall", "Call your rep", "Volunteer nearby", "Share briefing"] as const;

function BriefingDemo() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [showPerspectives, setShowPerspectives] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const hasAnimated = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function startAnimation() {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    setIsStreaming(true);

    SUMMARY_LINES.forEach((line, i) => {
      window.setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
      }, 600 + i * 700);
    });

    window.setTimeout(() => {
      setShowPerspectives(true);
    }, 600 + SUMMARY_LINES.length * 700 + 500);

    window.setTimeout(() => {
      setShowActions(true);
      setIsStreaming(false);
    }, 600 + SUMMARY_LINES.length * 700 + 500 + 600);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideIn2 {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ── MOCK ARTICLE CARD (background layer) ── */}
      <div className="relative overflow-hidden rounded-xl bg-parchment shadow-2xl transition-transform duration-500 hover:rotate-0 -rotate-2">
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-chartreuse-500 px-2.5 py-0.5 font-sans text-[0.6rem] font-bold uppercase tracking-widest text-ink">
              Housing
            </span>
            <span className="font-sans text-[0.65rem] text-ink-muted">The Guardian · 6 min read</span>
          </div>
          <h3 className="mt-3 max-w-[28ch] font-serif text-[1.1rem] font-semibold leading-[1.25] text-plum-700">
            NYC rent stabilization bill heads to final vote
          </h3>
        </div>

        <div className="space-y-2 px-6 pb-6 pt-4">
          <div className="h-[7px] w-full rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-[94%] rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-full rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-[88%] rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-[91%] rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-full rounded-full bg-ink/[0.07]" />
          <div className="h-[7px] w-[85%] rounded-full bg-ink/[0.07]" />
        </div>
      </div>

      {/* ── AI BRIEFING PANEL (floating overlay) ── */}
      <div
        className="absolute -right-2 top-8 z-10 w-[240px] overflow-hidden rounded-xl border border-plum-100 bg-parchment shadow-[0_20px_60px_rgba(74,19,71,0.18)] sm:w-[280px] md:-right-6 md:w-[320px]"
        style={{ transform: "rotate(1deg)" }}
      >
        <div className="border-b border-plum-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chartreuse-500">
              <Sparkles className="h-3 w-3 text-ink" aria-hidden />
            </span>
            <span className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.1em] text-plum-700">
              AI Briefing
            </span>
          </div>
          <p className="mt-1 font-sans text-[0.6rem] text-ink-muted">Powered by Claude · Streaming</p>
        </div>

        <div className="px-5 py-4">
          {visibleLines.map((line, i) => (
            <p
              key={i}
              className="mb-2 font-sans text-[0.7rem] leading-[1.6] text-ink-muted"
              style={{
                animation: "fadeSlideIn 0.3s ease forwards",
                animationDelay: `${i * 80}ms`,
                animationFillMode: "backwards",
                opacity: 0,
              }}
            >
              {line}
            </p>
          ))}

          {showPerspectives ? (
            <div className="mt-3 space-y-2">
              {PERSPECTIVES.map((p, i) => (
                <div
                  key={p.label}
                  className="rounded-lg border border-plum-100/60 p-3"
                  style={{
                    animation: "fadeSlideIn2 0.4s ease forwards",
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: "backwards",
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span
                      className="font-sans text-[0.6rem] font-bold uppercase tracking-[0.08em]"
                      style={{ color: p.color }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-[0.6rem] leading-[1.5] text-ink-muted">{p.text}</p>
                </div>
              ))}
            </div>
          ) : null}

          {showActions ? (
            <div
              className="mt-3 flex flex-wrap gap-1.5"
              style={{
                animation: "fadeSlideIn2 0.3s ease forwards",
                animationFillMode: "backwards",
                opacity: 0,
              }}
            >
              {ACTIONS.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-plum-200 px-2.5 py-1 font-sans text-[0.55rem] font-medium text-plum-700"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}

          {isStreaming ? (
            <span className="inline-block h-3 w-[2px] bg-chartreuse-500 animate-pulse" aria-hidden />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AIBriefings() {
  return (
    <Section tone="plum-deep" fullBleed className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-[-80px] top-[-80px] select-none font-serif text-[clamp(16rem,28vw,32rem)] font-bold leading-none tracking-tighter text-plum-300/[0.11]"
        aria-hidden
      >
        CONTEXT
      </div>
      <GrainOverlay />
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-block lg:grid-cols-2">
          <ScrollReveal>
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col gap-3">
                <EyebrowBadge tone="chartreuse">AI-Powered Clarity</EyebrowBadge>
                <h2 className={titleClass}>
                  <em className="font-serif italic text-chartreuse-500">Clarity</em>,{" "}not just coverage.
                </h2>
              </div>
              <p className="max-w-[52ch] text-[1.25rem] leading-relaxed text-parchment/70 md:text-[1.25rem]">
                Every article ships with a structured AI briefing — multiple perspectives, key stakeholders, what&apos;s uncertain,
                and what you can actually do. Not a summary. A clarity report.
              </p>
              <div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 rounded-full border border-parchment/30 px-5 py-2.5 font-sans text-sm font-medium text-parchment transition-all hover:border-chartreuse-500 hover:text-chartreuse-500"
                >
                  Try it on a real article
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.1}>
            <BriefingDemo />
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
