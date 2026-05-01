"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Section } from "@/components/layout/section";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { NumberCounter } from "@/components/decorative/number-counter";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

// Typography classes for title and lead
const titleClass =
	"font-serif text-[3.5rem] md:text-[5rem] leading-[0.95] tracking-[-0.035em] text-plum-700 max-w-[16ch]";
const leadClass =
	"mt-6 max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink-muted md:text-[1.375rem]";

// Mockup of a representative's scorecard
function RepScorecardMockup() {
	// SVG settings for circular progress
	const radius = 52;
	const circumference = 2 * Math.PI * radius;
	const pct = 0.82;
	const dash = circumference * pct;

	// Mock bills for recent votes
	const recentBills = [
		{
			name: "Climate Action Bill",
			votedFor: true,
			date: "Mar 15",
		},
		{
			name: "Voting Rights Act",
			votedFor: true,
			date: "Mar 8",
		},
		{
			name: "Defense Budget Amendment",
			votedFor: false,
			date: "Feb 28",
		},
	];

	return (
		<div className="relative mx-auto max-w-md rounded-2xl border border-plum-100/80 bg-parchment p-8 shadow-[0_24px_60px_rgba(43,11,42,0.12)]">
			<div className="flex items-start gap-4">
				<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-plum-100 ring-2 ring-plum-100">
					<Image
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
						alt=""
						fill
						className="object-cover"
						sizes="64px"
					/>
				</div>
				<div>
					<h3 className="font-serif text-lg font-semibold text-ink">
						Sen. Maria Gonzalez
					</h3>
					<p className="text-sm text-ink-muted">California · Democrat</p>
					<span className="mt-2 inline-block rounded-full bg-plum-50 px-2 py-0.5 font-sans text-eyebrow uppercase tracking-widest text-plum-700">
						U.S. Senate
					</span>
				</div>
			</div>

			<div className="mt-8 flex items-center gap-6">
				<div className="relative h-32 w-32 shrink-0">
					<svg className="-rotate-90" viewBox="0 0 120 120" aria-hidden>
						<circle
							cx="60"
							cy="60"
							r={radius}
							stroke="var(--plum-100)"
							strokeWidth="10"
							fill="none"
						/>
						<circle
							cx="60"
							cy="60"
							r={radius}
							stroke="var(--chartreuse-500)"
							strokeWidth="10"
							fill="none"
							strokeDasharray={`${dash} ${circumference}`}
							strokeLinecap="round"
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
						<span className="font-serif text-3xl font-semibold text-plum-700">
							<NumberCounter to={82} suffix="%" duration={1.4} />
						</span>
						<span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
							aligned
						</span>
					</div>
				</div>
				<div>
					<p className="font-medium text-ink">With your saved causes</p>
					<p className="mt-1 text-sm text-ink-muted">
						Vote-by-vote transparency you can act on.
					</p>
				</div>
			</div>

			<ul className="mt-8 space-y-3 border-t border-plum-100/60 pt-6">
				<li className="flex items-center gap-2 text-sm">
					<CheckCircle2
						className="h-4 w-4 shrink-0 text-sage-400"
						aria-hidden
					/>
					<span className="flex-1 text-ink">Climate Action Bill</span>
					<span className="text-xs text-ink-muted">Mar 15</span>
				</li>
				<li className="flex items-center gap-2 text-sm">
					<CheckCircle2
						className="h-4 w-4 shrink-0 text-sage-400"
						aria-hidden
					/>
					<span className="flex-1 text-ink">Voting Rights Act</span>
					<span className="text-xs text-ink-muted">Mar 8</span>
				</li>
				<li className="flex items-center gap-2 text-sm">
					<XCircle className="h-4 w-4 shrink-0 text-peach-600" aria-hidden />
					<span className="flex-1 text-ink">Defense Budget Amendment</span>
					<span className="text-xs text-ink-muted">Feb 28</span>
				</li>
			</ul>
		</div>
	);
}

export function RepsScorecard() {
	return (
		<Section tone="parchment-alt" className="relative">
			<div className="grid grid-cols-1 items-center gap-block lg:grid-cols-2">
				<div>
					<ScrollReveal>
						<div className="flex flex-col gap-4 md:gap-6">
							<div className="flex flex-col gap-3">
								<EyebrowBadge tone="plum">Democracy, measured</EyebrowBadge>
								<h2 className={titleClass}>
									Your reps.{" "}
									<em className="font-serif italic text-peach-600">
										Your scorecard.
									</em>
								</h2>
							</div>
							<p className={cn("max-w-[52ch] text-[1.25rem] leading-[1.55] text-ink-muted md:text-[1.375rem]")}>
								Follow the causes you care about. We&apos;ll show you, vote by
								vote, whether your representatives match — or whether it&apos;s
								time to pay attention to who&apos;s running against them.
							</p>
							<div>
								<Link
									href="/reps"
									className="inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3 font-medium text-parchment transition-colors hover:bg-plum-500"
								>
									Find my reps
									<ArrowRight className="h-4 w-4" />
								</Link>
							</div>
						</div>
					</ScrollReveal>
				</div>
				<ScrollReveal direction="left" delay={0.1}>
					<RepScorecardMockup />
				</ScrollReveal>
			</div>
		</Section>
	);
}
