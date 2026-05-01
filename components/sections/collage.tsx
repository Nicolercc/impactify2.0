"use client";

import { Megaphone, Sparkles } from "lucide-react";
import { Section } from "@/components/layout/section";
import { TapedPolaroid } from "@/components/decorative/taped-polaroid";
import { HandArrow } from "@/components/decorative/hand-arrow";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const POLAROID_VOTE =
  "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1600&q=80";
const POLAROID_MEETING =
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1600&q=80";

const calloutTitle =
  "font-serif text-[2rem] md:text-[2.75rem] leading-[0.95] tracking-[-0.02em] text-plum-700 max-w-[18ch]";
const calloutBody = "mt-4 text-body leading-relaxed text-ink-muted";

export function Collage() {
  return (
    <Section tone="parchment">
      <div className="grid grid-cols-1 items-start gap-y-24 lg:grid-cols-2 lg:gap-x-28 lg:gap-y-0">
        <ScrollReveal direction="right" className="relative min-h-[420px] lg:min-h-[480px]">
          <div className="absolute left-0 top-0">
            <TapedPolaroid src={POLAROID_VOTE} alt="Voters at polling place" rotate={-5} tapeColor="chartreuse" />
          </div>
          <div className="absolute bottom-8 right-0 md:bottom-12 md:right-4">
            <TapedPolaroid src={POLAROID_MEETING} alt="Community meeting" rotate={4} tapeColor="plum" />
          </div>
          <HandArrow
            direction="down-right"
            color="plum"
            className="absolute left-[35%] top-[38%] hidden opacity-80 md:block"
            size={88}
          />
        </ScrollReveal>

        <div className="space-y-16 pt-10 lg:space-y-20 lg:pt-0">
          <ScrollReveal>
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chartreuse-500">
                <Megaphone className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <div>
                <h3 className={calloutTitle}>
                  Voices for <em className="font-serif italic text-peach-600">change</em>
                </h3>
                <p className={calloutBody}>
                  Amplify what matters. Share the events, articles, and actions that move your community forward.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-chartreuse-500">
                <Sparkles className="h-5 w-5 text-ink" aria-hidden />
              </span>
              <div>
                <h3 className={calloutTitle}>
                  Every action <em className="font-serif italic text-peach-600">matters</em>
                </h3>
                <p className={calloutBody}>
                  RSVPs, donations, and letters add up. Impactify is built for the long work of citizenship — not viral hot
                  takes.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </Section>
  );
}
