import type { CauseKey } from "./types";

const KEYWORDS: Record<CauseKey, RegExp[]> = {
	climate: [/climate/i, /clean energy/i, /carbon/i, /epa/i, /emission/i, /wildfire/i],
	housing: [/hous/i, /rent/i, /tenant/i, /zoning/i, /homeless/i, /urban development/i],
	democracy: [/vot(e|ing)/i, /election/i, /fec/i, /redistrict/i, /ballot/i],
	labor: [/labor/i, /union/i, /nlrb/i, /wage/i, /workplace/i],
	health: [/health/i, /medicaid/i, /medicare/i, /fda/i, /disease/i],
};

/**
 * Preview heuristic: whether a roll-call looks aligned with active causes from title alone.
 * Replace with real scoring when issue tagging exists.
 */
export function inferVoteAlignment(
	billTitle: string,
	position: "YEA" | "NAY",
	activeCauses: Set<CauseKey>,
): boolean {
	if (activeCauses.size === 0) return false;
	let hits = 0;
	for (const c of activeCauses) {
		for (const rx of KEYWORDS[c]) {
			if (rx.test(billTitle)) {
				hits += 1;
				break;
			}
		}
	}
	if (hits === 0) return position === "YEA";
	// If bill matches selected issues, treat affirmative votes as aligned.
	return position === "YEA";
}
