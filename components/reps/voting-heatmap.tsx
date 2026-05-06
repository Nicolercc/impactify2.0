"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { EnhancedDemoVote } from "@/lib/reps/enrich-demo-vote";
import { ISSUE_LABELS, getIssuePalette } from "@/lib/reps/issue-palette";

interface VotingHeatmapProps {
	votes: EnhancedDemoVote[];
	issueCategories: readonly string[];
}

function getVoteAlignment(
	repVote: EnhancedDemoVote["repVote"],
	userPosition: EnhancedDemoVote["userPosition"],
): "aligned" | "misaligned" | "abstain" {
	if (repVote === "ABSTAIN") return "abstain";
	const aligned =
		(repVote === "YES" && userPosition === "Support") ||
		(repVote === "NO" && userPosition === "Oppose");
	return aligned ? "aligned" : "misaligned";
}

function voteCellStyle(
	alignment: ReturnType<typeof getVoteAlignment>,
	issueLight: string,
): { bg: string; border: string; icon: string; iconColor: string; label: string } {
	if (alignment === "aligned") {
		return {
			bg: issueLight,
			border: `${issueLight}66`,
			icon: "✓",
			iconColor: "#FFFFFF",
			label: "Aligned",
		};
	}
	if (alignment === "misaligned") {
		return {
			bg: "#D1D5DB",
			border: "#9CA3AF",
			icon: "✗",
			iconColor: "#374151",
			label: "Misaligned",
		};
	}
	return {
		bg: "#F3F4F6",
		border: "#E5E7EB",
		icon: "–",
		iconColor: "#6B7280",
		label: "Abstained",
	};
}

