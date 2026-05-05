import type { CauseKey, Rep } from "./types";

/** Landing scorecard: show at most `limit` causes, highest alignment first. */
export function topAlignedCauses(
	rep: Rep,
	active: Set<CauseKey>,
	limit = 3,
): { key: CauseKey; value: number }[] {
	const entries = [...active].map((key) => ({
		key,
		value: rep.aligned[key],
	}));
	entries.sort((a, b) => b.value - a.value);
	return entries.slice(0, limit);
}

export function clampPct(n: number): number {
	return Math.max(0, Math.min(100, Math.round(n)));
}

/** Arithmetic mean of selected cause alignment scores; 0 when nothing selected. */
export function overallAlignment(rep: Rep, active: Set<CauseKey>): number {
	if (active.size === 0) return 0;
	let sum = 0;
	for (const k of active) sum += rep.aligned[k];
	return clampPct(sum / active.size);
}

export function voteBadge(vote: "YEA" | "NAY"): string {
	return vote === "YEA"
		? "bg-chartreuse-500/15 text-chartreuse-700 border-chartreuse-500/30"
		: "bg-peach-600/15 text-peach-600 border-peach-600/30";
}

export function ringColor(pct: number): string {
	if (pct >= 70) return "var(--chartreuse-500)";
	if (pct >= 50) return "var(--peach-400)";
	return "var(--rust)";
}
