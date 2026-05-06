"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { cn } from "@/lib/utils";

type BriefingToken =
	| { type: "h"; text: string }
	| { type: "p"; text: string }
	| { type: "li"; tag: "TENANTS" | "LANDLORDS" | "ECONOMISTS"; text: string }
	| { type: "a"; text: string };

const BRIEFING_TOKENS: BriefingToken[] = [
	{ type: "h", text: "WHAT'S HAPPENING" },
	{
		type: "p",
		text: "NY State Assembly votes Friday on A.1234, capping annual rent increases at 2% on rent-stabilized units. Affects approximately 1.04 million apartments.",
	},
	{ type: "h", text: "PERSPECTIVES" },
	{
		type: "li",
		tag: "TENANTS",
		text: "Cite displacement risk. Rent up 23% since 2020 in target zones.",
	},
	{
		type: "li",
		tag: "LANDLORDS",
		text: "Argue maintenance backlog will worsen. Cite 4.1% operating cost growth.",
	},
	{
		type: "li",
		tag: "ECONOMISTS",
		text: "Mixed evidence — short-term relief versus long-term supply effects.",
	},
	{ type: "h", text: "WHAT YOU CAN DO" },
	{ type: "a", text: "→ Call your Assembly rep (auto-script ready)" },
	{ type: "a", text: "→ Attend Town Hall · NYC · Apr 20" },
	{ type: "a", text: "→ Donate to NYC Land Trust ($12.4k raised)" },
];

type RenderedRow =
	| { kind: "h"; text: string }
	| { kind: "p"; text: string }
	| { kind: "li"; tag: "TENANTS" | "LANDLORDS" | "ECONOMISTS"; text: string }
	| { kind: "a"; text: string };

function SkylineSilhouette() {
	return (
		<svg
			viewBox="0 0 1200 260"
			preserveAspectRatio="none"
			className="h-full w-full"
			aria-hidden="true"
		>
			<path
				d="
          M0 260V190h50v-30h28v30h44v-60h36v60h36v-95h54v95h32v-55h40v55h26v-120h64v120h44v-70h30v70h36v-140h72v40h18v100h38v-85h54v85h22v-55h34v55h28v-110h66v110h40v-70h34v70h30v-150h72v60h22v90h44v-60h36v60h30v-95h56v95h44v-55h34v55h26v-30h28v30h50V260H0z
        "
				fill="rgba(244, 239, 227, 0.06)"
			/>
		</svg>
	);
}

