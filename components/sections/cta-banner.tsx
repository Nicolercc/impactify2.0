"use client";

import Link from "next/link";
import { Section } from "@/components/layout/section";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const titleClass =
	"mx-auto max-w-[16ch] text-balance font-serif text-[clamp(2.25rem,5.2vw,5rem)] leading-[1.0] tracking-[-0.04em]";

export function CTABanner() {
	return (
		<Section
			tone="plum-deep"
			fullBleed
			className={`
        relative
        bg-[linear-gradient(180deg,#F7F2E8_0%,#FFFFFF_52%,#F7F2E8_100%)]
        dark:bg-[linear-gradient(180deg,#0E0A14_0%,#1a0618_55%,#0E0A14_100%)]
      `}
		>
			<div className="relative mx-auto max-w-4xl px-6 text-center md:px-12 lg:px-16">
				<GrainOverlay className="opacity-[0.035]" />
				<div className="flex flex-col items-center gap-6 sm:gap-8">
					<ScrollReveal>
						<h2 id="cta-heading" className={titleClass}>
							<span className="block text-ink dark:text-parchment">Ready to</span>
							<span className="block font-serif italic text-chartreuse-500">
								understand?
							</span>
						</h2>
					</ScrollReveal>
					<ScrollReveal delay={0.08}>
						<p className="mx-auto max-w-2xl text-pretty text-[1.125rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc] md:text-[1.25rem]">
							Get real voting records, actual perspectives, actionable next
							steps—without the noise.
						</p>
					</ScrollReveal>
					<ScrollReveal delay={0.14}>
						<div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
							<Link
								href="/reps"
								className="inline-flex min-h-14 w-full min-w-0 items-center justify-center rounded-full bg-chartreuse-500 px-8 font-sans text-sm font-semibold text-[#0E0A14] transition-colors hover:bg-chartreuse-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff] sm:w-auto"
							>
								Find my representatives
							</Link>
							<Link
								href="#briefing"
								className="inline-flex min-h-14 w-full min-w-0 items-center justify-center rounded-full border border-plum-200 bg-white/60 px-8 font-sans text-sm font-semibold text-plum-700 transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff] dark:border-[rgba(244,239,227,0.2)] dark:bg-white/5 dark:text-[#F4EFE3] dark:hover:bg-white/10 dark:focus-visible:ring-offset-[#0E0A14] sm:w-auto"
							>
								Read today&apos;s briefing
							</Link>
						</div>
					</ScrollReveal>
				</div>
			</div>
		</Section>
	);
}
