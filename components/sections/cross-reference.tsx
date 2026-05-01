"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Newspaper, Calendar, Users, Heart } from "lucide-react";
import { Section } from "@/components/layout/section";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { UnderlineFlourish } from "@/components/decorative/underline-flourish";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

const bullets = [
  "Articles, events, reps, and donations linked by cause.",
  "One scroll from outrage to RSVP.",
  "Built for readers who want receipts, not rabbit holes.",
  "Editorial clarity — without the silos.",
];

const linePaths = [
  "M200 200 L118 118",
  "M200 200 L282 118",
  "M200 200 L118 282",
  "M200 200 L282 282",
];

const titleClass =
  "font-serif text-[3.5rem] md:text-[5rem] leading-[0.95] tracking-[-0.035em] text-plum-700 max-w-[16ch]";
const leadClass =
  "mt-6 max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink-muted md:text-[1.375rem]";

const cardClass =
  "absolute rounded-xl border border-plum-100 bg-parchment p-3 shadow-sm";

function CrossRefDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-lg">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-chartreuse-500/60"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden
      >
        {linePaths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={isInView || prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              delay: prefersReducedMotion ? 0 : 0.15 + i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-plum-700 text-center shadow-xl ring-4 ring-plum-500/20">
        <span className="px-2 font-serif text-sm font-semibold leading-tight text-parchment sm:text-base">
          Housing crisis
        </span>
      </div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.45 }}
        className={`${cardClass} left-[6%] top-[8%] w-[38%]`}
      >
        <Newspaper className="h-5 w-5 text-plum-700" aria-hidden />
        <p className="mt-2 font-serif text-sm font-medium text-ink">Op-ed: zoning reform</p>
        <p className="mt-1 line-clamp-2 text-xs text-ink-muted">Why rents keep climbing — and who profits.</p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.28, duration: 0.45 }}
        className={`${cardClass} right-[6%] top-[10%] w-[38%]`}
      >
        <Calendar className="h-5 w-5 text-plum-700" aria-hidden />
        <p className="mt-2 font-serif text-sm font-medium text-ink">Rally tonight</p>
        <p className="mt-1 text-xs text-ink-muted">City Hall · 6:30 PM</p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.36, duration: 0.45 }}
        className={`${cardClass} bottom-[10%] left-[8%] w-[36%]`}
      >
        <Users className="h-5 w-5 text-plum-700" aria-hidden />
        <p className="mt-2 font-serif text-sm font-medium text-ink">Sen. vote record</p>
        <p className="mt-1 text-xs text-ink-muted">Housing bill: Nay</p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.44, duration: 0.45 }}
        className={`${cardClass} bottom-[8%] right-[6%] w-[36%]`}
      >
        <Heart className="h-5 w-5 text-plum-700" aria-hidden />
        <p className="mt-2 font-serif text-sm font-medium text-ink">Land trust fund</p>
        <p className="mt-1 text-xs text-ink-muted">$12.4k raised this week</p>
      </motion.div>
    </div>
  );
}

export function CrossReference() {
  return (
    <Section tone="parchment-alt" id="how-it-works" className="relative">
      <div className="grid grid-cols-1 items-center gap-block lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ScrollReveal>
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col gap-3">
                <EyebrowBadge tone="peach">Why Impactify</EyebrowBadge>
                <h2 className={titleClass}>
                  Every issue,{" "}
                  <UnderlineFlourish color="chartreuse">
                    <em className="font-serif italic text-chartreuse-700">connected</em>
                  </UnderlineFlourish>
                  .
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <p
                  className={cn(
                    "max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink md:text-[1.375rem]",
                  )}
                >
                  Read a Times op-ed about housing. See the rally tonight. Check how your senator voted on the last housing
                  bill. Donate to the community land trust fighting for affordable units.
                </p>
                <p className={cn("max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink-muted md:text-[1.375rem]")}>
                  All from one page. Because democracy isn&apos;t separate from your feed.
                </p>
              </div>
              <ul className="space-y-3">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-3 text-body text-ink">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-chartreuse-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
        <div className="lg:col-span-7">
          <ScrollReveal direction="left" delay={0.08}>
            <CrossRefDiagram />
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