export function AIBriefings() {
	const rootRef = useRef<HTMLElement>(null);
	const hasStartedRef = useRef(false);
	const intervalRef = useRef<number | null>(null);
	const cursorIntervalRef = useRef<number | null>(null);

	const [rows, setRows] = useState<RenderedRow[]>([]);
	const [streaming, setStreaming] = useState(false);
	const [cursorOn, setCursorOn] = useState(true);
	const [status, setStatus] = useState<"idle" | "generating" | "complete">(
		"idle",
	);

	// Internal streaming pointers (refs so we don't re-render per tick beyond text updates).
	const tokenIdxRef = useRef(0);
	const wordIdxRef = useRef(0);
	const currentWordsRef = useRef<string[]>([]);
	const currentRowKeyRef = useRef<string | null>(null);

	const badgeColors = useMemo(() => {
		return {
			TENANTS: "bg-[#E07856]/15 text-[#E07856] border-[#E07856]/35",
			LANDLORDS: "bg-[#7DD8C5]/14 text-[#7DD8C5] border-[#7DD8C5]/35",
			ECONOMISTS: "bg-[#B888E0]/14 text-[#B888E0] border-[#B888E0]/35",
		} as const;
	}, []);

	function clearTimers() {
		if (intervalRef.current) window.clearInterval(intervalRef.current);
		intervalRef.current = null;
		if (cursorIntervalRef.current)
			window.clearInterval(cursorIntervalRef.current);
		cursorIntervalRef.current = null;
	}

	function reset() {
		clearTimers();
		tokenIdxRef.current = 0;
		wordIdxRef.current = 0;
		currentWordsRef.current = [];
		currentRowKeyRef.current = null;
		setRows([]);
		setCursorOn(true);
		setStreaming(false);
		setStatus("idle");
	}

	function begin() {
		if (streaming) return;
		setStatus("generating");
		setStreaming(true);
		setCursorOn(true);

		cursorIntervalRef.current = window.setInterval(() => {
			setCursorOn((v) => !v);
		}, 800);

		intervalRef.current = window.setInterval(() => {
			const idx = tokenIdxRef.current;
			const tok = BRIEFING_TOKENS[idx];
			if (!tok) {
				clearTimers();
				setStreaming(false);
				setStatus("complete");
				setCursorOn(false);
				return;
			}

			// Headers appear instantly.
			if (tok.type === "h") {
				setRows((prev) => [...prev, { kind: "h", text: tok.text }]);
				tokenIdxRef.current += 1;
				wordIdxRef.current = 0;
				currentWordsRef.current = [];
				currentRowKeyRef.current = null;
				return;
			}

			// Initialize current token words once.
			if (!currentRowKeyRef.current) {
				currentRowKeyRef.current = `${idx}-${tok.type}`;
				const text = tok.text.trim();
				currentWordsRef.current = text ? text.split(/\s+/) : [];
				wordIdxRef.current = 0;

				// Insert a placeholder row for streaming text.
				setRows((prev) => {
					const next: RenderedRow[] = [...prev];
					if (tok.type === "p") next.push({ kind: "p", text: "" });
					if (tok.type === "li")
						next.push({ kind: "li", tag: tok.tag, text: "" });
					if (tok.type === "a") next.push({ kind: "a", text: "" });
					return next;
				});
			}

			const words = currentWordsRef.current;
			const w = wordIdxRef.current;
			const nextText = words.slice(0, Math.min(words.length, w + 1)).join(" ");

			setRows((prev) => {
				if (prev.length === 0) return prev;
				const last = prev[prev.length - 1]!;
				const updatedLast: RenderedRow =
					tok.type === "p"
						? { kind: "p", text: nextText }
						: tok.type === "li"
							? { kind: "li", tag: tok.tag, text: nextText }
							: { kind: "a", text: nextText };
				return [...prev.slice(0, -1), updatedLast];
			});

			wordIdxRef.current += 1;
			if (wordIdxRef.current >= words.length) {
				// Token completed; advance.
				tokenIdxRef.current += 1;
				wordIdxRef.current = 0;
				currentWordsRef.current = [];
				currentRowKeyRef.current = null;
			}
		}, 60);
	}

	function replay() {
		reset();
		begin();
	}

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				const hit = entries.some((e) => e.isIntersecting);
				if (!hit) return;
				if (hasStartedRef.current) return;
				hasStartedRef.current = true;
				begin();
			},
			{ threshold: 0.4 },
		);
		io.observe(el);
		return () => {
			io.disconnect();
			clearTimers();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<section
			ref={rootRef}
			className={cn(
				"dark relative overflow-hidden",
				"bg-[linear-gradient(to_bottom,rgba(74,31,79,0.22),rgba(14,10,20,1))]",
				"text-foreground",
				"py-16 md:py-20",
			)}
			aria-label="AI Briefing demo"
		>
			<GrainOverlay className="opacity-[0.04]" />

			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-px"
				style={{
					background:
						"linear-gradient(to right, transparent, rgba(244,239,227,0.18), transparent)",
				}}
				aria-hidden
			/>

			<div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
				<div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
					{/* Header row */}
					<div className="lg:col-span-2">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
							<div>
								<p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-parchment/70">
									§01 · AI-POWERED CLARITY
								</p>
								<h2 className="mt-4 font-serif text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[44px] lg:text-[52px]">
									<em className="font-serif italic text-[#D4F25A]">Clarity</em>,
									not just coverage.
								</h2>
							</div>
							<p className="max-w-[60ch] justify-self-start font-dm-sans-stack text-[1.02rem] leading-[1.6] text-parchment/70 lg:justify-self-end lg:text-right">
								Every article ships with a structured AI briefing — multiple
								perspectives, key stakeholders, what&apos;s uncertain, and what
								you can actually do. Not a summary. A clarity report.
							</p>
						</div>
					</div>

					{/* Left: Article card */}
					<div className="relative overflow-hidden rounded-3xl border border-[rgba(244,239,227,0.12)] bg-[rgba(28,21,40,0.55)] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
						<div className="relative aspect-video overflow-hidden">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(212,242,90,0.10),transparent_52%)]" />
							<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(74,31,79,0.30),rgba(14,10,20,0.95))]" />
							<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[55%] opacity-90">
								<SkylineSilhouette />
							</div>

							<div className="absolute left-4 top-4 flex items-center gap-2">
								<span className="inline-flex items-center rounded-full bg-[#E07856]/15 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#E07856]">
									HOUSING
								</span>
							</div>
							<div className="absolute right-4 top-4">
								<span className="inline-flex items-center rounded-full bg-[#D4F25A] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#0E0A14]">
									VERIFIED
								</span>
							</div>
						</div>

						<div className="p-6">
							<div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-parchment/60">
								<span className="font-semibold text-parchment/80">
									The Guardian
								</span>
								<span className="text-parchment/30">·</span>
								<span>2H AGO</span>
								<span className="text-parchment/30">·</span>
								<span>6 MIN READ</span>
							</div>

							<h3 className="mt-4 font-serif text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
								NYC rent stabilization bill heads to final vote as tenant groups
								rally across five boroughs
							</h3>

							<p className="mt-3 font-dm-sans-stack text-[0.95rem] leading-[1.6] text-parchment/70">
								A landmark cap on annual increases could affect over a million
								rent-stabilized units — and reshape the city&apos;s housing
								politics ahead of the next election cycle.
							</p>

							<div className="mt-5 flex flex-wrap gap-2">
								{["A.1234", "tenant rights", "+3 more"].map((t) => (
									<span
										key={t}
										className="inline-flex items-center rounded-full border border-[rgba(244,239,227,0.14)] bg-white/5 px-3 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-parchment/70"
									>
										{t}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Right: AI Briefing card */}
					<div
						className={cn(
							"relative overflow-hidden rounded-3xl border border-[rgba(244,239,227,0.12)]",
							"bg-[rgba(28,21,40,0.55)] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur",
							"min-h-[420px] md:min-h-[520px]",
						)}
					>
						<div className="flex items-start justify-between gap-4 border-b border-[rgba(244,239,227,0.10)] px-6 py-5">
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4F25A]">
										<Sparkles className="h-4 w-4 text-[#0E0A14]" aria-hidden />
									</span>
									<div className="min-w-0">
										<div className="flex items-center gap-3">
											<span className="font-sans text-sm font-semibold text-foreground">
												AI Briefing
											</span>
											<span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-parchment/60">
												CLARITY MODEL · STREAMING
											</span>
										</div>
										<div className="mt-1 flex items-center gap-2">
											<span
												className={cn(
													"relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D4F25A]",
													status === "generating" && "animate-ping",
												)}
												aria-hidden
											/>
											<span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-parchment/70">
												{status === "complete"
													? "COMPLETE · 1.2s"
													: status === "generating"
														? "GENERATING"
														: "READY"}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="px-6 py-5">
							<div className="space-y-4">
								{rows.map((r, i) => {
									if (r.kind === "h") {
										return (
											<div
												key={`${r.kind}-${r.text}-${i}`}
												className="pt-2 font-mono text-[11px] font-semibold tracking-[0.22em] text-[#D4F25A]"
											>
												{r.text}
											</div>
										);
									}

									if (r.kind === "p") {
										return (
											<p
												key={`${r.kind}-${i}`}
												className="font-dm-sans-stack text-[0.95rem] leading-[1.65] text-parchment/75"
											>
												{r.text}
											</p>
										);
									}

									if (r.kind === "li") {
										return (
											<div
												key={`${r.kind}-${r.tag}-${i}`}
												className="rounded-2xl border border-[rgba(244,239,227,0.10)] bg-white/5 p-4"
											>
												<div className="flex items-center gap-2">
													<span
														className={cn(
															"rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.18em]",
															badgeColors[r.tag],
														)}
													>
														{r.tag}
													</span>
												</div>
												<p className="mt-2 font-dm-sans-stack text-[0.92rem] leading-[1.6] text-parchment/75">
													{r.text}
												</p>
											</div>
										);
									}

									return (
										<div
											key={`${r.kind}-${i}`}
											className="rounded-2xl border border-[#D4F25A]/30 bg-[#D4F25A]/6 px-4 py-3"
										>
											<p className="font-dm-sans-stack text-[0.95rem] leading-[1.6] text-parchment/85">
												{r.text}
											</p>
										</div>
									);
								})}

								{streaming ? (
									<span
										aria-hidden
										className={cn(
											"inline-block h-4 w-[2px] translate-y-[2px] bg-[#D4F25A]",
											cursorOn ? "opacity-100" : "opacity-0",
										)}
										style={{ transition: "opacity 120ms ease" }}
									/>
								) : null}
							</div>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(244,239,227,0.10)] px-6 py-4">
							<button
								type="button"
								onClick={replay}
								className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(244,239,227,0.18)] bg-white/5 px-4 font-mono text-[11px] font-semibold tracking-[0.18em] text-parchment/80 transition-colors hover:bg-white/10 hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
							>
								REPLAY
							</button>
							<div className="font-mono text-[10px] font-semibold tracking-[0.16em] text-parchment/55">
								4 SOURCES · 1.2s · CLAUDE SONNET
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
