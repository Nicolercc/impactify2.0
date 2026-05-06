"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
	clampHeroParallaxShift,
	heroForegroundParallaxRate,
} from "@/lib/parallax-rates";
import { cn } from "@/lib/utils";

export type HeroStat = {
	label: string;
	value: number;
	source: string;
	updatedAt: string;
	isLive: boolean;
	isStale?: boolean;
	isExample?: boolean;
};

export type HeroGovernment = {
	stateCode: string;
	stateName: string;
	senators: { name: string }[];
	houseLabel: string;
	sourceLabel: string;
	updatedAt: string;
};

export function Hero({
	stats,
	government: _government,
}: {
	stats?: HeroStat[];
	government?: HeroGovernment;
}) {
	const [scrollY, setScrollY] = useState(0);
	const [vw, setVw] = useState(1024);
	const [vh, setVh] = useState(800);
	const [fontsReady, setFontsReady] = useState(false);
	const rafRef = useRef<number | null>(null);
	const reducedMotion = usePrefersReducedMotion();

	useEffect(() => {
		setVw(window.innerWidth);
		setVh(window.innerHeight);
		const onResize = () => {
			setVw(window.innerWidth);
			setVh(window.innerHeight);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	useEffect(() => {
		let cancelled = false;
		const reveal = () => {
			if (!cancelled) setFontsReady(true);
		};
		if (typeof document !== "undefined" && document.fonts?.ready) {
			void document.fonts.ready.then(reveal).catch(reveal);
		} else {
			reveal();
		}
		const fallback = window.setTimeout(reveal, 1200);
		return () => {
			cancelled = true;
			window.clearTimeout(fallback);
		};
	}, []);

	useEffect(() => {
		if (reducedMotion) return;

		const onScroll = () => {
			if (rafRef.current) return;
			rafRef.current = window.requestAnimationFrame(() => {
				rafRef.current = null;
				setScrollY(window.scrollY || 0);
			});
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		};
	}, [reducedMotion]);

	const rate = reducedMotion ? 0 : heroForegroundParallaxRate(vw);
	const yShift =
		!fontsReady || reducedMotion
			? 0
			: clampHeroParallaxShift(scrollY, rate, vh);
	const scrollFadeOpacity = reducedMotion
		? 1
		: Math.max(0, 1 - scrollY / 600);
	const contentOpacity = fontsReady ? scrollFadeOpacity : 0;

	const ctaPrimary = cn(
		"inline-flex min-h-14 w-full min-w-0 items-center justify-center rounded-full px-8 font-sans text-sm font-semibold sm:w-auto",
		"bg-[#D4F25A] text-[#0E0A14] transition-colors hover:bg-[#c0d94a] active:bg-[#adc440]",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]",
	);

	return (
		<section
			id="hero"
			className={cn(
				"dark relative flex min-h-dvh flex-col justify-center overflow-hidden",
				"text-foreground",
			)}
			aria-labelledby="hero-heading"
		>
			<GrainOverlay className="opacity-[0.04]" />

			{/* Foreground — parallax + scroll fade disabled when prefers-reduced-motion */}
			<div
				className={cn(
					"relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 pt-8 md:px-12 md:pb-24 lg:px-16",
					fontsReady && "transition-opacity duration-300 ease-out",
				)}
				style={{
					transform:
						reducedMotion || !fontsReady
							? "translate3d(0, 0, 0)"
							: `translate3d(0, ${-yShift}px, 0)`,
					opacity: contentOpacity,
					willChange:
						reducedMotion || !fontsReady
							? undefined
							: ("transform, opacity" as const),
				}}
			>
				<div className="mx-auto w-full max-w-3xl text-center">
					{/* Eyebrow */}
					<div className="inline-flex max-w-[95vw] flex-wrap items-center justify-center gap-3 rounded-full border border-white/15 bg-black/40 px-4 py-2 backdrop-blur">
						<span
							aria-hidden="true"
							className="h-2.5 w-2.5 rounded-full bg-[#D4F25A]"
						/>
						<span className="font-sans text-xs font-semibold tracking-wide text-[#F4EFE3]">
							Civic Clarity Platform
						</span>
						<span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-[#F4EFE3]/85">
							REAL DATA · NO NOISE
						</span>
					</div>

					<h1
						id="hero-heading"
						className="mx-auto mt-6 max-w-[18ch] font-serif text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-[#F4EFE3] md:text-[clamp(2.5rem,5vw,4rem)]"
						aria-label="Know your NY representatives. See how they vote."
					>
						<span className="block">Know your NY representatives.</span>
						<span className="block">See how they vote.</span>
					</h1>

					{/* Primary first for keyboard / SR tab order */}
					<div className="mt-12 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
						<Link
							href="/reps"
							className={ctaPrimary}
							onClick={() => {
								try {
									if (typeof window === "undefined") return;
									const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
									g?.("event", "hero_cta_click", {
										action: "find_representatives",
										location: "hero_section",
										button_text: "Find my NY representatives",
									});
								} catch {
									// no-op: analytics must never break navigation
								}
							}}
						>
							Find my NY representatives
						</Link>
					</div>
				</div>
			</div>

			<div className="pointer-events-none absolute bottom-[max(1.75rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
				<a
					href="#news"
					className="pointer-events-auto flex flex-col items-center gap-2 rounded-sm text-[rgba(244,239,227,0.65)] transition-colors hover:text-[rgba(244,239,227,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
					aria-label="Scroll to news section"
				>
					<span className="font-mono text-[11px] font-medium tracking-[0.22em]">
						SCROLL
					</span>
					<span className={cn(!reducedMotion && "animate-chevron-bounce")}>
						<ChevronDown className="h-5 w-5" aria-hidden />
					</span>
				</a>
			</div>
		</section>
	);
}
