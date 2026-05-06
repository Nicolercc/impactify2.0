"use client";

import Link from "next/link";
import type { EnhancedDemoVote } from "@/lib/reps/enrich-demo-vote";
import { ISSUE_LABELS, getIssuePalette } from "@/lib/reps/issue-palette";
import { cn } from "@/lib/utils";

interface VoteCardEnhancedProps {
	vote: EnhancedDemoVote;
	isExpanded: boolean;
	onToggle: () => void;
}

type AlignmentKey = "aligned" | "misaligned" | "abstained";

function getAlignmentStatus(
	repVote: EnhancedDemoVote["repVote"],
	userPosition: EnhancedDemoVote["userPosition"],
): {
	status: AlignmentKey;
	border: string;
	iconBg: string;
	iconChar: string;
	label: string;
	text: string;
} {
	if (repVote === "ABSTAIN") {
		return {
			status: "abstained",
			border: "#6B7280",
			iconBg: "rgba(107, 114, 128, 0.18)",
			iconChar: "–",
			label: "Abstained",
			text: "#374151",
		};
	}
	const aligned =
		(repVote === "YES" && userPosition === "Support") ||
		(repVote === "NO" && userPosition === "Oppose");
	if (aligned) {
		return {
			status: "aligned",
			border: "#047857",
			iconBg: "rgba(4, 120, 87, 0.15)",
			iconChar: "✓",
			label: "Aligned",
			text: "#065F46",
		};
	}
	return {
		status: "misaligned",
		border: "#B91C1C",
		iconBg: "rgba(185, 28, 28, 0.14)",
		iconChar: "✗",
		label: "Misaligned",
		text: "#991B1B",
	};
}

