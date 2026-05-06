"use client";

import Link from "next/link";
import { Section } from "@/components/layout/section";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { UnderlineFlourish } from "@/components/decorative/underline-flourish";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

const titleClass =
	"mx-auto max-w-[16ch] font-serif text-[3.5rem] leading-[0.95] tracking-[-0.035em] text-ink dark:text-parchment md:text-[5rem]";

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
				<GrainOverlay />
				<div className="flex flex-col items-center gap-6 sm:gap-8">
					<ScrollReveal>
						<h2 id="cta-heading" className={titleClass}>
							Ready to{" "}
							<UnderlineFlourish color="chartreuse">
								<em className="font-serif italic text-chartreuse-500">
									start reading
								</em>
							</UnderlineFlourish>
							?
						</h2>
					</ScrollReveal>
					<ScrollReveal delay={0.08}>
						<p className="mx-auto max-w-2xl text-[1.25rem] leading-relaxed text-ink-muted dark:text-[#d4c9bc] md:text-[1.375rem]">
							The civic action hub that doesn&apos;t assume you have three hours
							to read the news. Start where you are.
						</p>
					</ScrollReveal>
					<ScrollReveal delay={0.14}>
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								href="/news"
								className="inline-flex min-h-12 items-center justify-center rounded-full bg-chartreuse-500 px-8 py-4 font-medium text-[#0E0A14] transition-colors hover:bg-chartreuse-700"
							>
								Start reading
							</Link>
							<Link
								href="/events/new"
								className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-plum-200 bg-white/40 px-8 py-4 font-medium text-plum-700 transition-colors hover:bg-white/60 hover:text-plum-700 dark:border-[rgba(244,239,227,0.2)] dark:bg-transparent dark:text-[#F4EFE3] dark:hover:bg-white/5 dark:hover:text-[#F4EFE3]"
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
