"use client";

import { useState } from "react";
import { ISSUE_METADATA } from "@/lib/demo-data";

interface Vote {
	id: string;
	billNumber: string;
	title: string;
	description?: string;
	date: string;
	repVote: string;
	userPosition: string;
	issueCategory: string;
	newsArticleId?: string | null;
}

interface Rep {
	id: string;
	name: string;
	photoUrl: string;
	office: string;
	party: string;
	state: string;
	phone: string;
	website: string;
	twitter: string;
	alignmentScore: number;
	issueAlignment: Record<string, number>;
	recentVotes: readonly Vote[];
}

export function RepDetail({
	rep,
	newsArticles,
	userIssues,
}: {
	rep: Rep;
	newsArticles?: readonly unknown[];
	userIssues: readonly string[];
}) {
	const [expandedVoteId, setExpandedVoteId] = useState<string | null>(null);

	const sortedVotes = [...rep.recentVotes].sort((a, b) => {
		const aIndex = userIssues.indexOf(a.issueCategory);
		const bIndex = userIssues.indexOf(b.issueCategory);
		return aIndex - bIndex;
	});

	const getVoteAlignment = (vote: Vote) => vote.repVote === vote.userPosition;

	return (
		<div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 20px" }}>
			{/* Header */}
			<div style={{ textAlign: "center", marginBottom: "60px" }}>
				<div
					style={{
						width: "160px",
						height: "160px",
						borderRadius: "50%",
						overflow: "hidden",
						margin: "0 auto 20px",
						border: "3px solid #d4f25a",
						backgroundColor: "#f3f4f6",
					}}
				>
					<img
						src={rep.photoUrl}
						alt={rep.name}
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
						onError={(e) => {
							(e.target as HTMLImageElement).src =
								"https://via.placeholder.com/160?text=" + rep.name.split(" ")[0];
						}}
					/>
				</div>
				<h1
					style={{
						fontSize: "36px",
						fontWeight: 600,
						marginBottom: "8px",
						fontFamily: "var(--font-serif)",
					}}
				>
					{rep.name}
				</h1>
				<p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
					{rep.office} · {rep.party} · {rep.state}
				</p>
				<p style={{ fontSize: "12px", color: "#9ca3af" }}>
					Voting record sourced from ProPublica Congress API
				</p>
			</div>

			{/* Alignment Score */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: "60px",
					padding: "40px 32px",
					background:
						"linear-gradient(135deg, rgba(212,242,90,0.1), rgba(212,242,90,0.05))",
					borderRadius: "16px",
					border: "1px solid rgba(212,242,90,0.3)",
				}}
			>
				<span
					style={{
						fontSize: "12px",
						color: "#6b7280",
						marginBottom: "12px",
						fontFamily: "var(--font-mono)",
						letterSpacing: "0.1em",
					}}
				>
					YOUR ALIGNMENT
				</span>
				<div
					style={{
						fontSize: "64px",
						fontWeight: 700,
						color: "#d4f25a",
						lineHeight: 1,
						marginBottom: "8px",
					}}
				>
					{rep.alignmentScore}%
				</div>
				<p
					style={{
						fontSize: "14px",
						color: "#6b7280",
						marginTop: "8px",
						maxWidth: "400px",
					}}
				>
					{rep.name} votes with you on {rep.alignmentScore}% of issues that matter
					to you
				</p>
			</div>

			{/* Issue Breakdown */}
			<div style={{ marginBottom: "60px" }}>
				<h2
					style={{
						fontSize: "16px",
						fontWeight: 600,
						marginBottom: "24px",
						fontFamily: "var(--font-mono)",
						letterSpacing: "0.1em",
						color: "#9ca3af",
					}}
				>
					YOUR ISSUES
				</h2>
				<div style={{ display: "grid", gap: "16px" }}>
					{userIssues.map((issue) => {
						const score = rep.issueAlignment[issue] || 0;
						const meta = ISSUE_METADATA[issue as keyof typeof ISSUE_METADATA];

						return (
							<div
								key={issue}
								style={{
									padding: "16px",
									background: `${meta.color}08`,
									border: `1px solid ${meta.color}20`,
									borderRadius: "8px",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px",
									}}
								>
									<span style={{ fontSize: "14px", fontWeight: 500 }}>
										{meta.emoji} {meta.label}
									</span>
									<span
										style={{
											fontSize: "14px",
											fontWeight: 700,
											color: meta.color,
										}}
									>
										{score}%
									</span>
								</div>
								<div
									style={{
										height: "6px",
										background: `${meta.color}20`,
										borderRadius: "999px",
										overflow: "hidden",
									}}
								>
									<div
										style={{
											height: "100%",
											background: meta.color,
											width: `${score}%`,
											transition: "width 0.3s ease",
											borderRadius: "999px",
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Recent Votes */}
			<div style={{ marginBottom: "60px" }}>
				<h2
					style={{
						fontSize: "16px",
						fontWeight: 600,
						marginBottom: "24px",
						fontFamily: "var(--font-mono)",
						letterSpacing: "0.1em",
						color: "#9ca3af",
					}}
				>
					RECENT VOTES
				</h2>
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					{sortedVotes.map((vote) => {
						const isAligned = getVoteAlignment(vote);
						const isExpanded = expandedVoteId === vote.id;

						return (
							<div
								key={vote.id}
								style={{
									padding: "16px",
									border: `1px solid ${
										isAligned ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
									}`,
									background: isAligned
										? "rgba(16,185,129,0.05)"
										: "rgba(239,68,68,0.05)",
									borderRadius: "8px",
									cursor: "pointer",
									transition: "all 0.2s ease",
								}}
								onClick={() => setExpandedVoteId(isExpanded ? null : vote.id)}
								onMouseEnter={(e) => {
									e.currentTarget.style.borderColor = "#d4f25a";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.borderColor = isAligned
										? "rgba(16,185,129,0.3)"
										: "rgba(239,68,68,0.3)";
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										marginBottom: isExpanded ? "12px" : 0,
									}}
								>
									<div style={{ flex: 1 }}>
										<h3
											style={{
												fontSize: "16px",
												fontWeight: 600,
												marginBottom: "4px",
												fontFamily: "var(--font-serif)",
											}}
										>
											{vote.title}
										</h3>
										<p
											style={{
												fontSize: "12px",
												color: "#6b7280",
												fontFamily: "var(--font-mono)",
											}}
										>
											{vote.billNumber}
										</p>
									</div>
									<span
										style={{
											fontSize: "11px",
											fontWeight: 700,
											padding: "6px 10px",
											borderRadius: "4px",
											background: isAligned
												? "rgba(16,185,129,0.15)"
												: "rgba(239,68,68,0.15)",
											color: isAligned ? "#10b981" : "#ef4444",
											letterSpacing: "0.05em",
										}}
									>
										{isAligned ? "✓ ALIGNED" : "✗ MISALIGNED"}
									</span>
								</div>

								{isExpanded && (
									<div
										style={{
											paddingTop: "12px",
											borderTop: "1px solid rgba(0,0,0,0.1)",
										}}
									>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												gap: "12px",
												marginBottom: "12px",
											}}
										>
											<div>
												<span
													style={{
														fontSize: "12px",
														color: "#6b7280",
														fontFamily: "var(--font-mono)",
														letterSpacing: "0.05em",
													}}
												>
													REP VOTED
												</span>
												<p style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
													{vote.repVote}
												</p>
											</div>
											<div>
												<span
													style={{
														fontSize: "12px",
														color: "#6b7280",
														fontFamily: "var(--font-mono)",
														letterSpacing: "0.05em",
													}}
												>
													YOUR POSITION
												</span>
												<p style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>
													{vote.userPosition}
												</p>
											</div>
										</div>
										{vote.description ? (
											<p
												style={{
													fontSize: "13px",
													lineHeight: "1.6",
													color: "#374151",
													marginBottom: "12px",
												}}
											>
												{vote.description}
											</p>
										) : null}
										{vote.newsArticleId && (
											<button
												style={{
													padding: "8px 12px",
													background: "#d4f25a",
													color: "#000",
													border: "none",
													borderRadius: "4px",
													cursor: "pointer",
													fontSize: "12px",
													fontWeight: 600,
												}}
												onClick={(e) => {
													e.stopPropagation();
												}}
											>
												Read full briefing →
											</button>
										)}
										{newsArticles ? null : null}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Contact */}
			<div
				style={{
					padding: "40px",
					background:
						"linear-gradient(135deg, rgba(212,242,90,0.1), rgba(212,242,90,0.05))",
					border: "1px solid rgba(212,242,90,0.3)",
					borderRadius: "16px",
				}}
			>
				<h2
					style={{
						fontSize: "18px",
						fontWeight: 600,
						marginBottom: "24px",
						fontFamily: "var(--font-serif)",
					}}
				>
					Contact {rep.name}
				</h2>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						marginBottom: "24px",
					}}
				>
					<a
						href={`tel:${rep.phone}`}
						style={{
							display: "block",
							padding: "14px 16px",
							background: "#d4f25a",
							color: "#000",
							textDecoration: "none",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: "pointer",
							textAlign: "center",
							transition: "background-color 0.2s",
						}}
						onMouseEnter={(e) => {
							(e.target as HTMLElement).style.backgroundColor = "#c8e846";
						}}
						onMouseLeave={(e) => {
							(e.target as HTMLElement).style.backgroundColor = "#d4f25a";
						}}
					>
						📞 Call: {rep.phone}
					</a>

					<a
						href={rep.website}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							display: "block",
							padding: "12px 16px",
							background: "rgba(255,255,255,0.1)",
							color: "inherit",
							textDecoration: "none",
							borderRadius: "8px",
							border: "1px solid rgba(212,242,90,0.3)",
							fontWeight: 500,
							cursor: "pointer",
							textAlign: "center",
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#d4f25a";
							e.currentTarget.style.backgroundColor = "rgba(212,242,90,0.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(212,242,90,0.3)";
							e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
						}}
					>
						🔗 Official Website
					</a>

					<a
						href={`https://twitter.com/${rep.twitter.replace("@", "")}`}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							display: "block",
							padding: "12px 16px",
							background: "rgba(255,255,255,0.1)",
							color: "inherit",
							textDecoration: "none",
							borderRadius: "8px",
							border: "1px solid rgba(212,242,90,0.3)",
							fontWeight: 500,
							cursor: "pointer",
							textAlign: "center",
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#d4f25a";
							e.currentTarget.style.backgroundColor = "rgba(212,242,90,0.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(212,242,90,0.3)";
							e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
						}}
					>
						𝕏 {rep.twitter}
					</a>
				</div>

				<div
					style={{
						padding: "16px",
						background: "rgba(0,0,0,0.15)",
						borderRadius: "8px",
						borderLeft: "3px solid #d4f25a",
					}}
				>
					<p
						style={{
							fontSize: "12px",
							color: "#9ca3af",
							marginBottom: "8px",
							fontFamily: "var(--font-mono)",
							letterSpacing: "0.05em",
						}}
					>
						SUGGESTED SCRIPT
					</p>
					<p
						style={{
							fontSize: "13px",
							lineHeight: "1.6",
							fontStyle: "italic",
							color: "#f3f4f6",
						}}
					>
						"Hello, I'm a constituent from {rep.state}. I'm calling about{" "}
						{sortedVotes[0]?.title || "voting issues"}. I
						{sortedVotes[0]?.userPosition === "Support" ? " support" : " oppose"}{" "}
						this bill and I'm calling to urge you to vote{" "}
						{sortedVotes[0]?.userPosition === "Support" ? "YES" : "NO"}. Thank you."
					</p>
				</div>
			</div>
		</div>
	);
}

