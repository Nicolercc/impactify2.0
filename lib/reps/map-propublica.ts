import type { CauseKey, Rep, VoteRow } from "./types";

export type ProPublicaMember = {
	id?: string;
	title?: string;
	first_name?: string;
	last_name?: string;
	party?: string;
	state?: string;
};

const CAUSE_KEYS: CauseKey[] = [
	"climate",
	"housing",
	"democracy",
	"labor",
	"health",
];

function hashSeed(id: string): number {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
	return h;
}

/** Stable demo alignment scores (40–95) derived from member id — not from real votes. */
export function deterministicAlignedScores(memberId: string): Record<CauseKey, number> {
	let h = hashSeed(memberId);
	const out = {} as Record<CauseKey, number>;
	for (const k of CAUSE_KEYS) {
		h = (h * 17 + k.charCodeAt(0)) >>> 0;
		out[k] = 40 + (h % 56);
	}
	return out;
}

function partyFromCode(code: string | undefined): Rep["party"] {
	const p = (code ?? "").trim().toUpperCase();
	if (p === "D") return "Democrat";
	if (p === "R") return "Republican";
	return "Independent";
}

function accentForParty(party: Rep["party"]): string {
	if (party === "Democrat") return "#5DA8E0";
	if (party === "Republican") return "#E07856";
	return "#B888E0";
}

function initials(first?: string, last?: string): string {
	const a = (first?.trim()?.[0] ?? "?").toUpperCase();
	const b = (last?.trim()?.[0] ?? "?").toUpperCase();
	return `${a}${b}`;
}

const DEMO_BILLS: Omit<VoteRow, "match">[] = [
	{ bill: "Infrastructure & Climate Package", date: "Mar 18", vote: "YEA" },
	{ bill: "Voting Rights Act (H.R. 4)", date: "Mar 9", vote: "YEA" },
	{ bill: "Defense Authorization Amendment", date: "Feb 26", vote: "NAY" },
	{ bill: "Housing Tax Credit Extension", date: "Feb 14", vote: "YEA" },
	{ bill: "Healthcare Price Transparency Act", date: "Feb 3", vote: "YEA" },
];

function demoVotesForMember(memberId: string): VoteRow[] {
	let h = hashSeed(memberId);
	return DEMO_BILLS.map((row, i) => {
		h = (h * 13 + i) >>> 0;
		const match = h % 3 !== 0;
		return { ...row, match };
	});
}

/**
 * Map ProPublica Senate members to our marketing scorecard shape.
 * Alignment and recent votes are **demo placeholders** until real scoring exists.
 */
export function mapProPublicaSenatorsToReps(
	members: ProPublicaMember[],
	limit = 8,
): Rep[] {
	return members.slice(0, limit).map((m) => {
		const id = String(m.id ?? `${m.first_name}-${m.last_name}`);
		const title = (m.title ?? "Sen.").replace(/\.$/, "");
		const first = m.first_name ?? "";
		const last = m.last_name ?? "";
		const name = `${title}. ${first} ${last}`.trim();
		const party = partyFromCode(m.party);
		const state = m.state ?? "";

		return {
			id,
			name,
			state,
			party,
			chamber: "U.S. SENATE",
			initials: initials(first, last),
			accent: accentForParty(party),
			aligned: deterministicAlignedScores(id),
			votes: demoVotesForMember(id),
		};
	});
}
