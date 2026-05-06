"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

type CauseKey = "climate" | "housing" | "democracy" | "labor" | "health";
type VoteRow = {
	bill: string;
	date: string;
	match: boolean;
	vote: "YEA" | "NAY";
};

type Rep = {
	id: string;
	name: string;
	state: string;
	party: "Democrat" | "Republican" | "Independent";
	chamber: "U.S. SENATE" | "U.S. HOUSE";
	initials: string;
	accent: string;
	aligned: Record<CauseKey, number>;
	votes: VoteRow[];
};

const CAUSES: { id: CauseKey; label: string; tint: string }[] = [
	{
		id: "climate",
		label: "Climate",
		tint: "bg-cause-climate/15 text-cause-climate border-cause-climate/30",
	},
	{
		id: "housing",
		label: "Housing",
		tint: "bg-cause-housing/15 text-cause-housing border-cause-housing/30",
	},
	{
		id: "democracy",
		label: "Democracy",
		tint: "bg-cause-democracy/15 text-cause-democracy border-cause-democracy/30",
	},
	{
		id: "labor",
		label: "Labor",
		tint: "bg-cause-labor/15 text-cause-labor border-cause-labor/30",
	},
	{
		id: "health",
		label: "Health",
		tint: "bg-cause-health/15 text-cause-health border-cause-health/30",
	},
];

const REPS: Rep[] = [
	{
		id: "gonzalez",
		name: "Sen. Maria Gonzalez",
		state: "California",
		party: "Democrat",
		chamber: "U.S. SENATE",
		initials: "MG",
		accent: "#5DA8E0",
		aligned: { climate: 92, housing: 78, democracy: 88, labor: 81, health: 70 },
		votes: [
			{
				bill: "Climate Action Bill (S.1234)",
				date: "Mar 15",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Voting Rights Act (H.R. 4)",
				date: "Mar 8",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Defense Budget Amendment",
				date: "Feb 28",
				match: false,
				vote: "YEA",
			},
			{
				bill: "Rent Stabilization (A.1234)",
				date: "Feb 14",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Offshore Wind Approval",
				date: "Feb 2",
				match: true,
				vote: "YEA",
			},
		],
	},
	{
		id: "harlan",
		name: "Rep. James Harlan",
		state: "Texas",
		party: "Republican",
		chamber: "U.S. HOUSE",
		initials: "JH",
		accent: "#E07856",
		aligned: { climate: 41, housing: 55, democracy: 46, labor: 38, health: 52 },
		votes: [
			{
				bill: "Clean Grid Incentives (H.R. 221)",
				date: "Mar 12",
				match: false,
				vote: "NAY",
			},
			{
				bill: "Border Security Package",
				date: "Mar 5",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Workplace Safety Rule (H.R. 88)",
				date: "Feb 27",
				match: false,
				vote: "NAY",
			},
			{
				bill: "Affordable Housing Credits",
				date: "Feb 16",
				match: true,
				vote: "YEA",
			},
			{ bill: "Prescription Cap Act", date: "Feb 1", match: true, vote: "YEA" },
		],
	},
	{
		id: "okafor",
		name: "Rep. Adaeze Okafor",
		state: "New York",
		party: "Democrat",
		chamber: "U.S. HOUSE",
		initials: "AO",
		accent: "#B888E0",
		aligned: { climate: 84, housing: 90, democracy: 79, labor: 73, health: 76 },
		votes: [
			{
				bill: "Rent Stabilization (A.1234)",
				date: "Mar 14",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Voting Access Expansion",
				date: "Mar 9",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Union Protections Act",
				date: "Feb 26",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Medicaid Bridge Funding",
				date: "Feb 11",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Fossil Subsidy Extension",
				date: "Feb 3",
				match: false,
				vote: "NAY",
			},
		],
	},
];

function clampPct(n: number) {
	return Math.max(0, Math.min(100, Math.round(n)));
}

function overallAlignment(rep: Rep, active: Set<CauseKey>): number {
	if (active.size === 0) return 0;
	let sum = 0;
	for (const k of active) sum += rep.aligned[k];
	return clampPct(sum / active.size);
}

function ringColor(pct: number) {
	if (pct >= 70) return "var(--chartreuse-500)";
	if (pct >= 50) return "var(--peach-400)";
	return "var(--rust)";
}

function voteBadge(vote: "YEA" | "NAY") {
	return vote === "YEA"
		? "bg-chartreuse-500/15 text-chartreuse-700 border-chartreuse-500/30"
		: "bg-peach-600/15 text-peach-600 border-peach-600/30";
}

