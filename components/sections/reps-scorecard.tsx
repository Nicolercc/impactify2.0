"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/layout/section";
import {
	CAUSES,
	LANDING_CAUSES,
	LANDING_CAUSE_IDS,
	MOCK_REPS,
	STATE_ABBREVIATIONS,
} from "@/lib/reps/mock-data";
import {
	overallAlignment,
	ringColor,
	topAlignedCauses,
	voteBadge,
} from "@/lib/reps/scorecard-utils";
import type { CauseKey, Rep, VoteRow } from "@/lib/reps/types";
import { cn } from "@/lib/utils";

function useClientZip(): string | null {
	const [zip, setZip] = useState<string | null>(null);
	useEffect(() => {
		try {
			setZip(localStorage.getItem("impactify_zip"));
		} catch {
			setZip(null);
		}
	}, []);
	return zip;
}

function formatLastUpdated(iso: string | undefined): string {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return iso;
	}
}

// ─── Cause filter (landing: 3 issues only) ───
interface CauseFilterBarProps {
	active: Set<CauseKey>;
	onToggle: (causeId: CauseKey) => void;
}

function CauseFilterBar({ active, onToggle }: CauseFilterBarProps) {
	return (
		<div>
			<div className="flex flex-wrap gap-2">
				{LANDING_CAUSES.map((c) => {
					const on = active.has(c.id);
					return (
						<button
							key={c.id}
							type="button"
							onClick={() => onToggle(c.id)}
							className={cn(
								"inline-flex h-11 min-h-11 items-center rounded-full border px-4 text-sm font-medium",
								"transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.98]",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-bg-2",
								on
									? "border-[#0E0A14] bg-[#0E0A14] text-white shadow-sm dark:border-[#F4EFE3] dark:bg-[#F4EFE3] dark:text-[#0E0A14]"
									: "border-plum-100 bg-parchment text-ink hover:bg-plum-50 hover:text-plum-700 dark:border-[rgba(244,239,227,0.15)] dark:bg-[#2b1a35] dark:text-[#d4c9bc] dark:hover:bg-[#3d2845] dark:hover:text-[#F4EFE3]",
							)}
						>
							{c.label}
						</button>
					);
				})}
			</div>
			{active.size === 0 ? (
				<p className="mt-3 text-sm text-ink-muted dark:text-muted-foreground">
					Select at least one cause to calculate alignment.
				</p>
			) : null}
		</div>
	);
}

// ─── Rep tabs ───
interface RepSelectorProps {
	reps: Rep[];
	selected: string;
	onSelect: (repId: string) => void;
}

function RepSelector({ reps, selected, onSelect }: RepSelectorProps) {
	return (
		<div
			role="tablist"
			aria-label="Choose a representative"
			className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{reps.map((r) => {
				const on = r.id === selected;
				const lastName = r.name.split(" ").pop() ?? r.name;
				const stateCode =
					STATE_ABBREVIATIONS[r.state] ?? r.state.slice(0, 2).toUpperCase();

				return (
					<button
						key={r.id}
						type="button"
						role="tab"
						aria-selected={on}
						id={`rep-tab-${r.id}`}
						onClick={() => onSelect(r.id)}
						className={cn(
							"inline-flex h-12 min-h-12 min-w-0 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold",
							"transition-[background-color,color,transform,box-shadow,ring] duration-200 ease-out active:scale-[0.96]",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-bg-2",
							on
								? "bg-[#0E0A14] text-white shadow-md dark:bg-[#F4EFE3] dark:text-[#0E0A14]"
								: "bg-parchment text-ink ring-1 ring-plum-100 hover:bg-plum-50 hover:text-plum-900 dark:bg-[#ede6dc] dark:text-[#1a1410] dark:ring-transparent dark:hover:bg-[#f5efe8]",
						)}
					>
						<span className="font-serif">{lastName}</span>
						<span className="text-xs opacity-70" aria-hidden>
							·
						</span>
						<span className="font-mono text-xs font-bold">{stateCode}</span>
					</button>
				);
			})}
		</div>
	);
}

