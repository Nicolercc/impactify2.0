import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
	fetchGovTrackVotesForBill,
	fetchGovTrackVoteVoters,
	type GovTrackVoter,
	type ImpactifyVote,
} from "@/lib/govtrack";

export const runtime = "nodejs";

const querySchema = z.object({
	state: z
		.string()
		.trim()
		.length(2)
		.transform((s) => s.toUpperCase()),
	district: z.string().trim().optional(),
	govtrackBillId: z.coerce.number().finite().positive(),
	issue: z.string().trim().min(1).max(80).optional(),
});

type RepRow = {
	id: string;
	full_name: string;
	role: string | null;
	party: string | null;
	state: string;
	district: string | null;
	phone: string | null;
	email: string | null;
	website_url: string | null;
	bioguide_id: string | null;
	chamber: string | null;
	level: string | null;
};

type RepVoteResult = {
	repId: string;
	repName: string;
	stance: "YEA" | "NAY" | "ABSTAIN" | "PENDING" | "UNDECIDED";
	alignmentPercent: number | null;
};

/**
 * Fetch GovTrack person object to get bioguide_id.
 * This lets us map GovTrack voters back to our representatives.
 */
async function fetchGovTrackPerson(
	govtrackPersonId: number,
): Promise<{ bioguide_id: string | null }> {
	const url = `https://www.govtrack.us/api/v2/person/${govtrackPersonId}`;
	try {
		const res = await fetch(url, {
			method: "GET",
			headers: { accept: "application/json" },
			cache: "no-store",
		});

		if (!res.ok) return { bioguide_id: null };

		const data = (await res.json()) as {
			bioguide_id?: string | null;
			[key: string]: unknown;
		};
		return { bioguide_id: data.bioguide_id ?? null };
	} catch {
		return { bioguide_id: null };
	}
}

/**
 * Build a cache of GovTrack person ID -> bioguide_id.
 * This is called once per request and speeds up voter mapping.
 */
async function buildGovTrackPersonMap(
	govtrackPersonIds: number[],
): Promise<Map<number, string>> {
	const map = new Map<number, string>();
	const unique = Array.from(new Set(govtrackPersonIds));

	// Fetch sequentially with a small delay to respect rate limits.
	for (const id of unique) {
		const person = await fetchGovTrackPerson(id);
		if (person.bioguide_id) {
			map.set(id, person.bioguide_id);
		}
		await new Promise((r) => setTimeout(r, 200));
	}

	return map;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const parsed = querySchema.safeParse({
		state: searchParams.get("state"),
		district: searchParams.get("district") ?? undefined,
		govtrackBillId: searchParams.get("govtrackBillId"),
		issue: searchParams.get("issue") ?? undefined,
	});

	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { state, district, govtrackBillId } = parsed.data;

	const supabase = await createClient();

	// Step 1: Fetch reps for this state/district.
	const repsQuery = supabase
		.from("representatives")
		.select(
			"id, full_name, role, party, state, district, phone, email, website_url, bioguide_id, chamber, level",
		)
		.eq("state", state)
		.is("deleted_at", null);

	const { data: repsAll, error: repsErr } = await repsQuery;
	if (repsErr) {
		return NextResponse.json(
			{ error: "Failed to load representatives" },
			{ status: 503 },
		);
	}

	const reps = (repsAll as RepRow[]).filter(Boolean);

	const senators = reps
		.filter((r) => (r.role ?? "").toLowerCase() === "senator")
		.slice(0, 2);
	const house = district
		? reps
				.filter(
					(r) =>
						(r.role ?? "").toLowerCase() === "house_rep" &&
						(r.district ?? "") === district,
				)
				.slice(0, 1)
		: reps
				.filter((r) => (r.role ?? "").toLowerCase() === "house_rep")
				.slice(0, 1);

	const stateLeg = reps
		.filter((r) => (r.level ?? "").toLowerCase() === "state")
		.slice(0, 2);

	const topReps = [...senators, ...house, ...stateLeg].slice(0, 5);

	// Step 2: Fetch vote roll calls for the bill.
	let votes: ImpactifyVote[] = [];
	try {
		votes = await fetchGovTrackVotesForBill({ govtrackBillId, limit: 10 });
	} catch (e) {
		// If votes fail, return reps with no stances.
		return NextResponse.json(
			{
				reps: topReps,
				repVotes: [],
				govtrack: {
					ok: false as const,
					error: e instanceof Error ? e.message : "GovTrack unavailable",
				},
			},
			{ status: 200 },
		);
	}

	// Use the most recent vote.
	const mostRecentVote = votes[0];
	if (!mostRecentVote) {
		// No votes yet.
		return NextResponse.json(
			{
				reps: topReps,
				repVotes: topReps.map((r) => ({
					repId: r.id,
					repName: r.full_name,
					stance: "PENDING" as const,
					alignmentPercent: null,
				})),
				govtrack: { ok: true as const, votes: [], status: "pending" },
			},
			{ status: 200 },
		);
	}

	// Step 3: Fetch vote_voter records for the most recent vote.
	let voters: GovTrackVoter[] = [];
	try {
		voters = await fetchGovTrackVoteVoters({ voteLink: mostRecentVote.link });
	} catch (e) {
		// Voters unavailable; return reps with UNDECIDED stances.
		return NextResponse.json(
			{
				reps: topReps,
				repVotes: topReps.map((r) => ({
					repId: r.id,
					repName: r.full_name,
					stance: "UNDECIDED" as const,
					alignmentPercent: null,
				})),
				govtrack: {
					ok: false as const,
					error:
						e instanceof Error ? e.message : "Could not fetch voter records",
				},
			},
			{ status: 200 },
		);
	}

	// Step 4: Build GovTrack person ID -> bioguide_id map.
	const govtrackPersonIds = voters.map((v) => v.personGovtrackId);
	const govtrackPersonMap = await buildGovTrackPersonMap(govtrackPersonIds);

	// Step 5: Map voters to reps and build stance data.
	const repVotes: RepVoteResult[] = topReps.map((rep) => {
		if (!rep.bioguide_id) {
			return {
				repId: rep.id,
				repName: rep.full_name,
				stance: "PENDING" as const,
				alignmentPercent: null,
			};
		}

		// Find this rep's vote in the voter list.
		const voterRecord = voters.find((v) => {
			const bioguideId = govtrackPersonMap.get(v.personGovtrackId);
			return bioguideId === rep.bioguide_id;
		});

		if (!voterRecord) {
			return {
				repId: rep.id,
				repName: rep.full_name,
				stance: "PENDING" as const,
				alignmentPercent: null,
			};
		}

		const stance: "YEA" | "NAY" | "ABSTAIN" =
			voterRecord.option === "+"
				? "YEA"
				: voterRecord.option === "-"
					? "NAY"
					: "ABSTAIN";

		return {
			repId: rep.id,
			repName: rep.full_name,
			stance,
			alignmentPercent: null, // Could compute from history; for now, null
		};
	});

	return NextResponse.json(
		{
			reps: topReps,
			repVotes,
			govtrack: { ok: true as const, votes: [mostRecentVote], status: "ready" },
		},
		{ status: 200 },
	);
}
