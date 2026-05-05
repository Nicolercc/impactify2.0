import type { Metadata } from "next";
import { PullQuote } from "@/components/decorative/pull-quote";
import { Hero } from "@/components/sections/hero";
import { TrendingNews } from "@/components/sections/trending-news";
import { LandingBelowFold } from "@/components/sections/landing-below-fold";
import { fetchNewsArticles } from "@/lib/news/queries";
import { fetchHeroStats } from "@/lib/hero-stats";
import { fetchHeroGovernmentNY } from "@/lib/hero-government";

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
	const [heroStats, heroGovernment] = await Promise.all([
		fetchHeroStats(),
		fetchHeroGovernmentNY(),
	]);

	return (
		<main id="main-content" className="relative z-10">
			<Hero stats={heroStats} government={heroGovernment ?? undefined} />
			{/* Opaque content backdrop: prevents fixed parallax from showing through */}
			<div className="relative isolate z-10 w-full pb-[38px]">
				<div className="absolute inset-0 -z-10 bg-background" />
				<TrendingNews articles={briefingArticles} />
				<PullQuote attribution="The Impactify difference">
					Context is the difference between news and noise.
				</PullQuote>
				<LandingBelowFold />
			</div>
		</main>
	);
}
