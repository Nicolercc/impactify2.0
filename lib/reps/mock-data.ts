import type { CauseKey, Rep } from "./types";

export const STATE_ABBREVIATIONS: Record<string, string> = {
	California: "CA",
	Texas: "TX",
	"New York": "NY",
	Florida: "FL",
	Illinois: "IL",
	Pennsylvania: "PA",
	Ohio: "OH",
	Georgia: "GA",
	"North Carolina": "NC",
	Michigan: "MI",
};

export const CAUSES: { id: CauseKey; label: string; tint: string }[] = [
	{
		id: "climate",
		label: "Climate",
		tint: "bg-cause-climate/15 text-cause-climate border-cause-climate/30",
	},
	{
		id: "housing",
		label: "Housing",
		tint: "bg-cause-housing/15 text-cause-housing border-cause-housing/30",
	},
	{
		id: "democracy",
		label: "Democracy",
		tint: "bg-cause-democracy/15 text-cause-democracy border-cause-democracy/30",
	},
	{
		id: "labor",
		label: "Labor",
		tint: "bg-cause-labor/15 text-cause-labor border-cause-labor/30",
	},
	{
		id: "health",
		label: "Health",
		tint: "bg-cause-health/15 text-cause-health border-cause-health/30",
	},
];

/** Landing page: only these three issues (reduces cognitive load). */
export const LANDING_CAUSE_IDS: readonly CauseKey[] = [
	"climate",
	"housing",
	"democracy",
];

export const LANDING_CAUSES: { id: CauseKey; label: string; tint: string }[] =
	CAUSES.filter((c) => LANDING_CAUSE_IDS.includes(c.id));

/** Static demo reps used when `PROPUBLICA_API_KEY` is unset or fetch fails. */
export const MOCK_REPS: Rep[] = [
	{
		id: "gonzalez",
		name: "Sen. Maria Gonzalez",
		state: "California",
		party: "Democrat",
		chamber: "U.S. SENATE",
		initials: "MG",
		accent: "#5DA8E0",
		aligned: { climate: 92, housing: 78, democracy: 88, labor: 81, health: 70 },
		votes: [
			{
				bill: "Climate Action Bill (S.1234)",
				date: "Mar 15",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Voting Rights Act (H.R. 4)",
				date: "Mar 8",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Defense Budget Amendment",
				date: "Feb 28",
				match: false,
				vote: "YEA",
			},
			{
				bill: "Rent Stabilization (A.1234)",
				date: "Feb 14",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Offshore Wind Approval",
				date: "Feb 2",
				match: true,
				vote: "YEA",
			},
		],
	},
	{
		id: "harlan",
		name: "Rep. James Harlan",
		state: "Texas",
		party: "Republican",
		chamber: "U.S. HOUSE",
		initials: "JH",
		accent: "#E07856",
		aligned: { climate: 41, housing: 55, democracy: 46, labor: 38, health: 52 },
		votes: [
			{
				bill: "Clean Grid Incentives (H.R. 221)",
				date: "Mar 12",
				match: false,
				vote: "NAY",
			},
			{
				bill: "Border Security Package",
				date: "Mar 5",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Workplace Safety Rule (H.R. 88)",
				date: "Feb 27",
				match: false,
				vote: "NAY",
			},
			{
				bill: "Affordable Housing Credits",
				date: "Feb 16",
				match: true,
				vote: "YEA",
			},
			{ bill: "Prescription Cap Act", date: "Feb 1", match: true, vote: "YEA" },
		],
	},
	{
		id: "okafor",
		name: "Rep. Adaeze Okafor",
		state: "New York",
		party: "Democrat",
		chamber: "U.S. HOUSE",
		initials: "AO",
		accent: "#B888E0",
		aligned: { climate: 84, housing: 90, democracy: 79, labor: 73, health: 76 },
		votes: [
			{
				bill: "Rent Stabilization (A.1234)",
				date: "Mar 14",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Voting Access Expansion",
				date: "Mar 9",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Union Protections Act",
				date: "Feb 26",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Medicaid Bridge Funding",
				date: "Feb 11",
				match: true,
				vote: "YEA",
			},
			{
				bill: "Fossil Subsidy Extension",
				date: "Feb 3",
				match: false,
				vote: "NAY",
			},
		],
	},
];
