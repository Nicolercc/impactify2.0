import "server-only";

import { deterministicAlignedScores } from "@/lib/reps/map-propublica";
import {
	govtrackLegislatorPhotoUrl,
	resolveGovTrackPersonId,
} from "@/lib/reps/govtrack-person";
import type { CauseKey, Rep, VoteRow } from "@/lib/reps/types";
import { inferVoteAlignment } from "@/lib/reps/vote-alignment";

const PROPUBLICA_BASE = "https://api.propublica.org/congress/v1";
const CONGRESS = "118";
const DEFAULT_STATE = "CA";
const GOVTRACK_SPACING_MS = 1200;

const PREVIEW_CAUSES = new Set<CauseKey>(["climate", "housing", "democracy"]);

type RawMember = {
	id?: string;
	title?: string;
	first_name?: string;
	last_name?: string;
	party?: string;
	state?: string;
	district?: string;
	total_votes?: number;
	missed_votes?: number;
	govtrack_id?: string | number;
	roles?: Array<{
		votes_with_party_pct?: number;
	}>;
};

type VoteApiBill = {
	number?: string;
	title?: string;
	url?: string | null;
};

type VoteApiRow = {
	date?: string;
	description?: string;
	position?: string;
	bill?: VoteApiBill;
};

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
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

function formatVoteDate(iso: string | undefined): string {
	if (!iso) return "—";
	try {
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return iso;
	}
}

function positionToYeaNay(position: string | undefined): "YEA" | "NAY" | null {
	const p = (position ?? "").trim().toLowerCase();
	if (p === "yes") return "YEA";
	if (p === "no") return "NAY";
	return null;
}

async function fetchMemberVotes(
	apiKey: string,
	memberBioguideId: string,
): Promise<VoteApiRow[]> {
	const url = `${PROPUBLICA_BASE}/${CONGRESS}/members/${memberBioguideId}/votes.json`;
	const res = await fetch(url, {
		headers: { "X-API-Key": apiKey },
		next: { revalidate: 86_400 },
	});
	if (!res.ok) return [];

	const data = (await res.json()) as {
		results?: Array<{ votes?: VoteApiRow[] }>;
	};
	return data.results?.[0]?.votes ?? [];
}

function votesToRows(raw: VoteApiRow[]): VoteRow[] {
	const out: VoteRow[] = [];
	for (const v of raw) {
		const yn = positionToYeaNay(v.position);
		if (!yn) continue;
		const title =
			v.bill?.title?.trim() ||
			v.description?.trim() ||
			v.bill?.number ||
			"Floor vote";
		const billUrl = v.bill?.url ?? null;
		out.push({
			bill: title,
			date: formatVoteDate(v.date),
			vote: yn,
			match: inferVoteAlignment(title, yn, PREVIEW_CAUSES),
			billUrl,
		});
		if (out.length >= 6) break;
	}
	return out.slice(0, 5);
}

function parseGovtrackFromMember(m: RawMember): number | null {
	const raw = m.govtrack_id;
	if (raw === undefined || raw === null) return null;
	const n = typeof raw === "string" ? Number.parseInt(raw, 10) : raw;
	return Number.isFinite(n) ? n : null;
}

function districtSortKey(d: string | undefined): number {
	if (!d) return 999;
	const n = Number.parseInt(String(d).replace(/\D/g, ""), 10);
	return Number.isFinite(n) ? n : 999;
}

function partyLinePct(m: RawMember): number | null {
	const v = m.roles?.[0]?.votes_with_party_pct;
	if (typeof v === "number" && Number.isFinite(v)) return Math.round(v * 10) / 10;
	return null;
}

async function enrichMemberDetail(
	apiKey: string,
	m: RawMember,
): Promise<RawMember> {
	const id = m.id;
	if (!id) return m;
	const url = `${PROPUBLICA_BASE}/members/${id}.json`;
	const res = await fetch(url, {
		headers: { "X-API-Key": apiKey },
		next: { revalidate: 86_400 },
	});
	if (!res.ok) return m;
	const data = (await res.json()) as { results?: RawMember[] };
	const d = data.results?.[0];
	if (!d) return m;
	return {
		...m,
		roles: d.roles ?? m.roles,
		total_votes: d.total_votes ?? m.total_votes,
		missed_votes: d.missed_votes ?? m.missed_votes,
		govtrack_id: m.govtrack_id ?? d.govtrack_id,
	};
}

