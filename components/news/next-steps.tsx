"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Share2, ArrowRight, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function NextSteps({ readMoreHref }: { readMoreHref: string }) {
	const [toast, setToast] = useState<string | null>(null);

	const sharePayload = useMemo(() => {
		if (typeof window === "undefined") return null;
		return {
			title: document?.title ?? "Impactify briefing",
			text: "AI context for a civic news story.",
			url: window.location.href,
		};
	}, []);

	async function onShare() {
		try {
			if (typeof window === "undefined") return;
			const url = window.location.href;

			if (navigator.share) {
				await navigator.share({
					title: document?.title ?? "Impactify briefing",
					text: "AI context for a civic news story.",
					url,
				});
				return;
			}

			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(url);
				setToast("Link copied");
				window.setTimeout(() => setToast(null), 1400);
				return;
			}

			setToast("Copy the URL from your address bar");
			window.setTimeout(() => setToast(null), 1800);
		} catch {
			setToast("Couldn’t share right now");
			window.setTimeout(() => setToast(null), 1600);
		}
	}

	return (
		<section
			aria-labelledby="next-steps-heading"
			className="rounded-2xl border border-plum-100 bg-parchment px-6 py-6"
		>
			<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
				<div>
					<h2
						id="next-steps-heading"
						className="font-serif text-xl font-semibold tracking-[-0.02em] text-plum-700"
					>
						Next steps
					</h2>
					<p className="mt-1 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
						Now you understand the story. Here are a few ways to turn that clarity into
						action.
					</p>
				</div>
				{toast ? (
					<div
						role="status"
						aria-live="polite"
						className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-plum-700 shadow-sm"
					>
						{toast}
					</div>
				) : null}
			</div>

			<div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
				<button
					type="button"
					onClick={onShare}
					className={cn(
						"inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-sans text-sm font-semibold",
						"bg-white text-plum-700 shadow-sm hover:bg-plum-50",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4849a] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
					)}
				>
					<Share2 className="h-4 w-4" aria-hidden />
					Share
				</button>

				<Link
					href={readMoreHref}
					className={cn(
						"inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-sans text-sm font-semibold",
						"bg-[#D4F25A] text-ink shadow-sm hover:bg-[#c0d94a]",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
					)}
				>
					Read more
					<ArrowRight className="h-4 w-4" aria-hidden />
				</Link>

				<button
					type="button"
					disabled
					aria-disabled="true"
					title="Coming soon"
					className={cn(
						"inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-sans text-sm font-semibold",
						"bg-white/70 text-ink-muted",
						"cursor-not-allowed opacity-80",
					)}
				>
					<Phone className="h-4 w-4" aria-hidden />
					Contact your rep
				</button>
			</div>
		</section>
	);
}

