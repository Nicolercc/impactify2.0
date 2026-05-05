import Link from "next/link";

export default function FeedbackPage() {
	return (
		<main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-28 md:px-12">
			<h1 className="font-serif text-4xl font-semibold tracking-tight text-white">
				Feedback
			</h1>
			<p className="mt-4 text-base leading-relaxed text-white/80">
				Send feedback any time. We read every message.
			</p>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<a
					href="mailto:hello@impactify.example?subject=Impactify%20feedback"
					className="inline-flex min-h-12 items-center justify-center rounded-full bg-chartreuse-500 px-6 text-sm font-semibold text-plum-700 hover:bg-chartreuse-700"
				>
					Email feedback
				</a>
				<Link
					href="/"
					className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
				>
					Back to home
				</Link>
			</div>
		</main>
	);
}

