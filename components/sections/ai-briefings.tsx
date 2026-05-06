"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Pause, Play, Sparkles } from "lucide-react";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import type {
	MarketingBriefingPayload,
	MarketingBriefingToken,
} from "@/lib/marketing/briefing-types";
import { cn } from "@/lib/utils";

const MS_PER_WORD = 80;
const CURSOR_BLINK_MS = 800;

type RenderedRow =
	| { kind: "h"; text: string }
	| { kind: "p"; text: string }
	| {
			kind: "li";
			badge: string;
			prefix: string;
			text: string;
			streamingDone: boolean;
	  }
	| {
			kind: "a";
			text: string;
			href?: string | null;
			streamingDone: boolean;
	  };

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

function badgeStyles(badge: string): string {
	const u = badge.toUpperCase();
	if (u.includes("TENANT") || u.includes("RENTER"))
		return "bg-[#E07856]/15 text-[#E07856] border-[#E07856]/35";
	if (u.includes("GOV") || u.includes("TRACK"))
		return "bg-[#7DD8C5]/14 text-[#7DD8C5] border-[#7DD8C5]/35";
	if (u.includes("NEWS") || u.includes("COVERAGE"))
		return "bg-[#5DA8E0]/14 text-[#5DA8E0] border-[#5DA8E0]/35";
	if (u.includes("SAMPLE"))
		return "bg-[#B8B0A4]/15 text-[#B8B0A4] border-[#B8B0A4]/35";
	return "bg-[#B888E0]/14 text-[#B888E0] border-[#B888E0]/35";
}

interface BriefingRowProps {
	row: RenderedRow;
}

