"use client";

import { ISSUE_METADATA } from "@/lib/demo-data";

interface Rep {
	id: string;
	name: string;
	photoUrl: string;
	office: string;
	party: string;
	state: string;
	alignmentScore: number;
	issueAlignment: Record<string, number>;
}

export function RepCard({
	rep,
	isSelected,
	onClick,
}: {
	rep: Rep;
	isSelected: boolean;
	onClick: () => void;
}) {
	return (
		<div
			onClick={onClick}
			style={{
				border: isSelected ? "2px solid #d4f25a" : "1px solid #e5e7eb",
				padding: "24px",
				borderRadius: "12px",
				cursor: "pointer",
				transition: "all 0.2s ease",
				backgroundColor: isSelected ? "rgba(212, 242, 90, 0.05)" : "transparent",
			}}
			onMouseEnter={(e) => {
				if (!isSelected) {
					e.currentTarget.style.borderColor = "#d4f25a";
					e.currentTarget.style.backgroundColor = "rgba(212, 242, 90, 0.02)";
				}
			}}
			onMouseLeave={(e) => {
				if (!isSelected) {
					e.currentTarget.style.borderColor = "#e5e7eb";
					e.currentTarget.style.backgroundColor = "transparent";
				}
			}}
		>
			{/* Photo */}
			<div
				style={{
					width: "100%",
					aspectRatio: "1",
					borderRadius: "12px",
					overflow: "hidden",
					marginBottom: "16px",
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

			{/* Name & Office */}
			<h3
				style={{
					fontSize: "18px",
					fontWeight: 600,
					marginBottom: "4px",
					fontFamily: "var(--font-serif)",
				}}
			>
				{rep.name}
			</h3>
			<p
				style={{
					fontSize: "12px",
					color: "#6b7280",
					marginBottom: "16px",
					fontFamily: "var(--font-mono)",
					letterSpacing: "0.05em",
				}}
			>
				{rep.office} · {rep.party} · {rep.state}
			</p>

			{/* Alignment Score - Radial Progress */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					aspectRatio: "1 / 0.8",
					marginBottom: "16px",
					position: "relative",
				}}
			>
				<svg
					style={{ width: "100%", maxWidth: "140px", transform: "rotate(-90deg)" }}
					viewBox="0 0 140 140"
				>
					<circle
						cx="70"
						cy="70"
						r="60"
						fill="none"
						stroke="rgba(212, 242, 90, 0.1)"
						strokeWidth="8"
					/>
					<circle
						cx="70"
						cy="70"
						r="60"
						fill="none"
						stroke="#d4f25a"
						strokeWidth="8"
						strokeDasharray={`${(rep.alignmentScore / 100) * 2 * Math.PI * 60} ${
							2 * Math.PI * 60
						}`}
						strokeLinecap="round"
						style={{ transition: "stroke-dasharray 0.6s ease" }}
					/>
				</svg>
				<div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
					<div
						style={{
							fontSize: "32px",
							fontWeight: 700,
							color: "#d4f25a",
							lineHeight: 1,
						}}
					>
						{rep.alignmentScore}%
					</div>
					<div
						style={{
							fontSize: "11px",
							color: "#9ca3af",
							marginTop: "4px",
							fontFamily: "var(--font-mono)",
							letterSpacing: "0.1em",
						}}
					>
						ALIGNED
					</div>
				</div>
			</div>

			{/* Issue Tags */}
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "8px",
					marginBottom: "12px",
				}}
			>
				{Object.entries(rep.issueAlignment)
					.sort(([, a], [, b]) => b - a)
					.slice(0, 3)
					.map(([issue, score]) => {
						const meta = ISSUE_METADATA[issue as keyof typeof ISSUE_METADATA];
						return (
							<span
								key={issue}
								style={{
									fontSize: "11px",
									padding: "4px 8px",
									backgroundColor: `${meta.color}15`,
									color: meta.color,
									borderRadius: "999px",
									fontWeight: 500,
									fontFamily: "var(--font-mono)",
								}}
							>
								{meta.label}: {score}%
							</span>
						);
					})}
			</div>

			<button
				style={{
					width: "100%",
					padding: "10px 12px",
					backgroundColor: "#d4f25a",
					color: "#000",
					borderRadius: "6px",
					border: "none",
					fontWeight: 600,
					cursor: "pointer",
					fontSize: "14px",
					transition: "background-color 0.2s",
				}}
				onMouseEnter={(e) => {
					(e.target as HTMLButtonElement).style.backgroundColor = "#c8e846";
				}}
				onMouseLeave={(e) => {
					(e.target as HTMLButtonElement).style.backgroundColor = "#d4f25a";
				}}
			>
				View record
			</button>
		</div>
	);
}

