"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ISSUE_LABELS } from "@/lib/reps/issue-palette";
import { cn } from "@/lib/utils";

export type BentoRepParty = "Democrat" | "Republican" | "Independent";

export interface BentoRepCardModel {
	id: string;
	name: string;
	photoUrl: string;
	office: string;
	party: string;
	state: string;
	alignmentScore: number;
	issueAlignment: Record<string, number>;
}

const PARTY_COLORS: Record<
	BentoRepParty,
	{ bg: string; accent: string; badgeText: string }
> = {
	Democrat: { bg: "#EEF2FF", accent: "#2563EB", badgeText: "#FFFFFF" },
	Republican: { bg: "#FEE2E2", accent: "#DC2626", badgeText: "#FFFFFF" },
	Independent: { bg: "#FFFAEB", accent: "#D97706", badgeText: "#1F2937" },
};

function normalizeParty(p: string): BentoRepParty {
	if (p === "Democrat" || p === "Republican" || p === "Independent") {
		return p;
	}
	return "Independent";
}

/** Darker shades for large percentage text on white (stronger than AA on large text). */
function getAlignmentScoreColor(score: number) {
	if (score >= 85) return "#047857";
	if (score >= 70) return "#B45309";
	return "#B91C1C";
}

interface BentoRepCardProps {
	rep: BentoRepCardModel;
	isSelected: boolean;
	onClick: () => void;
	/** Larger footprint when placed in a 2×2 bento cell (desktop). */
	layoutVariant?: "featured" | "compact";
	/** Stagger index for page-load card entrance (100ms per step). */
	staggerIndex?: number;
}

export function BentoRepCard({
	rep,
	isSelected,
	onClick,
	layoutVariant = "compact",
	staggerIndex = 0,
}: BentoRepCardProps) {
	const reducedMotion = usePrefersReducedMotion();
	const party = normalizeParty(rep.party);
	const partyColor = PARTY_COLORS[party];
	const alignmentColor = getAlignmentScoreColor(rep.alignmentScore);

	const topIssues = Object.entries(rep.issueAlignment)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 3);

	const isFeatured = layoutVariant === "featured";

	return (
		<button
			type="button"
			aria-pressed={isSelected}
			aria-label={`${rep.name}, ${rep.office}. ${rep.alignmentScore}% aligned. ${isSelected ? "Selected" : "Select to view record"}.`}
			onClick={onClick}
			className={cn(
				"reps-bento-card grid h-full w-full grid-cols-1 overflow-hidden rounded-xl border bg-white text-left shadow-[0_4px_12px_rgba(74,19,71,0.08)] sm:grid-cols-2",
				isSelected && "is-selected",
				!reducedMotion && "reps-card-stagger",
				isFeatured
					? "min-h-[300px] sm:min-h-[320px] xl:min-h-[380px]"
					: "min-h-[260px] sm:min-h-[270px] xl:min-h-[290px]",
			)}
			style={{
				["--reps-i" as string]: staggerIndex,
				borderColor: isSelected ? "#D4F25A" : "#D4C4B8",
				borderWidth: isSelected ? 2 : 1,
				cursor: "pointer",
				padding: 0,
				font: "inherit",
			}}
		>
			<div
				className={`relative overflow-hidden sm:min-h-0 ${isFeatured ? "min-h-[220px] xl:min-h-[300px]" : "min-h-[200px] xl:min-h-[220px]"}`}
				style={{ background: partyColor.bg }}
			>
				<img
					src={rep.photoUrl}
					alt={`${rep.name}, ${rep.office}, ${party}, ${rep.state}`}
					className="reps-bento-photo h-full w-full object-cover"
					style={{
						minHeight: isFeatured ? 220 : 200,
					}}
					loading="lazy"
					decoding="async"
					onError={(e) => {
						(e.target as HTMLImageElement).src =
							`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rep.name)}`;
					}}
				/>
				<div
					className="absolute bottom-3 left-3 rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider"
					style={{
						background: partyColor.accent,
						color: partyColor.badgeText,
					}}
				>
					{party}
				</div>
			</div>

			<div className="flex flex-col justify-between p-5">
				<div>
					<h3
						className={`mb-1 font-serif font-bold text-[#4A1347] ${isFeatured ? "text-[clamp(17px,4vw,22px)]" : "text-[clamp(16px,4vw,18px)]"}`}
					>
						{rep.name}
					</h3>
					<p className="mb-4 font-mono text-[clamp(12px,3vw,13px)] tracking-wide text-[#5B4A56]">
						{rep.office}
					</p>

					<div className="mb-4">
						<div className="mb-2 flex items-baseline gap-2">
							<span
								className={`font-serif font-bold ${isFeatured ? "text-[clamp(32px,7vw,44px)]" : "text-[clamp(28px,8vw,36px)]"}`}
								style={{ color: alignmentColor }}
							>
								{rep.alignmentScore}%
							</span>
							<span className="font-mono text-[11px] uppercase tracking-wider text-[#5B4A56]">
								aligned
							</span>
						</div>

						<div className="flex flex-col gap-1">
							{topIssues.map(([issue, score], barIdx) => (
								<div key={issue} className="flex items-center gap-1.5">
									<span className="min-w-18 font-mono text-[clamp(11px,3vw,12px)] capitalize text-[#5B4A56]">
										{ISSUE_LABELS[issue] ?? issue}
									</span>
									<div className="reps-issue-bar-track h-[3px] flex-1 overflow-hidden rounded-full bg-[#E5DDD3]">
										<div
											className={cn(
												"reps-issue-bar-fill h-full rounded-full",
												reducedMotion && "reps-issue-bar-fill--static",
											)}
											style={{
												background: alignmentColor,
												width: `${score}%`,
												["--reps-bar-i" as string]: barIdx,
												["--reps-base-delay" as string]: reducedMotion
													? "0ms"
													: `calc(${staggerIndex} * 100ms + 250ms)`,
											}}
										/>
									</div>
									<span className="min-w-8 text-right font-mono text-[clamp(11px,3vw,12px)] font-semibold text-[#4A1347]">
										{score}%
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<span
					className="rounded-md border font-mono text-[clamp(12px,3vw,13px)] font-semibold tracking-wide transition-colors duration-200"
					style={{
						display: "block",
						padding: "10px 12px",
						background: isSelected ? "#D4F25A" : "#F7F2E8",
						color: isSelected ? "#000" : "#4A1347",
						border: isSelected ? "none" : "1px solid #D4C4B8",
						textAlign: "center",
					}}
				>
					{isSelected ? "✓ Selected" : "View record"}
				</span>
			</div>
		</button>
	);
}
