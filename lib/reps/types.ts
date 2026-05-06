export type CauseKey =
	| "climate"
	| "housing"
	| "democracy"
	| "labor"
	| "health";

export type VoteRow = {
	bill: string;
	date: string;
	match: boolean;
	vote: "YEA" | "NAY";
	/** Congress.gov or bill URL when available */
	billUrl?: string | null;
};

export type Rep = {
	id: string;
	name: string;
	state: string;
	party: "Democrat" | "Republican" | "Independent";
	chamber: "U.S. SENATE" | "U.S. HOUSE";
	initials: string;
	accent: string;
	aligned: Record<CauseKey, number>;
	votes: VoteRow[];
	/** GovTrack static legislator photo */
	photoUrl?: string | null;
	govtrackPersonId?: number | null;
	/** From ProPublica member roles when available */
	votesWithPartyPct?: number | null;
	missedVotesPct?: number | null;
};
