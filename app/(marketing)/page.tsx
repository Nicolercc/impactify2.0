import type { Metadata } from "next";
import { PullQuote } from "@/components/decorative/pull-quote";
import { Hero } from "@/components/sections/hero";
import { NewsPreview } from "@/components/sections/news-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { CrossReference } from "@/components/sections/cross-reference";
import { Collage } from "@/components/sections/collage";
import { AIBriefings } from "@/components/sections/ai-briefings";
import { RepsScorecard } from "@/components/sections/reps-scorecard";
import { ToolsGrid } from "@/components/sections/tools-grid";
import { CTABanner } from "@/components/sections/cta-banner";
import { fetchNewsArticles } from "@/lib/news/queries";

export const revalidate = 3600; // Refresh articles every hour

export const metadata: Metadata = {
	title: "Impactify | Your Voice, Organized",
	description:
		"Understand what's happening in the world, cut through the noise, and figure out what you can do about it. Civic news, AI-powered clarity, and real action.",
	openGraph: {
		title: "Impactify | Your Voice, Organized",
		description:
			"Understand what's happening in the world, cut through the noise, and figure out what you can do about it.",
		type: "website",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Impactify - Your Voice, Organized",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Impactify | Your Voice, Organized",
		description:
			"Understand what's happening in the world, cut through the noise, and figure out what you can do about it.",
		images: ["/og-image.jpg"],
	},
};

export default async function LandingPage() {
	const briefingArticles = await fetchNewsArticles();

	return (
		<main id="main-content">
			<div className="relative">
				<Hero />
			</div>
			<div className="relative">
				<NewsPreview articles={briefingArticles} />
			</div>
			<div className="relative">
				<PullQuote attribution="The Impactify difference">
					Context is the difference between news and noise.
				</PullQuote>
			</div>

			<div className="relative">
				<AIBriefings />
			</div>
			<div className="relative">
				<CrossReference />
			</div>
			<div className="relative">
				<Collage />
			</div>
			<div className="relative">
				<EventsPreview />
			</div>
			<div className="relative">
				<RepsScorecard />
			</div>

			<div className="relative">
				<ToolsGrid />
			</div>
			<div className="relative">
				<CTABanner />
			</div>
		</main>
	);
}
