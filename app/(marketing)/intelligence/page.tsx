import Link from "next/link";

export default function IntelligencePage() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-28 md:px-12">
			<h1 className="font-serif text-4xl font-semibold tracking-tight text-white">
				Civic Intelligence
			</h1>
			<p className="mt-4 text-base leading-relaxed text-white/80">
				This feature is coming soon. We’re building clear, defensible insights on voting
				patterns and issue alignment—without fake urgency or noisy dashboards.
			</p>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<Link
					href="/reps"
					className="inline-flex min-h-12 items-center justify-center rounded-full bg-chartreuse-500 px-6 text-sm font-semibold text-plum-700 hover:bg-chartreuse-700"
				>
					Find my representatives
				</Link>
				<Link
					href="/news"
					className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
				>
					Read the Briefing
				</Link>
			</div>
		</main>
	);
}