function BriefingRow({ row }: BriefingRowProps) {
	if (row.kind === "h") {
		return (
			<p
				role="heading"
				aria-level={3}
				className="pt-2 font-mono text-[11px] font-semibold tracking-[0.22em] text-[#D4F25A]"
			>
				{row.text}
			</p>
		);
	}

	if (row.kind === "p") {
		return (
			<p className="font-dm-sans-stack text-[0.95rem] leading-[1.65] text-[#E8E2D6]">
				{row.text}
			</p>
		);
	}

	if (row.kind === "li") {
		return (
			<div className="rounded-2xl border border-[rgba(244,239,227,0.14)] bg-white/[0.07] p-4">
				<div className="flex flex-wrap items-center gap-2">
					<span
						className={cn(
							"rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.18em]",
							badgeStyles(row.badge),
						)}
					>
						{row.badge}
					</span>
				</div>
				<p className="mt-2 font-mono text-[11px] font-medium leading-snug text-[#CFC7B8]/90">
					{row.prefix}
				</p>
				<p className="mt-1 font-dm-sans-stack text-[0.92rem] leading-[1.6] text-[#E8E2D6]">
					{row.text}
				</p>
			</div>
		);
	}

	const content = (
		<p className="font-dm-sans-stack text-[0.95rem] leading-[1.6] text-[#F4EFE3]">
			{row.text}
		</p>
	);

	if (row.streamingDone && row.href) {
		return (
			<div className="rounded-2xl border border-[#D4F25A]/30 bg-[#D4F25A]/6 px-4 py-3">
				<a
					href={row.href}
					target="_blank"
					rel="noopener noreferrer"
					className="block rounded-lg outline-offset-2 transition-colors hover:text-[#F4EFE3] focus-visible:outline-2 focus-visible:outline-[#D4F25A]"
					aria-label={`Open action: ${row.text}`}
				>
					{content}
				</a>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-[#D4F25A]/30 bg-[#D4F25A]/6 px-4 py-3">
			{content}
		</div>
	);
}

function formatUpdated(iso: string): string {
	try {
		const d = new Date(iso);
		return d.toLocaleString(undefined, {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	} catch {
		return iso;
	}
}

export function AIBriefings() {
	const rootRef = useRef<HTMLElement>(null);
	const hasFetchedRef = useRef(false);
	const rafRef = useRef<number | null>(null);
	const cursorIntervalRef = useRef<number | null>(null);
	const streamTokensRef = useRef<MarketingBriefingToken[]>([]);

	const [payload, setPayload] = useState<MarketingBriefingPayload | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const [rows, setRows] = useState<RenderedRow[]>([]);
	const [cursorOn, setCursorOn] = useState(true);
	const [paused, setPaused] = useState(false);
	const pausedRef = useRef(false);
	pausedRef.current = paused;
	const [status, setStatus] = useState<"idle" | "generating" | "complete">(
		"idle",
	);

	const animationStateRef = useRef({
		tokenIdx: 0,
		wordIdx: 0,
		currentWords: [] as string[],
		currentTokenKey: null as string | null,
		isStreaming: false,
		wordAccumulatorMs: 0,
		lastFrameTs: 0 as number | null,
	});

	const clearStreamTimers = useCallback(() => {
		if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
		rafRef.current = null;
		if (cursorIntervalRef.current != null)
			window.clearInterval(cursorIntervalRef.current);
		cursorIntervalRef.current = null;
	}, []);

	const resetStream = useCallback(() => {
		clearStreamTimers();
		animationStateRef.current = {
			tokenIdx: 0,
			wordIdx: 0,
			currentWords: [],
			currentTokenKey: null,
			isStreaming: false,
			wordAccumulatorMs: 0,
			lastFrameTs: null,
		};
		setRows([]);
		setCursorOn(true);
		setStatus("idle");
		setPaused(false);
	}, [clearStreamTimers]);

	const advanceWord = useCallback(() => {
		const s = animationStateRef.current;
		const tokens = streamTokensRef.current;
		const idx = s.tokenIdx;
		const tok = tokens[idx];

		if (!tok) {
			clearStreamTimers();
			s.isStreaming = false;
			setStatus("complete");
			setCursorOn(false);
			setRows((prev) =>
				prev.map((r) =>
					r.kind === "li" || r.kind === "a"
						? { ...r, streamingDone: true }
						: r,
				),
			);
			return;
		}

		if (tok.type === "h") {
			setRows((prev) => [...prev, { kind: "h", text: tok.text }]);
			s.tokenIdx += 1;
			s.wordIdx = 0;
			s.currentWords = [];
			s.currentTokenKey = null;
			return;
		}

		if (!s.currentTokenKey) {
			s.currentTokenKey = `${idx}-${tok.type}`;
			const body =
				tok.type === "p" || tok.type === "li" || tok.type === "a"
					? tok.text.trim()
					: "";
			s.currentWords = body ? body.split(/\s+/) : [];
			s.wordIdx = 0;

			setRows((prev) => {
				const next = [...prev];
				if (tok.type === "p") next.push({ kind: "p", text: "" });
				if (tok.type === "li")
					next.push({
						kind: "li",
						badge: tok.badge,
						prefix: tok.prefix,
						text: "",
						streamingDone: false,
					});
				if (tok.type === "a")
					next.push({
						kind: "a",
						text: "",
						href: tok.href,
						streamingDone: false,
					});
				return next;
			});
		}

		const words = s.currentWords;
		const w = s.wordIdx;
		const nextText = words.slice(0, Math.min(words.length, w + 1)).join(" ");

		setRows((prev) => {
			if (prev.length === 0) return prev;
			const last = prev[prev.length - 1]!;
			let updatedLast: RenderedRow;
			if (tok.type === "p") updatedLast = { kind: "p", text: nextText };
			else if (tok.type === "li")
				updatedLast = {
					kind: "li",
					badge: tok.badge,
					prefix: tok.prefix,
					text: nextText,
					streamingDone: false,
				};
			else
				updatedLast = {
					kind: "a",
					text: nextText,
					href: tok.href,
					streamingDone: false,
				};
			return [...prev.slice(0, -1), updatedLast];
		});

		s.wordIdx += 1;
		if (s.wordIdx >= words.length) {
			setRows((prev) => {
				if (prev.length === 0) return prev;
				const last = prev[prev.length - 1]!;
				if (last.kind === "li")
					return [...prev.slice(0, -1), { ...last, streamingDone: true }];
				if (last.kind === "a")
					return [...prev.slice(0, -1), { ...last, streamingDone: true }];
				return prev;
			});
			s.tokenIdx += 1;
			s.wordIdx = 0;
			s.currentWords = [];
			s.currentTokenKey = null;
		}
	}, [clearStreamTimers]);

	const runStreamLoop = useCallback(() => {
		const tick = (now: number) => {
			const s = animationStateRef.current;
			if (!s.isStreaming) {
				rafRef.current = null;
				return;
			}

			if (pausedRef.current) {
				s.lastFrameTs = null;
				rafRef.current = requestAnimationFrame(tick);
				return;
			}

			if (s.lastFrameTs == null) s.lastFrameTs = now;
			const dt = now - s.lastFrameTs;
			s.lastFrameTs = now;
			s.wordAccumulatorMs += dt;

			while (s.wordAccumulatorMs >= MS_PER_WORD && s.isStreaming) {
				s.wordAccumulatorMs -= MS_PER_WORD;
				advanceWord();
			}

			if (s.isStreaming) rafRef.current = requestAnimationFrame(tick);
		};

		rafRef.current = requestAnimationFrame(tick);
	}, [advanceWord]);

	const beginStream = useCallback(() => {
		const tokens = streamTokensRef.current;
		if (!tokens.length) return;

		clearStreamTimers();
		animationStateRef.current = {
			tokenIdx: 0,
			wordIdx: 0,
			currentWords: [],
			currentTokenKey: null,
			isStreaming: true,
			wordAccumulatorMs: 0,
			lastFrameTs: null,
		};
		setRows([]);
		setCursorOn(true);
		setStatus("generating");

		const blinkId = window.setInterval(() => {
			if (!animationStateRef.current.isStreaming) return;
			setCursorOn((v) => !v);
		}, CURSOR_BLINK_MS);
		cursorIntervalRef.current = blinkId;

		runStreamLoop();
	}, [clearStreamTimers, runStreamLoop]);

	const replay = useCallback(() => {
		resetStream();
		streamTokensRef.current = payload?.tokens ?? [];
		setTimeout(() => beginStream(), 0);
	}, [resetStream, beginStream, payload]);

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;

		const io = new IntersectionObserver(
			(entries) => {
				const hit = entries.some((e) => e.isIntersecting);
				if (!hit || hasFetchedRef.current) return;
				hasFetchedRef.current = true;

				void (async () => {
					try {
						setLoading(true);
						const res = await fetch("/api/briefings/marketing", {
							cache: "no-store",
						});
						if (!res.ok) throw new Error("Briefing request failed");
						const data = (await res.json()) as MarketingBriefingPayload;
						setPayload(data);
						streamTokensRef.current = data.tokens;
					} catch (e) {
						setLoadError(
							e instanceof Error ? e.message : "Could not load briefing.",
						);
					} finally {
						setLoading(false);
					}
				})();
			},
			{ threshold: 0.1 },
		);

		io.observe(el);
		return () => {
			io.disconnect();
			clearStreamTimers();
		};
	}, [clearStreamTimers]);

	const startOnceRef = useRef(false);
	useEffect(() => {
		if (!payload || loading) return;
		if (startOnceRef.current) return;
		startOnceRef.current = true;
		streamTokensRef.current = payload.tokens;
		beginStream();
	}, [payload, loading, beginStream]);

	const copyBriefing = useCallback(() => {
		if (!payload) return;
		const lines: string[] = [];
		for (const t of payload.tokens) {
			if (t.type === "h") lines.push(`\n## ${t.text}\n`);
			if (t.type === "p") lines.push(t.text);
			if (t.type === "li") lines.push(`${t.prefix} ${t.text}`);
			if (t.type === "a") lines.push(`${t.text}${t.href ? ` ${t.href}` : ""}`);
		}
		const text = [
			payload.title,
			payload.subtitle,
			"",
			"Sources:",
			...payload.sources.map((s) => `- ${s.label}: ${s.href}`),
			"",
			...lines,
		].join("\n");
		void navigator.clipboard.writeText(text);
	}, [payload]);

	const updatedLabel = useMemo(() => {
		if (!payload) return "";
		return formatUpdated(payload.meta.updatedAt);
	}, [payload]);

	const articleBadge = useMemo(() => {
		if (!payload) return { label: "…", className: "" };
		if (payload.meta.isExample)
			return {
				label: "SAMPLE ARTICLE",
				className: "bg-[#B8B0A4]/20 text-[#D8D2C6]",
			};
		if (payload.meta.isLive)
			return {
				label: "LIVE DATA",
				className: "bg-[#D4F25A] text-[#0E0A14]",
			};
		return { label: "DEMO", className: "bg-white/10 text-[#E8E2D6]" };
	}, [payload]);

	return (
		<section
			id="briefing"
			ref={rootRef}
			className={cn(
				"dark relative overflow-hidden",
				"bg-[linear-gradient(to_bottom,rgba(74,31,79,0.45),rgba(14,10,20,1))]",
				"text-foreground",
				"py-16 md:py-20",
			)}
			aria-label="Structured clarity briefing"
		>
			<GrainOverlay className="opacity-[0.04]" />

			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-px"
				style={{
					background:
						"linear-gradient(to right, transparent, rgba(244,239,227,0.12), transparent)",
				}}
				aria-hidden
			/>

			<div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-16">
				<div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
					<div className="lg:col-span-2">
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
							<div>
								<p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-[#CFC7B8]">
									01 · AI-POWERED CLARITY
								</p>
								<h2 className="mt-4 font-serif text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[44px] lg:text-[52px]">
									<em className="font-serif italic text-[#D4F25A]">Clarity</em>
									<span className="text-[#F4EFE3]">, not just coverage.</span>
								</h2>
								<p className="mt-6 text-center text-sm font-semibold text-[#d4c9bc] lg:text-left">
									Or{" "}
									<a
										href="#reps"
										className="underline underline-offset-4 decoration-white/25 hover:text-[#F4EFE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4F25A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0A14]"
									>
										start by finding your representatives
									</a>
									.
								</p>
							</div>
							<p className="max-w-[60ch] justify-self-start font-dm-sans-stack text-[1.02rem] leading-[1.6] text-[#D8D2C6] lg:justify-self-end lg:text-right">
								Every article ships with a structured AI briefing — multiple
								perspectives, sources you can open, and actions you can take. Not
								a summary. A clarity report.
							</p>
						</div>
					</div>

					<div className="relative order-1 overflow-hidden rounded-3xl border border-[rgba(244,239,227,0.12)] bg-[rgba(28,21,40,0.55)] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur lg:order-0">
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
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.16em]",
										articleBadge.className,
									)}
								>
									{articleBadge.label}
								</span>
							</div>
						</div>

						<div className="p-6">
							<div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#B8B0A4]">
								<span className="font-semibold text-[#E8E2D6]">
									The Guardian
								</span>
								<span className="text-[#7A736A]">·</span>
								<span>2H AGO</span>
								<span className="text-[#7A736A]">·</span>
								<span>6 MIN READ</span>
							</div>

							<h3 className="mt-4 font-serif text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-[#F4EFE3]">
								NYC rent stabilization bill heads to final vote as tenant groups
								rally across five boroughs
							</h3>

							<p className="mt-3 font-dm-sans-stack text-[0.95rem] leading-[1.6] text-[#D8D2C6]">
								A landmark cap on annual increases could affect over a million
								rent-stabilized units — and reshape the city&apos;s housing
								politics ahead of the next election cycle.
							</p>

							<div className="mt-5 flex flex-wrap gap-2">
								{["Housing policy", "tenant rights", "federal context"].map(
									(t) => (
										<span
											key={t}
											className="inline-flex items-center rounded-full border border-[rgba(244,239,227,0.2)] bg-white/[0.07] px-3 py-1 font-mono text-[11px] font-medium tracking-[0.06em] text-[#D8D2C6]"
										>
											{t}
										</span>
									),
								)}
							</div>
						</div>
					</div>

					<div
						className={cn(
							"relative order-2 flex min-h-[min(560px,70vh)] flex-col overflow-hidden rounded-3xl border border-[rgba(244,239,227,0.12)]",
							"bg-[rgba(28,21,40,0.55)] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur",
							"lg:order-0 lg:h-[560px] lg:min-h-[560px] lg:max-h-[560px]",
						)}
					>
						<div className="flex shrink-0 flex-col gap-3 border-b border-[rgba(244,239,227,0.10)] px-6 py-5">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex min-w-0 items-start gap-2">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4F25A]">
										<Sparkles className="h-4 w-4 text-[#0E0A14]" aria-hidden />
									</span>
									<div className="min-w-0">
										<p className="font-sans text-base font-semibold text-[#F4EFE3]">
											Structured Clarity
										</p>
										<p className="mt-0.5 font-dm-sans-stack text-sm text-[#CFC7B8]">
											AI-synthesized briefing on this issue
										</p>
										{payload?.meta.exampleLabel ? (
											<p className="mt-2 font-dm-sans-stack text-xs leading-snug text-[#E07856]">
												{payload.meta.exampleLabel}
											</p>
										) : null}
									</div>
								</div>
								<div className="flex flex-wrap items-center justify-end gap-2">
									{payload?.meta.isLive && !payload.meta.isExample ? (
										<span className="rounded-full bg-[#D4F25A]/15 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#D4F25A]">
											REAL-TIME
										</span>
									) : null}
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#B8B0A4]">
								<span>Updated: {updatedLabel || "—"}</span>
								{payload?.meta.generationMs != null ? (
									<>
										<span className="text-[#7A736A]">·</span>
										<span>
											Generated in {(payload.meta.generationMs / 1000).toFixed(1)}
											s
										</span>
									</>
								) : null}
							</div>
							{payload?.meta.errorMessage ? (
								<p className="font-dm-sans-stack text-xs leading-snug text-[#E07856]">
									{payload.meta.errorMessage}
								</p>
							) : null}
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
							<div className="px-6 py-4">
								{loading ? (
									<p className="font-mono text-[11px] text-[#B8B0A4]">
										Loading briefing…
									</p>
								) : loadError ? (
									<p className="font-dm-sans-stack text-sm text-[#E07856]">
										{loadError}
									</p>
								) : (
									<>
										<div className="border-b border-[rgba(244,239,227,0.08)] pb-4">
											<p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#CFC7B8]/80">
												SOURCES
											</p>
											<ul className="mt-2 space-y-1.5">
												{(payload?.sources ?? []).map((s) => (
													<li key={s.href}>
														<a
															href={s.href}
															target="_blank"
															rel="noopener noreferrer"
															className="font-dm-sans-stack text-[0.85rem] leading-snug text-[#CFC7B8]/70 underline decoration-[#CFC7B8]/30 underline-offset-2 transition-colors hover:text-[#F4EFE3]"
															aria-label={`Source: ${s.label}`}
														>
															{s.label}
														</a>
													</li>
												))}
											</ul>
										</div>

										<div
											className="mt-4 space-y-4"
											aria-live="polite"
											aria-relevant="additions text"
										>
											{rows.map((r, i) => (
												<BriefingRow key={`${r.kind}-${i}`} row={r} />
											))}

											{status === "generating" ? (
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
									</>
								)}
							</div>
						</div>

						<div className="flex shrink-0 flex-col gap-3 border-t border-[rgba(244,239,227,0.10)] px-6 py-4">
							<div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-[#A8A095]">
								<span>
									Verified against {payload?.meta.verifiedSourceCount ?? 0}{" "}
									sources
								</span>
								<span className="text-[#7A736A]">·</span>
								<span>
									Last checked:{" "}
									{payload ? formatUpdated(payload.meta.lastCheckedAt) : "—"}
								</span>
							</div>
							<p className="font-dm-sans-stack text-[11px] leading-snug text-[#8A8278]">
								Sources verified against ProPublica Congress, NewsAPI, and
								GovTrack where configured.
							</p>
							<div className="flex flex-wrap items-center gap-2">
								{payload?.meta.usedClaude ? (
									<span className="font-mono text-[10px] tracking-[0.12em] text-[#B8B0A4]">
										Powered by Claude AI
									</span>
								) : (
									<span className="font-mono text-[10px] tracking-[0.12em] text-[#B8B0A4]">
										Rules-based synthesis (add Claude for AI prose)
									</span>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => setPaused((p) => !p)}
									disabled={!payload || status !== "generating"}
									className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(244,239,227,0.22)] bg-white/8 px-4 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#E8E2D6] transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 disabled:cursor-not-allowed disabled:opacity-40"
									aria-pressed={paused}
								>
									{paused ? (
										<>
											<Play className="h-3.5 w-3.5" aria-hidden />
											Resume
										</>
									) : (
										<>
											<Pause className="h-3.5 w-3.5" aria-hidden />
											Pause
										</>
									)}
								</button>
								<button
									type="button"
									onClick={replay}
									disabled={!payload}
									className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(244,239,227,0.22)] bg-white/8 px-4 font-mono text-[11px] font-semibold tracking-[0.18em] text-[#E8E2D6] transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 disabled:opacity-40"
								>
									REPLAY
								</button>
								<button
									type="button"
									onClick={copyBriefing}
									disabled={!payload}
									className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(244,239,227,0.22)] bg-white/8 px-4 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#E8E2D6] transition-colors hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 disabled:opacity-40"
								>
									<Copy className="h-3.5 w-3.5" aria-hidden />
									Copy briefing
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