export function VotingHeatmap({ votes, issueCategories }: VotingHeatmapProps) {
	const reducedMotion = usePrefersReducedMotion();
	const votesByIssue: Record<string, EnhancedDemoVote[]> = {};
	for (const issue of issueCategories) {
		votesByIssue[issue] = votes
			.filter((v) => v.issueCategory === issue)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, 10);
	}

	const alignmentByIssue: Record<string, number> = {};
	for (const [issue, issueVotes] of Object.entries(votesByIssue)) {
		if (issueVotes.length === 0) {
			alignmentByIssue[issue] = 0;
			continue;
		}
		const alignedCount = issueVotes.filter(
			(v) => getVoteAlignment(v.repVote, v.userPosition) === "aligned",
		).length;
		alignmentByIssue[issue] = Math.round((alignedCount / issueVotes.length) * 100);
	}

	const sorted = Object.entries(alignmentByIssue).sort(([, a], [, b]) => b - a);
	const topIssue = sorted[0];
	const bottomIssue = sorted[sorted.length - 1];
	const topLabel = topIssue ? (ISSUE_LABELS[topIssue[0]] ?? topIssue[0]) : "—";
	const bottomLabel = bottomIssue
		? (ISSUE_LABELS[bottomIssue[0]] ?? bottomIssue[0])
		: "—";

	return (
		<div style={{ marginBottom: "48px" }}>
			<h2
				style={{
					fontSize: "clamp(15px, 4vw, 16px)",
					fontWeight: 600,
					marginBottom: "24px",
					color: "#4A1347",
					fontFamily: "monospace",
					letterSpacing: "0.1em",
				}}
			>
				Voting record heatmap
			</h2>

			<div style={{ overflowX: "auto" }}>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "clamp(12px, 3.2vw, 14px)",
					}}
				>
					<thead>
						<tr>
							<th
								style={{
									textAlign: "left",
									padding: "8px 12px",
									borderBottom: "2px solid #E5DDD3",
									fontWeight: 600,
									color: "#5B4A56",
									fontFamily: "monospace",
									letterSpacing: "0.05em",
									width: "120px",
								}}
							>
								Issue
							</th>
							{Array.from({ length: 10 }).map((_, i) => (
								<th
									key={i}
									style={{
										textAlign: "center",
										padding: "8px 4px",
										borderBottom: "2px solid #E5DDD3",
										color: "#5B4A56",
										fontSize: "clamp(10px, 2.8vw, 11px)",
									}}
									scope="col"
								>
									{i + 1}
								</th>
							))}
							<th
								style={{
									textAlign: "right",
									padding: "8px 12px",
									borderBottom: "2px solid #E5DDD3",
									fontWeight: 600,
									color: "#5B4A56",
									fontFamily: "monospace",
									letterSpacing: "0.05em",
									width: "88px",
								}}
							>
								Aligned
							</th>
						</tr>
					</thead>
					<tbody>
						{issueCategories.map((issue) => {
							const issueVotes = votesByIssue[issue] || [];
							const alignmentPct = alignmentByIssue[issue] || 0;
							const { light: issueLight, dark: issueDark } = getIssuePalette(issue);

							return (
								<tr key={issue}>
									<td
										style={{
											padding: "12px",
											borderBottom: "1px solid #E5DDD3",
											fontWeight: 500,
											color: "#4A1347",
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
											<span
												style={{
													width: "10px",
													height: "10px",
													borderRadius: "50%",
													background: issueLight,
													flexShrink: 0,
												}}
												aria-hidden
											/>
											<span style={{ fontSize: "clamp(14px, 3.5vw, 16px)" }}>
												{ISSUE_LABELS[issue] ?? issue}
											</span>
										</div>
									</td>
									{Array.from({ length: 10 }).map((_, i) => {
										const vote = issueVotes[i];
										if (!vote) {
											return (
												<td
													key={i}
													style={{
														padding: "4px",
														textAlign: "center",
														borderBottom: "1px solid #E5DDD3",
													}}
												>
													<div
														style={{
															width: "28px",
															height: "28px",
															margin: "0 auto",
															background: "#F7F2E8",
															borderRadius: "4px",
															border: "1px solid #E5DDD3",
														}}
														aria-label="No vote in this slot"
													/>
												</td>
											);
										}

										const voteAlignment = getVoteAlignment(
											vote.repVote,
											vote.userPosition,
										);
										const cell = voteCellStyle(voteAlignment, issueLight);

										return (
											<td
												key={i}
												style={{
													padding: "4px",
													textAlign: "center",
													borderBottom: "1px solid #E5DDD3",
												}}
											>
												<div
													className={reducedMotion ? undefined : "reps-heatmap-cell"}
													style={{
														width: "28px",
														height: "28px",
														margin: "0 auto",
														background: cell.bg,
														borderRadius: "4px",
														border: `1px solid ${cell.border}`,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														cursor: "default",
														fontSize: "14px",
														fontWeight: 700,
														color: cell.iconColor,
													}}
													title={`${vote.title} — ${cell.label}`}
													aria-label={`${vote.title}. ${cell.label}.`}
												>
													<span aria-hidden>{cell.icon}</span>
												</div>
											</td>
										);
									})}
									<td
										style={{
											padding: "12px",
											textAlign: "right",
											borderBottom: "1px solid #E5DDD3",
											fontWeight: 700,
											color: issueDark,
											fontSize: "clamp(14px, 3.5vw, 16px)",
										}}
									>
										{alignmentPct}%
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div
				style={{
					marginTop: "16px",
					padding: "12px",
					background: "#F7F2E8",
					borderRadius: "8px",
					display: "flex",
					flexWrap: "wrap",
					gap: "16px",
					fontSize: "clamp(13px, 3.4vw, 15px)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div
						style={{
							width: "20px",
							height: "20px",
							background: "#047857",
							borderRadius: "3px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#FFFFFF",
							fontSize: "12px",
							fontWeight: 700,
						}}
						aria-hidden
					>
						✓
					</div>
					<span style={{ color: "#4A1347" }}>
						<strong>Aligned</strong>: vote matched your position
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div
						style={{
							width: "20px",
							height: "20px",
							background: "#D1D5DB",
							borderRadius: "3px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#374151",
							fontSize: "12px",
							fontWeight: 700,
						}}
						aria-hidden
					>
						✗
					</div>
					<span style={{ color: "#4A1347" }}>
						<strong>Misaligned</strong>: vote did not match your position
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div
						style={{
							width: "20px",
							height: "20px",
							background: "#F3F4F6",
							borderRadius: "3px",
							border: "1px solid #E5DDD3",
						}}
						aria-hidden
					/>
					<span style={{ color: "#4A1347" }}>
						<strong>Empty</strong>: no vote in this demo slot
					</span>
				</div>
			</div>

			<div
				style={{
					marginTop: "16px",
					padding: "12px 16px",
					background: "rgba(212, 242, 90, 0.08)",
					border: "1px solid rgba(212, 242, 90, 0.22)",
					borderRadius: "8px",
				}}
			>
				<p style={{ fontSize: "clamp(14px, 3.5vw, 16px)", color: "#5B4A56", lineHeight: 1.5 }}>
					<strong style={{ color: "#4A1347" }}>Pattern (demo):</strong> strongest match on{" "}
					<strong>{topLabel}</strong> ({topIssue?.[1] ?? 0}%) · lowest match on{" "}
					<strong>{bottomLabel}</strong> ({bottomIssue?.[1] ?? 0}%).
				</p>
			</div>
		</div>
	);
}
