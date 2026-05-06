"use client";

import { useEffect, useMemo, useState } from "react";
import { VoteCardEnhanced } from "@/components/reps/vote-card-enhanced";
import { VotingHeatmap } from "@/components/reps/voting-heatmap";
import { enrichDemoVote } from "@/lib/reps/enrich-demo-vote";
import { ISSUE_LABELS, getIssuePalette } from "@/lib/reps/issue-palette";
import { useAnimatedPercent } from "@/hooks/use-animated-percent";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

interface Vote {
	id: string;
	billNumber: string;
	title: string;
	description?: string;
	date: string;
	repVote: "YES" | "NO" | "ABSTAIN" | string;
	userPosition: "Support" | "Oppose" | "Neutral" | string;
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

interface RepDetailViewProps {
	rep: Rep;
	userIssues: readonly string[];
}

export function RepDetailView({ rep, userIssues }: RepDetailViewProps) {
	const [expandedVoteId, setExpandedVoteId] = useState<string | null>(null);
	const reducedMotion = usePrefersReducedMotion();
	const animatedPct = useAnimatedPercent(
		rep.alignmentScore,
		1500,
		reducedMotion,
	);
	const [issuesRef, issuesInView] = useInView<HTMLDivElement>();
	const [ringRun, setRingRun] = useState(false);

	useEffect(() => {
		if (reducedMotion) {
			setRingRun(true);
			return;
		}
		setRingRun(false);
		let id = 0;
		id = requestAnimationFrame(() => setRingRun(true));
		return () => cancelAnimationFrame(id);
	}, [rep.alignmentScore, rep.id, reducedMotion]);

	const enrichedSortedVotes = useMemo(() => {
		return [...rep.recentVotes]
			.sort((a, b) => {
				const aIndex = userIssues.indexOf(a.issueCategory);
				const bIndex = userIssues.indexOf(b.issueCategory);
				return aIndex - bIndex;
			})
			.map((v) => enrichDemoVote(v));
	}, [rep.recentVotes, userIssues]);

	const enrichedAllVotes = useMemo(
		() => rep.recentVotes.map((v) => enrichDemoVote(v)),
		[rep.recentVotes],
	);

	const circumference = 2 * Math.PI * 70;
	const strokeDashoffset =
		circumference - (rep.alignmentScore / 100) * circumference;

	const firstVote = enrichedSortedVotes[0];

	return (
		<div
			className="mx-auto w-full max-w-[1400px] px-10"
			style={{ paddingBottom: "48px" }}
		>
			<div
				className="mb-12 grid grid-cols-1 gap-10 lg:mb-16 lg:grid-cols-2 lg:gap-12 xl:gap-14"
				style={{ alignItems: "start" }}
			>
				<div>
					<div
						style={{
							width: "min(240px, 100%)",
							height: "240px",
							borderRadius: "16px",
							overflow: "hidden",
							marginBottom: "24px",
							border: "3px solid #D4F25A",
							backgroundColor: "#F7F2E8",
						}}
					>
						<img
							src={rep.photoUrl}
							alt={`${rep.name}, ${rep.office}, ${rep.party}, ${rep.state}`}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
							loading="lazy"
							decoding="async"
							onError={(e) => {
								(e.target as HTMLImageElement).src =
									`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rep.name)}`;
							}}
						/>
					</div>
					<h1
						style={{
							fontSize: "clamp(26px, 6vw, 32px)",
							fontWeight: 700,
							marginBottom: "8px",
							color: "#4A1347",
							fontFamily: "var(--font-serif), serif",
						}}
					>
						{rep.name}
					</h1>
					<p
						style={{
							fontSize: "clamp(14px, 3.5vw, 16px)",
							color: "#5B4A56",
							marginBottom: "4px",
						}}
					>
						{rep.office} · {rep.party}
					</p>
					<p style={{ fontSize: "clamp(13px, 3.2vw, 15px)", color: "#5B4A56" }}>
						{rep.state} · Party-line and attendance summaries would load live
						post-demo.
					</p>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<svg
						width="280"
						height="280"
						viewBox="0 0 160 160"
						style={{ marginBottom: "24px" }}
						aria-hidden
					>
						<circle
							cx="80"
							cy="80"
							r="70"
							fill="none"
							stroke="#E5DDD3"
							strokeWidth="8"
						/>
						<circle
							cx="80"
							cy="80"
							r="70"
							fill="none"
							stroke="#D4F25A"
							strokeWidth="8"
							strokeDasharray={circumference}
							strokeDashoffset={
								reducedMotion
									? strokeDashoffset
									: ringRun
										? (undefined as unknown as number)
										: circumference
							}
							strokeLinecap="round"
							className={cn(
								!reducedMotion && ringRun && "reps-align-ring-anim",
							)}
							style={{
								transform: "rotate(-90deg)",
								transformOrigin: "80px 80px",
								["--reps-circ" as string]: circumference,
								["--reps-off" as string]: strokeDashoffset,
							}}
						/>
						<text
							x="80"
							y="70"
							textAnchor="middle"
							style={{
								fontSize: "48px",
								fontWeight: "700",
								fill: "#4A1347",
								fontFamily: "var(--font-serif), serif",
							}}
						>
							{animatedPct}%
						</text>
						<text
							x="80"
							y="95"
							textAnchor="middle"
							style={{
								fontSize: "12px",
								fill: "#5B4A56",
								fontFamily: "monospace",
								letterSpacing: "0.1em",
							}}
						>
							ALIGNED
						</text>
					</svg>

					<p
						style={{
							fontSize: "clamp(14px, 3.5vw, 16px)",
							color: "#5B4A56",
							textAlign: "center",
							maxWidth: "320px",
						}}
					>
						{rep.name} aligns with you on{" "}
						<strong style={{ color: "#4A1347" }}>{animatedPct}%</strong> of the
						issues tracked in this demo.
					</p>
				</div>
			</div>

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
					Your issues
				</h2>

				<div
					ref={issuesRef}
					style={{ display: "flex", flexDirection: "column", gap: "16px" }}
				>
					{userIssues.map((issue, issueIdx) => {
						const score = rep.issueAlignment[issue] || 0;
						const palette = getIssuePalette(issue);
						const barWidth = `${score}%`;

						return (
							<div
								key={issue}
								style={{
									padding: "16px",
									background: palette.bg,
									border: `1px solid ${palette.light}44`,
									borderRadius: "8px",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "10px",
										gap: "12px",
									}}
								>
									<span
										style={{
											fontSize: "clamp(14px, 3.8vw, 16px)",
											fontWeight: 600,
											color: "#4A1347",
										}}
									>
										{ISSUE_LABELS[issue] ?? issue}
									</span>
									<span
										style={{
											fontSize: "clamp(14px, 3.8vw, 16px)",
											fontWeight: 700,
											color: palette.dark,
										}}
									>
										{score}%
									</span>
								</div>
								<div
									style={{
										height: "6px",
										background: `${palette.light}26`,
										borderRadius: "999px",
										overflow: "hidden",
									}}
								>
									<div
										className={cn(
											"reps-detail-bar-fill h-full rounded-full",
											(issuesInView || reducedMotion) &&
												"reps-detail-bar-fill--visible",
										)}
										style={{
											width: barWidth,
											background: palette.light,
											["--reps-bar-i" as string]: issueIdx,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

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
					Recent votes
				</h2>

				<div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
					{enrichedSortedVotes.map((vote) => (
						<VoteCardEnhanced
							key={vote.id}
							vote={vote}
							isExpanded={expandedVoteId === vote.id}
							onToggle={() =>
								setExpandedVoteId(expandedVoteId === vote.id ? null : vote.id)
							}
						/>
					))}
				</div>

				<VotingHeatmap votes={enrichedAllVotes} issueCategories={userIssues} />
			</div>

			<div
				style={{
					padding: "40px 32px",
					background: "linear-gradient(135deg, #D4F25A15, #D4F25A08)",
					border: "1px solid #D4F25A40",
					borderRadius: "16px",
				}}
			>
				<h2
					style={{
						fontSize: "clamp(17px, 4vw, 18px)",
						fontWeight: 600,
						marginBottom: "24px",
						color: "#4A1347",
						fontFamily: "var(--font-serif), serif",
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
						className="reps-btn-primary"
						href={`tel:${rep.phone.replace(/\D/g, "")}`}
						style={{
							display: "block",
							padding: "14px 16px",
							background: "#D4F25A",
							color: "#000",
							textDecoration: "none",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: "pointer",
							textAlign: "center",
							fontSize: "clamp(14px, 3.5vw, 16px)",
						}}
						onMouseEnter={(e) => {
							(e.target as HTMLElement).style.backgroundColor = "#C8E846";
						}}
						onMouseLeave={(e) => {
							(e.target as HTMLElement).style.backgroundColor = "#D4F25A";
						}}
					>
						Call: {rep.phone}
					</a>

					<a
						href={rep.website}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors duration-200 ease-out"
						style={{
							display: "block",
							padding: "12px 16px",
							background: "#F7F2E8",
							color: "#4A1347",
							textDecoration: "none",
							borderRadius: "8px",
							border: "1px solid #D4C4B8",
							fontWeight: 500,
							cursor: "pointer",
							textAlign: "center",
							fontSize: "clamp(14px, 3.5vw, 16px)",
						}}
						onMouseEnter={(e) => {
							(e.target as HTMLElement).style.borderColor = "#D4F25A";
							(e.target as HTMLElement).style.backgroundColor = "#FFFBF7";
						}}
						onMouseLeave={(e) => {
							(e.target as HTMLElement).style.borderColor = "#D4C4B8";
							(e.target as HTMLElement).style.backgroundColor = "#F7F2E8";
						}}
					>
						Official website
					</a>

					<a
						href={`https://twitter.com/${rep.twitter.replace("@", "")}`}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors duration-200 ease-out"
						style={{
							display: "block",
							padding: "12px 16px",
							background: "#F7F2E8",
							color: "#4A1347",
							textDecoration: "none",
							borderRadius: "8px",
							border: "1px solid #D4C4B8",
							fontWeight: 500,
							cursor: "pointer",
							textAlign: "center",
							fontSize: "clamp(14px, 3.5vw, 16px)",
						}}
						onMouseEnter={(e) => {
							(e.target as HTMLElement).style.borderColor = "#D4F25A";
							(e.target as HTMLElement).style.backgroundColor = "#FFFBF7";
						}}
						onMouseLeave={(e) => {
							(e.target as HTMLElement).style.borderColor = "#D4C4B8";
							(e.target as HTMLElement).style.backgroundColor = "#F7F2E8";
						}}
					>
						{rep.twitter}
					</a>
				</div>

				<div
					style={{
						padding: "16px",
						background: "rgba(74, 19, 71, 0.08)",
						borderRadius: "8px",
						borderLeft: "3px solid #D4F25A",
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
						Suggested script
					</p>
					<p
						style={{
							fontSize: "clamp(13px, 3.4vw, 15px)",
							lineHeight: 1.6,
							fontStyle: "italic",
							color: "#5B4A56",
						}}
					>
						&ldquo;Hello, I&apos;m a constituent from {rep.state}. I&apos;m
						calling about {firstVote?.title || "an upcoming vote"}. I{" "}
						{firstVote?.userPosition === "Support"
							? "support"
							: firstVote?.userPosition === "Oppose"
								? "oppose"
								: "want to discuss"}{" "}
						this bill and I&apos;m asking you to vote{" "}
						{firstVote?.userPosition === "Support"
							? "yes"
							: firstVote?.userPosition === "Oppose"
								? "no"
								: "in line with constituent feedback"}
						. Thank you.&rdquo;
					</p>
				</div>
			</div>
		</div>
	);
}
