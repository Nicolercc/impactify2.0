"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VoteStatus } from "@/components/reps/vote-status-badge";

export type RepContact = {
	phone: string | null;
	email: string | null;
	websiteUrl: string | null;
};

export type Rep = {
	id: string;
	name: string;
	role: string | null;
	party: string | null;
	state: string;
	district: string | null;
	contact: RepContact;
	verified: boolean;
};

export type RepVoteCard = {
	rep: Rep;
	status: VoteStatus;
	alignmentPercent: number | null;
	govtrackVoteLink: string | null;
	lastUpdatedLabel: string | null;
	historyCount: number;
};

export type UseRepVotesState =
	| { status: "loading"; cards: RepVoteCard[]; message?: string }
	| { status: "ready"; cards: RepVoteCard[]; message?: string }
	| { status: "unavailable"; cards: RepVoteCard[]; message: string };

type Location = { state: string | null; district: string | null };

function getLocationFromLocalStorage(): Location {
	if (typeof window === "undefined") return { state: null, district: null };
	const rawState = window.localStorage.getItem("impactify:state");
	const rawDistrict = window.localStorage.getItem("impactify:district");
	const state = rawState?.trim()?.toUpperCase() ?? null;
	const district = rawDistrict?.trim() ?? null;
	return { state: state && state.length === 2 ? state : null, district };
}

function repFromRow(row: {
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
}): Rep {
	return {
		id: row.id,
		name: row.full_name,
		role: row.role,
		party: row.party,
		state: row.state,
		district: row.district,
		contact: { phone: row.phone, email: row.email, websiteUrl: row.website_url },
		verified: Boolean(row.bioguide_id),
	};
}

type RepVotesApiResponse = {
	reps?: unknown[];
	repVotes?: Array<{
		repId: string;
		repName: string;
		stance: string;
		alignmentPercent: number | null;
	}>;
	govtrack?: {
		ok: boolean;
		error?: string;
		votes?: Array<{ link: string; created?: string }>;
		status?: string;
	};
};

function isRepVotesApiResponse(value: unknown): value is RepVotesApiResponse {
	if (typeof value !== "object" || value === null) return false;
	const v = value as RepVotesApiResponse;
	return "govtrack" in v && "repVotes" in v;
}

export function useRepVotes(opts: { govtrackBillId: number; issue: string }) {
	const { govtrackBillId, issue } = opts;
	const [state, setState] = useState<UseRepVotesState>({ status: "loading", cards: [] });

	const location = useMemo(() => getLocationFromLocalStorage(), []);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			if (!location.state) {
				setState({
					status: "unavailable",
					cards: [],
					message: "Set your location to see your representatives.",
				});
				return;
			}

			// Immediate reps list from Supabase (fast, cached by CDN).
			const supabase = createClient();
			const { data: reps, error } = await supabase
				.from("representatives")
				.select("id, full_name, role, party, state, district, phone, email, website_url, bioguide_id")
				.eq("state", location.state)
				.is("deleted_at", null);

			const baseReps = error || !reps ? [] : reps.map(repFromRow);

			// Default cards while we hydrate GovTrack.
			const baseCards: RepVoteCard[] = baseReps.slice(0, 5).map((rep) => ({
				rep,
				status: "UNDECIDED",
				alignmentPercent: null,
				govtrackVoteLink: null,
				lastUpdatedLabel: null,
				historyCount: 0,
			}));

			if (!cancelled) setState({ status: "loading", cards: baseCards });

			// Hydrate via server API (GovTrack is rate-limited + cached server-side).
			const url = new URL("/api/reps/votes", window.location.origin);
			url.searchParams.set("state", location.state);
			if (location.district) url.searchParams.set("district", location.district);
			url.searchParams.set("govtrackBillId", String(govtrackBillId));
			url.searchParams.set("issue", issue);

			try {
				const res = await fetch(url.toString(), { method: "GET" });
				const json: unknown = await res.json();

				if (cancelled) return;

				if (!isRepVotesApiResponse(json)) {
					setState({
						status: "unavailable",
						cards: baseCards,
						message: "Invalid response format",
					});
					return;
				}

				const apiResponse = json;

				if (!apiResponse.govtrack?.ok) {
					setState({
						status: "ready",
						cards: baseCards,
						message: apiResponse.govtrack?.error ?? "GovTrack data unavailable",
					});
					return;
				}

				const voteLink = apiResponse.govtrack.votes?.[0]?.link ?? null;
				const created = apiResponse.govtrack.votes?.[0]?.created;
				const updatedLabel = created
					? `Last updated ${created}`
					: voteLink
						? "Last updated recently"
						: null;

				const repVotes = apiResponse.repVotes ?? [];

				const cards: RepVoteCard[] = repVotes.map((vote) => {
					const rep =
						baseReps.find((r) => r.id === vote.repId) ??
						({
							id: vote.repId,
							name: vote.repName,
							role: null,
							party: null,
							state: location.state ?? "",
							district: null,
							contact: { phone: null, email: null, websiteUrl: null },
							verified: false,
						} satisfies Rep);

					const status: VoteStatus = ["YEA", "NAY", "ABSTAIN", "PENDING", "UNDECIDED"].includes(
						vote.stance,
					)
						? (vote.stance as VoteStatus)
						: "UNDECIDED";

					return {
						rep,
						status,
						alignmentPercent: vote.alignmentPercent,
						govtrackVoteLink: voteLink,
						lastUpdatedLabel: updatedLabel,
						historyCount: 1,
					};
				});

				setState({
					status: "ready",
					cards: cards.length > 0 ? cards : baseCards,
					message: cards.length === 0 ? "No vote data available" : undefined,
				});
			} catch {
				if (cancelled) return;
				setState({
					status: "unavailable",
					cards: baseCards,
					message: "Data unavailable",
				});
			}
		}

		void run();
		return () => {
			cancelled = true;
		};
	}, [govtrackBillId, issue, location.district, location.state]);

	return state;
}