// ─── Top cause breakdown (max 3) ───
interface CauseBreakdownProps {
	rep: Rep;
	activeCauses: Set<CauseKey>;
}

function CauseBreakdown({ rep, activeCauses }: CauseBreakdownProps) {
	const rows = topAlignedCauses(rep, activeCauses, 3);

	if (rows.length === 0) {
		return (
			<p className="text-sm text-ink-muted dark:text-[#d4c9bc]">
				Select causes above to see per-issue alignment for this representative.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:gap-5">
			{rows.map(({ key, value }) => {
				const label =
					LANDING_CAUSES.find((c) => c.id === key)?.label ??
					CAUSES.find((c) => c.id === key)?.label ??
					key;
				return (
					<div
						key={key}
						className="space-y-1.5"
						role="progressbar"
						aria-label={`${label}: ${value}% aligned with your selected causes`}
						aria-valuenow={value}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuetext={`${value}%`}
					>
						<div className="flex items-center justify-between gap-2">
							<span
								className="text-sm font-medium text-ink dark:text-[#F4EFE3]"
								id={`cause-label-${key}`}
							>
								{label}
							</span>
							<span className="font-mono text-sm font-semibold text-ink-muted dark:text-[#F4EFE3] tabular-nums">
								{value}%
							</span>
						</div>
						<div
							className="h-3 overflow-hidden rounded-full bg-plum-100 dark:bg-[rgba(255,255,255,0.06)]"
							aria-hidden
						>
							<div
								className={cn(
									"h-full rounded-full",
									value >= 70
										? "bg-chartreuse-500"
										: value >= 50
											? "bg-peach-400"
											: "bg-peach-600",
								)}
								style={{
									width: `${value}%`,
									transition: "width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// ─── Alignment ring (100px mobile, 160px desktop) ───
interface AlignmentRingProps {
	activeCauses: Set<CauseKey>;
	pct: number;
}

function AlignmentRing({ activeCauses, pct }: AlignmentRingProps) {
	const radius = 52;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = useMemo(() => {
		return circumference - (pct / 100) * circumference;
	}, [pct, circumference]);

	const causeLabel =
		activeCauses.size === 0
			? "No causes selected"
			: `${pct}% aligned with selected causes`;

	const expl =
		activeCauses.size === 0
			? "Select at least one cause to see how this score is calculated."
			: `Average of scores on your selected causes (top three shown below).`;

	return (
		<div className="w-full min-w-0 shrink-0">
			{/* Ring + label stack until the *card* is wide enough; avoids cramming beside avatar/name in narrow columns */}
			<div className="flex flex-col items-center gap-4 text-center @min-[380px]/rep-card:flex-row @min-[380px]/rep-card:items-center @min-[380px]/rep-card:gap-6 @min-[380px]/rep-card:text-left">
				<div
					className="relative mx-auto h-[100px] w-[100px] shrink-0 @min-[380px]/rep-card:mx-0 md:h-[160px] md:w-[160px]"
					aria-label={causeLabel}
				>
					<svg
						className="h-full w-full -rotate-90"
						viewBox="0 0 120 120"
						role="img"
						aria-hidden
					>
						<circle
							cx="60"
							cy="60"
							r={radius}
							stroke="var(--plum-100)"
							strokeWidth="10"
							fill="none"
						/>
						<circle
							cx="60"
							cy="60"
							r={radius}
							stroke={ringColor(pct)}
							strokeWidth="10"
							fill="none"
							strokeDasharray={`${circumference} ${circumference}`}
							strokeDashoffset={dashOffset}
							strokeLinecap="round"
							style={{
								transition:
									"stroke-dashoffset 800ms cubic-bezier(0.22, 1, 0.36, 1), stroke 400ms ease",
							}}
						/>
					</svg>
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
						<span className="font-serif text-2xl font-semibold text-plum-700 tabular-nums dark:text-[#F4EFE3] md:text-4xl">
							{pct}%
						</span>
						<span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted dark:text-[#9d8f7f]">
							aligned
						</span>
					</div>
				</div>

				<div className="min-w-0 flex-1 space-y-2">
					<p className="text-base font-semibold leading-snug text-ink dark:text-[#F4EFE3]">
						Alignment
					</p>
					<p className="text-sm leading-relaxed text-ink-muted dark:text-[#d4c9bc]">
						{expl}
					</p>
				</div>
			</div>
		</div>
	);
}

function VoteHistory({ votes }: { votes: VoteRow[] }) {
	return (
		<ul className="space-y-4 border-t border-plum-100/60 pt-6 dark:border-[rgba(244,239,227,0.08)]">
			{votes.slice(0, 5).map((v, idx) => (
				<li key={`${v.bill}-${v.date}-${idx}`}>
					<div className="flex items-start gap-3 rounded-xl py-1 sm:gap-4">
						<div className="mt-1 shrink-0">
							{v.match ? (
								<>
									<CheckCircle2
										className="h-6 w-6 text-sage-400 sm:h-5 sm:w-5"
										aria-hidden="true"
									/>
									<span className="sr-only">Aligned with your causes</span>
								</>
							) : (
								<>
									<XCircle
										className="h-6 w-6 text-peach-600 sm:h-5 sm:w-5"
										aria-hidden="true"
									/>
									<span className="sr-only">Not aligned with preview model</span>
								</>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
								<div className="min-w-0 flex-1">
									{v.billUrl ? (
										<a
											href={v.billUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="group inline-flex items-start gap-1.5 text-left text-base font-medium leading-snug text-ink underline decoration-plum-200 underline-offset-2 transition-colors hover:text-plum-700 dark:text-[#F4EFE3] dark:decoration-white/20 dark:hover:text-white"
										>
											<span className="min-w-0">{v.bill}</span>
											<ExternalLink
												className="mt-0.5 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100"
												aria-hidden
											/>
											<span className="sr-only">(opens Congress.gov)</span>
										</a>
									) : (
										<span className="text-base font-medium leading-snug text-ink dark:text-[#F4EFE3]">
											{v.bill}
										</span>
									)}
								</div>
								<span
									className={cn(
										"inline-flex w-fit shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] sm:px-2.5 sm:py-0.5 sm:text-[10px]",
										voteBadge(v.vote),
									)}
								>
									{v.vote}
								</span>
							</div>
							<div className="mt-1 text-xs text-ink-muted dark:text-[#9d8f7f]">
								{v.date}
							</div>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
}

interface RepCardProps {
	rep: Rep;
	activeCauses: Set<CauseKey>;
	isExample: boolean;
}

function RepCard({ rep, activeCauses, isExample }: RepCardProps) {
	const pct = useMemo(
		() => overallAlignment(rep, activeCauses),
		[rep, activeCauses],
	);

	const partyLine =
		typeof rep.votesWithPartyPct === "number"
			? `${rep.votesWithPartyPct}% with party`
			: null;
	const missed =
		typeof rep.missedVotesPct === "number"
			? `${rep.missedVotesPct}% missed`
			: null;

	return (
		<div
			className={cn(
				"mt-4 overflow-hidden rounded-3xl border border-plum-100/80 bg-parchment p-6 shadow-[0_24px_70px_rgba(43,11,42,0.10)] transition-[transform,box-shadow] duration-200 ease-out @container/rep-card md:p-8",
				"dark:border-[rgba(244,239,227,0.10)] dark:bg-linear-to-b dark:from-[#2b1a35] dark:to-[#1a0618] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]",
			)}
		>
			{isExample ? (
				<p className="mb-4 rounded-xl border border-peach-500/30 bg-peach-500/10 px-3 py-2 font-dm-sans-stack text-sm text-peach-800 dark:border-[#E07856]/35 dark:bg-[#E07856]/10 dark:text-[#f0c9bc]">
					(Example — configure ProPublica + GovTrack for live photos and roll
					calls.)
				</p>
			) : null}
			{/*
			  Never use viewport `lg:flex-row` here: the card often sits in a ~50% column
			  (~400px). Container queries only split when the card itself is wide enough.
			*/}
			<div className="isolate grid grid-cols-1 gap-8 @min-[540px]/rep-card:grid-cols-2 @min-[540px]/rep-card:items-start @min-[540px]/rep-card:gap-x-10 @min-[540px]/rep-card:gap-y-0">
				<div className="min-w-0">
					<div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
						<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-plum-100 bg-plum-50 dark:border-[rgba(244,239,227,0.12)] dark:bg-[#3d2845]">
							{rep.photoUrl ? (
								<img
									src={rep.photoUrl}
									alt=""
									width={200}
									height={200}
									loading="lazy"
									decoding="async"
									className="h-full w-full object-cover object-top"
								/>
							) : (
								<div
									className="grid h-full w-full place-items-center text-lg font-semibold text-parchment"
									style={{
										background: `linear-gradient(135deg, ${rep.accent}, rgba(74,19,71,0.95))`,
									}}
									aria-hidden
								>
									<span className="font-mono tracking-[0.08em]">
										{rep.initials}
									</span>
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<h3 className="wrap-break-word font-serif text-xl font-semibold text-ink dark:text-[#F4EFE3] md:text-2xl">
								{rep.name}
							</h3>
							<p className="mt-0.5 text-sm text-ink-muted dark:text-[#d4c9bc]">
								{rep.state} · {rep.party} · {rep.chamber.replace("U.S. ", "")}
							</p>
							{partyLine || missed ? (
								<p className="mt-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-muted dark:text-[#9d8f7f]">
									{[partyLine, missed].filter(Boolean).join(" · ")}
								</p>
							) : null}
						</div>
					</div>

					<div className="mt-8">
						<p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted dark:text-[#9d8f7f]">
							Top causes (your picks)
						</p>
						<CauseBreakdown rep={rep} activeCauses={activeCauses} />
					</div>
				</div>

				<div className="w-full min-w-0">
					<AlignmentRing activeCauses={activeCauses} pct={pct} />
					<div className="mt-8">
						<p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted dark:text-[#9d8f7f]">
							Recent votes
						</p>
						<VoteHistory votes={rep.votes} />
					</div>
				</div>
			</div>
		</div>
	);
}

function ScorecardSkeleton() {
	return (
		<div
			className="mt-4 animate-pulse rounded-3xl border border-plum-100/60 bg-parchment/80 p-6 @container/rep-card md:p-8 dark:border-[rgba(244,239,227,0.08)] dark:bg-[#2b1a35]/50"
			aria-hidden
		>
			<div className="grid grid-cols-1 gap-6 @min-[540px]/rep-card:grid-cols-2 @min-[540px]/rep-card:gap-8">
				<div className="min-w-0 space-y-4">
					<div className="flex gap-4">
						<div className="h-20 w-20 shrink-0 rounded-full bg-plum-100 dark:bg-[#3d2845]" />
						<div className="min-w-0 flex-1 space-y-2 pt-1">
							<div className="h-6 w-3/5 max-w-full rounded bg-plum-100 dark:bg-[#3d2845]" />
							<div className="h-4 w-2/5 max-w-full rounded bg-plum-100/80 dark:bg-[#3d2845]/80" />
						</div>
					</div>
					<div className="space-y-3 pt-4">
						<div className="h-3 w-full rounded-full bg-plum-100 dark:bg-[#3d2845]" />
						<div className="h-3 w-full rounded-full bg-plum-100 dark:bg-[#3d2845]" />
					</div>
				</div>
				<div className="h-48 w-full rounded-2xl bg-plum-100/90 dark:bg-[#3d2845]" />
			</div>
		</div>
	);
}

type RepsApiPayload = {
	reps?: Rep[];
	isExample?: boolean;
	lastUpdated?: string;
	dataNote?: string;
};

export function RepsScorecard() {
	const clientZip = useClientZip();
	const [reps, setReps] = useState<Rep[]>(MOCK_REPS);
	const [repId, setRepId] = useState(MOCK_REPS[0]!.id);
	const [loadState, setLoadState] = useState<"loading" | "ready">("loading");
	const [meta, setMeta] = useState<{
		isExample: boolean;
		lastUpdated?: string;
		dataNote?: string;
	}>({ isExample: true });

	const [activeCauses, setActiveCauses] = useState<Set<CauseKey>>(
		() => new Set<CauseKey>([...LANDING_CAUSE_IDS]),
	);

	const repsHref = `/reps${clientZip ? `?zip=${encodeURIComponent(clientZip)}` : ""}`;

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/reps");
				const data = (await res.json()) as RepsApiPayload;
				if (
					!cancelled &&
					Array.isArray(data.reps) &&
					data.reps.length > 0
				) {
					setReps(data.reps);
					setMeta({
						isExample: Boolean(data.isExample),
						lastUpdated: data.lastUpdated,
						dataNote: data.dataNote,
					});
				}
			} catch {
				/* mock */
			} finally {
				if (!cancelled) setLoadState("ready");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!reps.some((r) => r.id === repId) && reps[0]) {
			setRepId(reps[0].id);
		}
	}, [reps, repId]);

	const rep = useMemo(
		() => reps.find((r) => r.id === repId) ?? reps[0]!,
		[repId, reps],
	);

	return (
		<Section id="reps" tone="parchment-alt" className="relative">
			<div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
				<div className="lg:sticky lg:top-24 lg:self-start">
					<h2 className="font-serif text-[2.25rem] leading-[1.08] tracking-[-0.03em] text-plum-700 dark:text-foreground md:text-[3rem] lg:text-[3.25rem]">
						Your Representatives.{" "}
						<em className="font-serif italic text-peach-600 dark:text-[#E07856]">
							Aligned.
						</em>
					</h2>

					<p className="mt-5 max-w-[56ch] font-dm-sans-stack text-[1.0625rem] leading-[1.6] text-ink-muted dark:text-[#d4c9bc] md:text-[1.125rem]">
						See how your elected officials vote on the issues you care about.
					</p>

					<div className="mt-7">
						<CauseFilterBar
							active={activeCauses}
							onToggle={(causeId) => {
								if (!LANDING_CAUSE_IDS.includes(causeId)) return;
								setActiveCauses((prev) => {
									const next = new Set(prev);
									if (next.has(causeId)) next.delete(causeId);
									else next.add(causeId);
									return next;
								});
							}}
						/>
					</div>

					<div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
						<Link
							href={repsHref}
							className="inline-flex h-14 min-h-14 items-center justify-center rounded-full bg-chartreuse-500 px-8 text-base font-semibold text-[#0E0A14] shadow-[0_16px_40px_rgba(180,230,80,0.25)] transition-colors hover:bg-chartreuse-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-bg-2"
						>
							Find My Representatives{" "}
							<ArrowRight className="ml-2 h-5 w-5" aria-hidden />
						</Link>
						<Link
							href="/reps"
							className="inline-flex h-14 items-center justify-center px-4 text-base font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink dark:text-[#c4b8a8] dark:hover:text-[#F4EFE3]"
						>
							Browse by state
						</Link>
					</div>

					<div className="mt-8 space-y-2 border-t border-plum-100/70 pt-6 text-sm text-ink-muted dark:border-[rgba(244,239,227,0.08)] dark:text-[#9d8f7f]">
						<p>Data from ProPublica Congress API.</p>
						<p>Last updated: {formatLastUpdated(meta.lastUpdated)}</p>
						<p>Real voting records from Congress.gov when bill links are available.</p>
						{meta.dataNote ? (
							<p className="text-peach-700 dark:text-[#E07856]">{meta.dataNote}</p>
						) : null}
					</div>
				</div>

				<div className="min-w-0">
					<RepSelector reps={reps} selected={repId} onSelect={setRepId} />
					<div
						role="tabpanel"
						aria-labelledby={`rep-tab-${repId}`}
					>
						{loadState === "loading" ? (
							<ScorecardSkeleton />
						) : (
							<RepCard
								rep={rep}
								activeCauses={activeCauses}
								isExample={meta.isExample}
							/>
						)}
					</div>
				</div>
			</div>
		</Section>
	);
}
