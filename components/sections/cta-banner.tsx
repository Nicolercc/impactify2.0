"use client";

import Link from "next/link";
import { Section } from "@/components/layout/section";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { UnderlineFlourish } from "@/components/decorative/underline-flourish";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const titleClass =
  "mx-auto max-w-[16ch] font-serif text-[3.5rem] leading-[0.95] tracking-[-0.035em] text-parchment md:text-[5rem]";

export function CTABanner() {
  return (
    <Section tone="plum-deep" fullBleed className="relative">
      <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12 lg:px-16">
        <GrainOverlay />
        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <ScrollReveal>
            <h2 id="cta-heading" className={titleClass}>
              Ready to{" "}
              <UnderlineFlourish color="chartreuse">
                <em className="font-serif italic text-chartreuse-500">get involved</em>
              </UnderlineFlourish>
              ?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="mx-auto max-w-2xl text-[1.25rem] leading-relaxed text-parchment/75 md:text-[1.375rem]">
              The civic action hub that doesn&apos;t assume you have three hours to read the news. Start where you are.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.14}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/feed"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-chartreuse-500 px-8 py-4 font-medium text-ink transition-colors hover:bg-chartreuse-700"
              >
                Explore the feed
              </Link>
              <Link
                href="/events/new"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-parchment px-8 py-4 font-medium text-parchment transition-colors hover:bg-parchment hover:text-plum-700"
              >
                I&apos;m an organizer
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