export function RepsScorecard() {
	const [repId, setRepId] = useState(REPS[0]!.id);
	const [activeCauses, setActiveCauses] = useState<Set<CauseKey>>(
		() => new Set<CauseKey>(["climate", "housing", "democracy"]),
	);

	const rep = useMemo(
		() => REPS.find((r) => r.id === repId) ?? REPS[0]!,
		[repId],
	);
	const pct = useMemo(
		() => overallAlignment(rep, activeCauses),
		[rep, activeCauses],
	);

	const radius = 52;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = useMemo(() => {
		const offset = circumference - (pct / 100) * circumference;
		return offset;
	}, [pct, circumference]);

	return (
		<Section tone="parchment-alt" className="relative">
			<div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-14">
				{/* Left column (sticky on desktop) */}
				<div className="lg:sticky lg:top-24 lg:self-start">
					<div className="inline-flex items-center rounded-full bg-plum-100 px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-plum-700 dark:bg-[#3d2845] dark:text-[#d4c9bc]">
						§03 · DEMOCRACY, MEASURED
					</div>

					<h2 className="mt-5 font-serif text-[2.5rem] leading-[1.05] tracking-[-0.03em] text-plum-700 dark:text-foreground md:text-[3.5rem]">
						Your reps.{" "}
						<em className="font-serif italic text-peach-600 dark:text-[#E07856]">
							Your scorecard.
						</em>
					</h2>

					<p className="mt-5 max-w-[56ch] font-dm-sans-stack text-[1.0625rem] leading-[1.6] text-ink-muted dark:text-[#d4c9bc] md:text-[1.125rem]">
						Filter by the causes you care about. We recalculate alignment in
						real time — and show the votes underneath it.
					</p>

					<div className="mt-7">
						<div className="flex flex-wrap gap-2">
							{CAUSES.map((c) => {
								const on = activeCauses.has(c.id);
								return (
									<button
										key={c.id}
										type="button"
										onClick={() => {
											setActiveCauses((prev) => {
												const next = new Set(prev);
												if (next.has(c.id)) next.delete(c.id);
												else next.add(c.id);
												return next;
											});
										}}
										className={cn(
											"inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium",
											"transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.98]",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-bg-2",
											on
												? "shadow-sm dark:bg-chartreuse-500/10 dark:border-chartreuse-500 dark:text-chartreuse-500"
												: "border-plum-100 bg-parchment text-ink-muted hover:bg-plum-50 hover:text-plum-700 dark:border-[rgba(244,239,227,0.15)] dark:bg-transparent dark:text-[#d4c9bc] dark:hover:bg-[rgba(244,239,227,0.05)] dark:hover:text-[#F4EFE3]",
										)}
									>
										{c.label}
									</button>
								);
							})}
						</div>
						{activeCauses.size === 0 ? (
							<p className="mt-3 text-sm text-ink-muted dark:text-muted-foreground">
								Select at least one cause to calculate alignment.
							</p>
						) : null}
					</div>

					<div className="mt-8">
						<Link
							href="/reps"
							className="inline-flex items-center gap-2 rounded-full bg-plum-700 px-6 py-3 font-medium text-parchment transition-colors hover:bg-plum-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:bg-chartreuse-500 dark:text-[#0E0A14] dark:hover:bg-chartreuse-700 dark:focus-visible:ring-offset-bg-2"
						>
							Find my reps <ArrowRight className="h-4 w-4" aria-hidden />
						</Link>
					</div>
				</div>

				{/* Right column */}
				<div className="min-w-0">
					{/* Rep tabs */}
					<div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{REPS.map((r) => {
							const on = r.id === repId;
							const last = r.name.split(" ").slice(-1)[0] ?? r.name;
							return (
								<button
									key={r.id}
									type="button"
									onClick={() => setRepId(r.id)}
									className={cn(
										"inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium",
										"transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.98]",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment dark:focus-visible:ring-offset-bg-2",
										on
											? "bg-plum-700 text-parchment shadow-[0_14px_40px_rgba(74,19,71,0.18)] dark:bg-[#3d2845] dark:text-[#F4EFE3]"
											: "bg-parchment-100 text-ink-muted hover:bg-plum-50 hover:text-plum-700 dark:bg-[#2b1a35] dark:text-[#9d8f7f] dark:hover:bg-[#3d2845] dark:hover:text-[#F4EFE3]",
									)}
								>
									{last} · {r.state.slice(0, 2).toUpperCase()}
								</button>
							);
						})}
					</div>

					{/* Rep card */}
					<div
						key={rep.id}
						className={cn(
							"mt-4 overflow-hidden rounded-3xl border border-plum-200/80 bg-white/85 p-6 shadow-[0_24px_70px_rgba(43,11,42,0.10)] backdrop-blur-sm transition-[transform,box-shadow] duration-200 ease-out",
							"dark:border-[rgba(244,239,227,0.10)] dark:bg-linear-to-b dark:from-[#2b1a35] dark:to-[#1a0618] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]",
						)}
					>
						<div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
							<div className="flex-1">
								<div className="flex items-start gap-4">
									<div
										className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-lg font-semibold text-parchment"
										style={{
											background: `linear-gradient(135deg, ${rep.accent}, rgba(74,19,71,0.95))`,
										}}
										aria-hidden
									>
										<span className="font-mono tracking-[0.08em]">
											{rep.initials}
										</span>
									</div>
									<div className="min-w-0">
										<h3 className="font-serif text-xl font-semibold leading-tight text-ink dark:text-[#F4EFE3]">
											{rep.name}
										</h3>
										<p className="mt-1 text-sm leading-snug text-ink/70 dark:text-[#d4c9bc]">
											{rep.state} · {rep.party}
										</p>
										<span className="mt-2 inline-flex rounded-full bg-plum-50 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.16em] text-plum-700 dark:border dark:border-chartreuse-500/30 dark:bg-transparent dark:text-chartreuse-500">
											{rep.chamber}
										</span>
									</div>
								</div>

								{/* Per-cause bars */}
								<div className="mt-7 space-y-3">
									{CAUSES.map((c) => {
										const value = rep.aligned[c.id];
										const active = activeCauses.has(c.id);
										return (
											<div
												key={c.id}
												className="grid grid-cols-[84px_1fr_44px] items-center gap-3"
											>
												<div
													className={cn(
														"text-xs font-medium",
														"text-ink/70 dark:text-[#d4c9bc]",
													)}
												>
													{c.label}
												</div>
												<div className="h-2 overflow-hidden rounded-full bg-plum-100 dark:bg-[rgba(255,255,255,0.06)]">
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
															transition:
																"width 800ms cubic-bezier(0.22, 1, 0.36, 1)",
														}}
														aria-hidden
													/>
												</div>
												<div className="text-right font-mono text-xs font-semibold text-ink/80 dark:text-[#F4EFE3] tabular-nums">
													{value}%
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Alignment ring */}
							<div className="shrink-0">
								<div className="flex flex-wrap items-center gap-5">
									<div className="relative h-32 w-32 shrink-0">
										<svg
											className="-rotate-90"
											viewBox="0 0 120 120"
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
											<span className="font-serif text-3xl font-semibold text-plum-700 dark:text-[#F4EFE3] tabular-nums">
												{pct}%
											</span>
											<span className="text-[10px] font-medium uppercase tracking-wider text-ink/70 dark:text-[#9d8f7f]">
												aligned
											</span>
										</div>
									</div>

									<div className="min-w-[12rem] flex-1">
										<p className="font-medium text-ink dark:text-[#F4EFE3]">
											With selected causes
										</p>
										<p className="mt-1 text-sm text-ink/70 dark:text-[#d4c9bc]">
											Vote-by-vote transparency you can act on.
										</p>
									</div>
								</div>

								{/* Recent votes */}
								<ul className="mt-7 space-y-3 border-t border-plum-100/60 pt-6 dark:border-[rgba(244,239,227,0.08)]">
									{rep.votes.slice(0, 5).map((v) => (
										<li
											key={`${v.bill}-${v.date}`}
											className="flex items-start gap-3 text-sm"
										>
											{v.match ? (
												<CheckCircle2
													className="mt-0.5 h-4 w-4 shrink-0 text-sage-400"
													aria-hidden
												/>
											) : (
												<XCircle
													className="mt-0.5 h-4 w-4 shrink-0 text-peach-600"
													aria-hidden
												/>
											)}
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<span className="min-w-0 flex-1 truncate text-ink dark:text-[#F4EFE3]">
														{v.bill}
													</span>
													<span
														className={cn(
															"rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em]",
															voteBadge(v.vote),
														)}
													>
														{v.vote}
													</span>
												</div>
												<div className="mt-0.5 text-xs text-ink/65 dark:text-[#9d8f7f]">
													{v.date}
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Section>
	);
}
