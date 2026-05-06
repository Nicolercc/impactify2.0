"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Search, X } from "lucide-react";
import { CAUSES } from "@/lib/reps/mock-data";
import type { CauseKey, Rep } from "@/lib/reps/types";
import { cn } from "@/lib/utils";
import { overallAlignment, ringColor, topAlignedCauses, voteBadge } from "@/lib/reps/scorecard-utils";

function clampZip(raw: string): string {
	return raw.replace(/[^\d]/g, "").slice(0, 5);
}

function formatPct(n: number | null | undefined): string {
	if (typeof n !== "number" || !Number.isFinite(n)) return "—";
	return `${Math.round(n)}%`;
}

function useActiveCauses(): [Set<CauseKey>, (k: CauseKey) => void] {
	const [active, setActive] = useState<Set<CauseKey>>(
		() => new Set<CauseKey>(["climate", "housing", "democracy"]),
	);
	const toggle = (k: CauseKey) => {
		setActive((prev) => {
			const next = new Set(prev);
			if (next.has(k)) next.delete(k);
			else next.add(k);
			return next;
		});
	};
	return [active, toggle];
}

export function RepsDirectory(props: {
	initialZip: string | null;
	reps: Rep[];
	isExample: boolean;
	dataNote?: string;
}) {
	const { initialZip, reps, isExample, dataNote } = props;

	const [zip, setZip] = useState<string>(initialZip ?? "");
	const [selectedId, setSelectedId] = useState<string>(() => reps[0]?.id ?? "");
	const [activeCauses, toggleCause] = useActiveCauses();

	const detailRef = useRef<HTMLDivElement | null>(null);

	const applyZipToUrl = (nextZip: string) => {
		if (typeof window === "undefined") return;
		const url = new URL(window.location.href);
		if (nextZip && nextZip.length === 5) url.searchParams.set("zip", nextZip);
		else url.searchParams.delete("zip");
		window.history.replaceState({}, "", url.toString());
	};

	useEffect(() => {
		try {
			if (zip) localStorage.setItem("impactify_zip", zip);
		} catch {
			// ignore
		}
	}, [zip]);

	const selected = useMemo(
		() => reps.find((r) => r.id === selectedId) ?? reps[0] ?? null,
		[reps, selectedId],
	);

	const onSelect = (id: string) => {
		setSelectedId(id);
		requestAnimationFrame(() => {
			detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	return (
		<main id="main-content" className="relative">
			{/* Hero */}
			<section className="bg-parchment px-6 pb-10 pt-16 text-ink md:pt-24 dark:bg-background dark:text-[#F4EFE3]">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-muted dark:text-[#d4c9bc]">
							DIRECTORY
						</p>
						{isExample ? (
							<span className="inline-flex items-center rounded-full border border-plum-200 bg-white/60 px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-plum-700 dark:border-white/10 dark:bg-white/5 dark:text-[#d4c9bc]">
								EXAMPLE DATA
							</span>
						) : null}
					</div>
					<h1 className="mt-3 max-w-[18ch] font-serif text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
						Your representatives, with receipts.
					</h1>
					<p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted md:text-lg dark:text-[#d4c9bc]">
						Search by ZIP to focus the view, then compare votes and issue alignment.
					</p>

					<div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
						<div className="rounded-2xl border border-plum-100 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
							<label className="block text-xs font-semibold tracking-widest text-ink-muted dark:text-[#9d8f7f]">
								ZIP LOOKUP
							</label>
							<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="relative flex-1">
									<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-[#9d8f7f]" />
									<input
										value={zip}
										onChange={(e) => setZip(clampZip(e.target.value))}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												applyZipToUrl(zip);
											}
										}}
										onBlur={() => applyZipToUrl(zip)}
										inputMode="numeric"
										pattern="[0-9]*"
										placeholder="e.g. 11201"
										className={cn(
											"w-full rounded-xl border border-plum-100 bg-parchment py-3 pl-10 pr-10 text-sm text-ink",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
											"dark:border-white/10 dark:bg-[#0E0A14] dark:text-[#F4EFE3] dark:focus-visible:ring-offset-[#0E0A14]",
										)}
										aria-label="ZIP code"
									/>
									{zip ? (
										<button
											type="button"
											onClick={() => {
												setZip("");
												applyZipToUrl("");
											}}
											className={cn(
												"absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full",
												"text-ink-muted transition-colors hover:bg-plum-50 hover:text-plum-700",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
												"dark:text-[#9d8f7f] dark:hover:bg-white/10 dark:hover:text-[#F4EFE3] dark:focus-visible:ring-offset-[#0E0A14]",
											)}
											aria-label="Clear ZIP"
										>
											<X className="h-4 w-4" aria-hidden />
										</button>
									) : null}
								</div>
								<button
									type="button"
									onClick={() => {
										requestAnimationFrame(() => {
											detailRef.current?.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
										});
									}}
									className={cn(
										"inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold",
										"bg-chartreuse-500 text-[#0E0A14] transition-colors hover:bg-chartreuse-700",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-[#0E0A14]",
									)}
								>
									Review reps <ArrowRight className="h-4 w-4" aria-hidden />
								</button>
							</div>
							{isExample ? (
								<p className="mt-3 text-xs text-ink-muted dark:text-[#9d8f7f]">
									{dataNote ?? "Example dataset."}
								</p>
							) : null}
						</div>

						<div className="flex flex-wrap gap-3 md:justify-end">
							<Link
								href="/"
								className="inline-flex min-h-12 items-center justify-center rounded-xl border border-plum-100 bg-parchment px-4 text-sm font-semibold text-ink transition-colors hover:bg-plum-50 dark:border-white/10 dark:bg-white/5 dark:text-[#F4EFE3] dark:hover:bg-white/10"
							>
								Back home
							</Link>
							<Link
								href="/news"
								className="inline-flex min-h-12 items-center justify-center rounded-xl bg-plum-700 px-4 text-sm font-semibold text-parchment transition-colors hover:bg-plum-500 dark:bg-chartreuse-500 dark:text-[#0E0A14] dark:hover:bg-chartreuse-700"
							>
								Read briefing
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Results + detail */}
			<section className="bg-parchment px-6 pb-16 pt-10 text-ink dark:bg-background dark:text-[#F4EFE3]">
				<div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
					{/* Results */}
					<div>
						<div className="flex items-end justify-between gap-4">
							<div>
								<p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-muted dark:text-[#9d8f7f]">
									RESULTS
								</p>
								<h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
									Compare at a glance
								</h2>
								<p className="mt-2 max-w-prose text-sm text-ink-muted dark:text-[#d4c9bc]">
									Alignment is based on your selected issues. Click a card for votes and details.
								</p>
							</div>
						</div>

						{reps.length === 0 ? (
							<div className="mt-6 rounded-2xl border border-plum-100 bg-white/70 p-6 text-sm text-ink-muted dark:border-white/10 dark:bg-white/5 dark:text-[#d4c9bc]">
								No representatives found for this ZIP yet.
							</div>
						) : (
							<div className="mt-6 grid gap-4 sm:grid-cols-2">
							{reps.map((r) => {
								const pct = overallAlignment(r, activeCauses);
								const on = r.id === selected?.id;
								return (
									<button
										key={r.id}
										type="button"
										onClick={() => onSelect(r.id)}
										className={cn(
											"w-full rounded-2xl border p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out active:scale-[0.99]",
											on
												? "border-[#0E0A14] bg-white shadow-sm dark:border-white/20 dark:bg-white/10"
												: "border-plum-100 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-[#0E0A14]",
										)}
										aria-pressed={on}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="truncate text-sm font-semibold">{r.name}</div>
												<div className="mt-1 text-xs text-ink-muted dark:text-[#d4c9bc]">
													{r.chamber} · {r.party} · {r.state}
												</div>
											</div>
											<div
												className="grid h-11 w-11 place-items-center rounded-full border bg-parchment text-sm font-semibold dark:bg-[#0E0A14]"
												style={{ borderColor: ringColor(pct) }}
												aria-label={`Overall alignment ${pct}%`}
											>
												{pct}
											</div>
										</div>

										<div className="mt-3 flex flex-wrap gap-2">
											{topAlignedCauses(r, activeCauses, 3).map((c) => (
												<span
													key={c.key}
													className="inline-flex items-center rounded-full border border-plum-100 bg-parchment px-3 py-1 text-[11px] font-semibold text-ink-muted dark:border-white/10 dark:bg-[#0E0A14] dark:text-[#d4c9bc]"
												>
													{c.key.toUpperCase()} · {c.value}%
												</span>
											))}
										</div>
									</button>
								);
							})}
							</div>
						)}
					</div>

					{/* Detail */}
					<div ref={detailRef} id="detail" className="scroll-mt-24">
						<div className="rounded-2xl border border-plum-100 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
							<p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-muted dark:text-[#9d8f7f]">
								DETAIL
							</p>
							<h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">
								{selected?.name ?? "Select a representative"}
							</h2>

							{selected ? (
								<>
									<p className="mt-2 text-sm text-ink-muted dark:text-[#d4c9bc]">
										{selected.chamber} · {selected.party} · {selected.state} · Votes with party{" "}
										{formatPct(selected.votesWithPartyPct)} · Missed votes{" "}
										{formatPct(selected.missedVotesPct)}
									</p>

									<div className="mt-5">
										<p className="text-xs font-semibold tracking-widest text-ink-muted dark:text-[#9d8f7f]">
											YOUR ISSUES
										</p>
										<div className="mt-3 flex flex-wrap gap-2">
											{CAUSES.map((c) => {
												const on = activeCauses.has(c.id);
												return (
													<button
														key={c.id}
														type="button"
														onClick={() => toggleCause(c.id)}
														className={cn(
															"inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
															on
																? "border-[#0E0A14] bg-[#0E0A14] text-white dark:border-[#F4EFE3] dark:bg-[#F4EFE3] dark:text-[#0E0A14]"
																: "border-plum-100 bg-parchment text-ink-muted hover:bg-plum-50 dark:border-white/10 dark:bg-[#0E0A14] dark:text-[#d4c9bc] dark:hover:bg-white/10",
															"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-[#0E0A14]",
														)}
														aria-pressed={on}
													>
														{c.label}
													</button>
												);
											})}
										</div>
									</div>

									<div className="mt-6">
										<p className="text-xs font-semibold tracking-widest text-ink-muted dark:text-[#9d8f7f]">
											RECENT VOTES
										</p>
										<div className="mt-3 space-y-2 lg:max-h-[48vh] lg:overflow-auto lg:pr-1">
											{selected.votes.slice(0, 5).map((v, idx) => (
												<div
													key={`${v.bill}-${idx}`}
													className="rounded-xl border border-plum-100 bg-parchment p-3 dark:border-white/10 dark:bg-[#0E0A14]"
												>
													<div className="flex items-start justify-between gap-3">
														<div className="min-w-0">
															<div className="truncate text-sm font-semibold text-ink dark:text-[#F4EFE3]">
																{v.bill}
															</div>
															<div className="mt-1 text-xs text-ink-muted dark:text-[#d4c9bc]">
																{v.date}
																{typeof v.match === "boolean"
																	? v.match
																		? " · matches your issues"
																		: " · conflicts with your issues"
																	: null}
															</div>
														</div>
														<div className="flex items-center gap-2">
															<span
																className={cn(
																	"inline-flex h-7 items-center rounded-full border px-3 font-mono text-[10px] font-semibold tracking-[0.18em]",
																	voteBadge(v.vote),
																)}
															>
																{v.vote}
															</span>
															{v.billUrl ? (
																<a
																	href={v.billUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-plum-100 bg-white/70 text-ink-muted transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#d4c9bc] dark:hover:bg-white/10"
																	aria-label="Open bill link"
																>
																	<ExternalLink className="h-4 w-4" aria-hidden />
																</a>
															) : null}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</>
							) : (
								<p className="mt-4 text-sm text-ink-muted dark:text-[#d4c9bc]">
									Choose a representative to see votes and alignment.
								</p>
							)}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