function missedVotesPct(m: RawMember): number | null {
	const total = m.total_votes;
	const missed = m.missed_votes;
	if (
		typeof total === "number" &&
		total > 0 &&
		typeof missed === "number"
	) {
		return Math.round((missed / total) * 1000) / 10;
	}
	return null;
}

function buildRep(opts: {
	m: RawMember;
	chamber: Rep["chamber"];
	votes: VoteRow[];
	photoUrl: string | null;
	govtrackPersonId: number | null;
}): Rep {
	const m = opts.m;
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
		chamber: opts.chamber,
		initials: initials(first, last),
		accent: accentForParty(party),
		aligned: deterministicAlignedScores(id),
		votes: opts.votes,
		photoUrl: opts.photoUrl,
		govtrackPersonId: opts.govtrackPersonId,
		votesWithPartyPct: partyLinePct(m),
		missedVotesPct: missedVotesPct(m),
	};
}

export async function buildCaliforniaLandingReps(apiKey: string): Promise<Rep[]> {
	const headers = { "X-API-Key": apiKey };

	const [senateRes, houseRes] = await Promise.all([
		fetch(`${PROPUBLICA_BASE}/${CONGRESS}/senate/members.json`, {
			headers,
			next: { revalidate: 86_400 },
		}),
		fetch(`${PROPUBLICA_BASE}/${CONGRESS}/house/members.json`, {
			headers,
			next: { revalidate: 86_400 },
		}),
	]);

	if (!senateRes.ok) throw new Error("ProPublica senate members failed");

	const senateJson = (await senateRes.json()) as {
		results?: Array<{ members?: RawMember[] }>;
	};
	const senateMembers = (senateJson.results?.[0]?.members ?? []).filter(
		(m) => (m.state ?? "").toUpperCase() === DEFAULT_STATE,
	);

	let houseMembers: RawMember[] = [];
	if (houseRes.ok) {
		const houseJson = (await houseRes.json()) as {
			results?: Array<{ members?: RawMember[] }>;
		};
		houseMembers = (houseJson.results?.[0]?.members ?? []).filter(
			(m) => (m.state ?? "").toUpperCase() === DEFAULT_STATE,
		);
		houseMembers.sort(
			(a, b) => districtSortKey(a.district) - districtSortKey(b.district),
		);
	}

	const senators = senateMembers.slice(0, 2);
	const housePick = houseMembers[0] ?? null;

	const jobs: { m: RawMember; chamber: Rep["chamber"] }[] = [
		...senators.map((m) => ({ m, chamber: "U.S. SENATE" as const })),
	];
	if (housePick)
		jobs.push({ m: housePick, chamber: "U.S. HOUSE" as const });

	if (jobs.length === 0) throw new Error("No members for default state");

	const trimmed = jobs.slice(0, 3);

	const enriched = await Promise.all(
		trimmed.map((j) => enrichMemberDetail(apiKey, j.m)),
	);

	const voteRawLists = await Promise.all(
		enriched.map((m) => fetchMemberVotes(apiKey, String(m.id))),
	);

	const reps: Rep[] = [];

	for (let i = 0; i < trimmed.length; i++) {
		const chamber = trimmed[i]!.chamber;
		const m = enriched[i]!;
		const voteRows = votesToRows(voteRawLists[i] ?? []);

		let govtrackPersonId = parseGovtrackFromMember(m);
		if (govtrackPersonId == null) {
			govtrackPersonId = await resolveGovTrackPersonId({
				lastName: m.last_name ?? "",
				bioguideId: String(m.id ?? ""),
			});
			await sleep(GOVTRACK_SPACING_MS);
		}

		const photoUrl =
			govtrackPersonId != null
				? govtrackLegislatorPhotoUrl(govtrackPersonId)
				: null;

		reps.push(
			buildRep({
				m,
				chamber,
				votes: voteRows,
				photoUrl,
				govtrackPersonId,
			}),
		);
	}

	return reps;
}
