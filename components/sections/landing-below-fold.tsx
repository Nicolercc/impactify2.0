"use client";

import dynamic from "next/dynamic";

function SectionSkeleton({ tone = "light" }: { tone?: "light" | "dark" }) {
	return (
		<section
			className={tone === "dark" ? "dark bg-background" : "bg-background"}
			aria-hidden="true"
		>
			<div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-20 lg:px-16">
				<div className="h-6 w-44 rounded-full bg-ink/10" />
				<div className="mt-6 h-10 w-[min(560px,85%)] rounded-xl bg-ink/10" />
				<div className="mt-4 h-4 w-[min(720px,92%)] rounded-full bg-ink/10" />
				<div className="mt-2 h-4 w-[min(680px,88%)] rounded-full bg-ink/10" />
				<div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div className="h-40 rounded-2xl bg-ink/10" />
					<div className="h-40 rounded-2xl bg-ink/10" />
					<div className="h-40 rounded-2xl bg-ink/10" />
				</div>
			</div>
		</section>
	);
}

const AIBriefings = dynamic(
	() => import("@/components/sections/ai-briefings").then((m) => m.AIBriefings),
	{ ssr: false, loading: () => <SectionSkeleton tone="dark" /> },
);
const RepsScorecard = dynamic(
	() =>
		import("@/components/sections/reps-scorecard").then((m) => m.RepsScorecard),
	{ ssr: false, loading: () => <SectionSkeleton /> },
);
const CivicPulse = dynamic(
	() => import("@/components/sections/civic-pulse").then((m) => m.CivicPulse),
	{ ssr: false, loading: () => <SectionSkeleton tone="dark" /> },
);
const ToolsGrid = dynamic(
	() => import("@/components/sections/tools-grid").then((m) => m.ToolsGrid),
	{ ssr: false, loading: () => <SectionSkeleton /> },
);
const CTABanner = dynamic(
	() => import("@/components/sections/cta-banner").then((m) => m.CTABanner),
	{ ssr: false, loading: () => <SectionSkeleton tone="dark" /> },
);
const Ticker = dynamic(
	() => import("@/components/sections/ticker").then((m) => m.Ticker),
	{ ssr: false, loading: () => null },
);

export function LandingBelowFold() {
	return (
		<>
			<RepsScorecard />
			<AIBriefings />
			<ToolsGrid />
			<CivicPulse />
			<CTABanner />
			<Ticker />
		</>
	);
}