export function VoteCardEnhanced({
	vote,
	isExpanded,
	onToggle,
}: VoteCardEnhancedProps) {
	const alignment = getAlignmentStatus(vote.repVote, vote.userPosition);
	const totalVotes = vote.voteStats.totalVoters || 1;
	const yesPercent = (vote.voteStats.yesCount / totalVotes) * 100;
	const noPercent = (vote.voteStats.noCount / totalVotes) * 100;
	const abstainPercent = (vote.voteStats.abstainCount / totalVotes) * 100;
	const issuePalette = getIssuePalette(vote.issueCategory);

	const userShort =
		vote.userPosition === "Support"
			? "YES"
			: vote.userPosition === "Oppose"
				? "NO"
				: "NEUTRAL";

	return (
		<article
			className={cn(
				"reps-vote-article group/vote mb-3 overflow-hidden rounded-xl border-2 transition-[transform,border-color,background-color] duration-200 ease-out",
			)}
			style={{
				borderColor: `${alignment.border}33`,
				background: `${alignment.border}0d`,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = alignment.border;
				e.currentTarget.style.background = `${alignment.border}18`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = `${alignment.border}33`;
				e.currentTarget.style.background = `${alignment.border}0d`;
			}}
		>
			<button
				type="button"
				aria-expanded={isExpanded}
				aria-controls={`vote-panel-${vote.id}`}
				onClick={onToggle}
				style={{
					width: "100%",
					padding: "20px",
					cursor: "pointer",
					background: "transparent",
					border: "none",
					font: "inherit",
					textAlign: "left",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: isExpanded ? "16px" : 0,
						gap: "12px",
					}}
				>
				<div style={{ flex: 1, minWidth: 0 }}>
					<h3
						style={{
							fontSize: "clamp(15px, 3.8vw, 17px)",
							fontWeight: 600,
							marginBottom: "4px",
							color: "#4A1347",
							fontFamily: "var(--font-serif), serif",
						}}
					>
						{vote.title}
					</h3>
					<p
						style={{
							fontSize: "clamp(12px, 3.2vw, 14px)",
							color: "#5B4A56",
							marginBottom: "8px",
						}}
					>
						{vote.billNumber} · {new Date(vote.date).toLocaleDateString()}
					</p>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "8px 12px",
						background: alignment.iconBg,
						borderRadius: "6px",
						border: `1px solid ${alignment.border}44`,
						flexShrink: 0,
					}}
				>
					<span
						style={{
							fontSize: "18px",
							fontWeight: 700,
							color: alignment.border,
						}}
						aria-hidden
					>
						{alignment.iconChar}
					</span>
					<span
						style={{
							fontSize: "clamp(11px, 2.8vw, 12px)",
							fontWeight: 700,
							color: alignment.text,
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}
					>
						{alignment.label}
					</span>
				</div>
				</div>

				{!isExpanded ? (
					<div
						className="transition-transform duration-200 ease-out group-hover/vote:translate-x-1"
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr auto",
							gap: "16px",
							fontSize: "clamp(13px, 3.4vw, 15px)",
							alignItems: "center",
						}}
					>
						<div>
							<span
								style={{
									color: "#5B4A56",
									fontSize: "clamp(11px, 3vw, 12px)",
									display: "block",
								}}
							>
								Rep voted
							</span>
							<p style={{ color: "#4A1347", fontWeight: 600, margin: "4px 0 0 0" }}>
								{vote.repVote}
							</p>
						</div>
						<div>
							<span
								style={{
									color: "#5B4A56",
									fontSize: "clamp(11px, 3vw, 12px)",
									display: "block",
								}}
							>
								Your position
							</span>
							<p style={{ color: "#4A1347", fontWeight: 600, margin: "4px 0 0 0" }}>
								{userShort}
							</p>
						</div>
						<span style={{ color: "#5B4A56", fontSize: "12px" }} aria-hidden>
							▶
						</span>
					</div>
				) : null}
			</button>

			<div
				className="reps-vote-expand border-t border-black/8"
				data-expanded={isExpanded ? "true" : "false"}
				aria-hidden={!isExpanded}
			>
				<div className="reps-vote-expand-inner">
					<div
						id={`vote-panel-${vote.id}`}
						style={{
							padding: "0 20px 20px",
						}}
					>
					<p
						style={{
							fontSize: "clamp(14px, 3.5vw, 16px)",
							lineHeight: 1.6,
							color: "#5B4A56",
							marginBottom: "16px",
						}}
					>
						{vote.description}
					</p>

					<div
						style={{
							padding: "12px",
							background: "rgba(0,0,0,0.03)",
							borderRadius: "8px",
							marginBottom: "16px",
						}}
					>
						<p
							style={{
								fontSize: "11px",
								color: "#5B4A56",
								marginBottom: "8px",
								fontFamily: "monospace",
								letterSpacing: "0.05em",
							}}
						>
							HOW THE CHAMBER VOTED (DEMO COUNTS)
						</p>
						<div
							role="img"
							aria-label={`Vote breakdown: ${vote.voteStats.yesCount} yes, ${vote.voteStats.noCount} no, ${vote.voteStats.abstainCount} abstain`}
							style={{
								display: "flex",
								height: "24px",
								borderRadius: "4px",
								overflow: "hidden",
								marginBottom: "8px",
							}}
						>
							<div style={{ width: `${yesPercent}%`, background: "#047857" }} />
							<div style={{ width: `${noPercent}%`, background: "#B91C1C" }} />
							<div
								style={{ width: `${abstainPercent}%`, background: "#6B7280" }}
							/>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: "8px",
								fontSize: "clamp(12px, 3.2vw, 14px)",
							}}
						>
							<div>
								<span style={{ color: "#047857", fontWeight: 700 }}>
									Yes: {vote.voteStats.yesCount}
								</span>
							</div>
							<div>
								<span style={{ color: "#B91C1C", fontWeight: 700 }}>
									No: {vote.voteStats.noCount}
								</span>
							</div>
							<div>
								<span style={{ color: "#4B5563", fontWeight: 700 }}>
									Abstain: {vote.voteStats.abstainCount}
								</span>
							</div>
						</div>
					</div>

					<div
						style={{
							padding: "12px",
							background: "rgba(212, 242, 90, 0.08)",
							border: "1px solid rgba(212, 242, 90, 0.25)",
							borderRadius: "8px",
							marginBottom: "16px",
						}}
					>
						<p
							style={{
								fontSize: "11px",
								color: "#5B4A56",
								marginBottom: "8px",
								fontFamily: "monospace",
								letterSpacing: "0.05em",
							}}
						>
							BILL IMPACT (ILLUSTRATIVE)
						</p>
						<p style={{ fontSize: "clamp(13px, 3.4vw, 15px)", color: "#5B4A56", lineHeight: 1.5 }}>
							{vote.bill.impact}
						</p>
					</div>

					<span
						style={{
							display: "inline-block",
							marginBottom: "12px",
							padding: "4px 10px",
							borderRadius: "999px",
							fontSize: "clamp(12px, 3vw, 13px)",
							fontWeight: 600,
							background: issuePalette.bg,
							color: issuePalette.dark,
							border: `1px solid ${issuePalette.light}44`,
						}}
					>
						Issue: {ISSUE_LABELS[vote.issueCategory] ?? vote.issueCategory}
					</span>

					{vote.newsArticleId ? (
						<Link
							href={`/article/${vote.newsArticleId}`}
							className="reps-btn-primary block w-full rounded-md bg-[#D4F25A] py-2.5 text-center text-[clamp(12px,3vw,14px)] font-semibold text-black"
						>
							Read related briefing →
						</Link>
					) : (
						<p
							style={{
								margin: 0,
								padding: "10px",
								background: "#F7F2E8",
								color: "#4A1347",
								borderRadius: "6px",
								fontWeight: 600,
								fontSize: "clamp(12px, 3vw, 14px)",
								textAlign: "center",
								border: "1px solid #D4C4B8",
							}}
						>
							Full bill details ship with Congress.gov wiring post-demo.
						</p>
					)}
					</div>
				</div>
			</div>
		</article>
	);
}
