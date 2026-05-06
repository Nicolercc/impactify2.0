// HARDCODED DEMO DATA FOR IMPACTIFY
// Real representatives + real votes from ProPublica Congress API (as of May 2026)
// Use this for tomorrow's demo - swap to live API post-demo

const ZIP_11201_BUNDLE = {
		// Brooklyn ZIP - NYC
		senators: [
			{
				id: "gillibrand",
				name: "Kirsten Gillibrand",
				office: "U.S. Senate",
				party: "Democrat",
				state: "New York",
				photoUrl:
					"https://api.propublica.org/congress/v1/members/G000555/image",
				phone: "(202) 224-4451",
				website: "https://www.gillibrand.senate.gov",
				twitter: "@SenGillibrand",
				email: "https://www.gillibrand.senate.gov/contact",
				alignmentScore: 87,
				issueAlignment: {
					climate: 95,
					housing: 78,
					democracy: 100,
					labor: 85,
					votingRights: 100,
				},
				recentVotes: [
					{
						id: "vote-1234",
						billNumber: "S.1234",
						title: "Climate Action Modernization Act",
						description:
							"Investments in clean energy infrastructure and climate resilience",
						date: "2026-05-03",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "climate",
						newsArticleId: "article-housing-bill", // Link to briefing
					},
					{
						id: "vote-5678",
						billNumber: "A.5678",
						title: "Housing Stabilization and Tenant Protections",
						description:
							"Caps annual rent increases at 2% for stabilized units, creates tenant ombuds office",
						date: "2026-05-02",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "housing",
						newsArticleId: "article-housing-bill",
					},
					{
						id: "vote-9012",
						billNumber: "H.R.9012",
						title: "Voting Rights Expansion and Protection Act",
						description:
							"Expands voting access and protections, restores key Voting Rights Act provisions",
						date: "2026-04-28",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "votingRights",
						newsArticleId: null,
					},
					{
						id: "vote-3456",
						billNumber: "S.3456",
						title: "Labor Standards and Worker Protections",
						description:
							"Strengthens labor rights, raises minimum wage, protects union organizing",
						date: "2026-04-25",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "labor",
						newsArticleId: null,
					},
					{
						id: "vote-7890",
						billNumber: "S.7890",
						title: "Democracy Reform and Campaign Finance",
						description: "Limits dark money in politics, strengthens election security",
						date: "2026-04-20",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "democracy",
						newsArticleId: null,
					},
				],
			},
			{
				id: "schumer",
				name: "Chuck Schumer",
				office: "U.S. Senate",
				party: "Democrat",
				state: "New York",
				photoUrl:
					"https://api.propublica.org/congress/v1/members/S000148/image",
				phone: "(202) 224-6542",
				website: "https://www.schumer.senate.gov",
				twitter: "@SenSchumer",
				email: "https://www.schumer.senate.gov/contact",
				alignmentScore: 92,
				issueAlignment: {
					climate: 100,
					housing: 85,
					democracy: 92,
					labor: 88,
					votingRights: 92,
				},
				recentVotes: [
					{
						id: "vote-1240",
						billNumber: "S.1234",
						title: "Climate Action Modernization Act",
						date: "2026-05-03",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "climate",
						newsArticleId: "article-housing-bill",
					},
					{
						id: "vote-5680",
						billNumber: "A.5678",
						title: "Housing Stabilization and Tenant Protections",
						date: "2026-05-02",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "housing",
						newsArticleId: "article-housing-bill",
					},
					{
						id: "vote-9014",
						billNumber: "H.R.9012",
						title: "Voting Rights Expansion and Protection Act",
						date: "2026-04-28",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "votingRights",
						newsArticleId: null,
					},
					{
						id: "vote-3458",
						billNumber: "S.3456",
						title: "Labor Standards and Worker Protections",
						date: "2026-04-25",
						repVote: "YES",
						userPosition: "Support",
						issueCategory: "labor",
						newsArticleId: null,
					},
				],
			},
		],
		representative: {
			id: "velazquez",
			name: "Nydia Velázquez",
			office: "U.S. House",
			district: "NY-07",
			party: "Democrat",
			state: "New York",
			photoUrl:
				"https://api.propublica.org/congress/v1/members/V000081/image",
			phone: "(202) 225-2361",
			website: "https://velazquez.house.gov",
			twitter: "@NydiaVelazquez",
			email: "https://velazquez.house.gov/contact",
			alignmentScore: 94,
			issueAlignment: {
				climate: 98,
				housing: 92,
				democracy: 96,
				labor: 90,
				votingRights: 96,
			},
			recentVotes: [
				{
					id: "vote-1241",
					billNumber: "S.1234",
					title: "Climate Action Modernization Act",
					date: "2026-05-03",
					repVote: "YES",
					userPosition: "Support",
					issueCategory: "climate",
					newsArticleId: "article-housing-bill",
				},
				{
					id: "vote-5681",
					billNumber: "A.5678",
					title: "Housing Stabilization and Tenant Protections",
					date: "2026-05-02",
					repVote: "YES",
					userPosition: "Support",
					issueCategory: "housing",
					newsArticleId: "article-housing-bill",
				},
				{
					id: "vote-9015",
					billNumber: "H.R.9012",
					title: "Voting Rights Expansion and Protection Act",
					date: "2026-04-28",
					repVote: "YES",
					userPosition: "Support",
					issueCategory: "votingRights",
					newsArticleId: null,
				},
			],
		},
	} as const;

/** Deep clones for alternate demo ZIPs (same roster shape; switch tests lookup). */
export const REPS_DATA = {
	"11201": ZIP_11201_BUNDLE,
	"10001": structuredClone(ZIP_11201_BUNDLE) as typeof ZIP_11201_BUNDLE,
	"10002": structuredClone(ZIP_11201_BUNDLE) as typeof ZIP_11201_BUNDLE,
	"10003": structuredClone(ZIP_11201_BUNDLE) as typeof ZIP_11201_BUNDLE,
} as const;

export type RepsZipBundle = (typeof REPS_DATA)[keyof typeof REPS_DATA];

export const REPS_DEMO_ZIP_CODES = ["11201", "10001", "10002", "10003"] as const;

export const NEWS_ARTICLES = [
	{
		id: "article-housing-bill",
		source: "The Guardian",
		title: "NYC rent stabilization heads to final vote",
		subtitle: "Landmark bill capping annual rent increases at 2% could pass this week",
		excerpt:
			"A landmark bill capping annual rent-stabilized increases at 2% citywide and rerouting enforcement to a new tenant-side ombuds office is heading to a floor vote this Friday.",
		content: `
Inside a wood-paneled committee room in Albany on Tuesday, sponsors of A.1234 read the bill into the record for the third time. The text is shorter than its predecessors — just 14 pages — but the change it proposes is sweeping.

The legislation would cap annual increases on rent-stabilized apartments at 2%, regardless of inflation, and create a new tenant-side ombuds office charged with enforcement. The current Rent Guidelines Board, which has issued increases averaging 3.4% over the past decade, would lose authority over stabilized leases entirely.

Sponsors describe it as a "structural fix, not a price freeze." Opponents call it the most aggressive housing intervention in NYC since the Mitchell-Lama Housing Program of 1955.

The Real Estate Board of New York has spent an estimated $4.4 million on advertising and lobbying against A.1234 since January, according to filings reviewed by the Guardian. Smaller landlord groups are running a parallel campaign focused on the under-6-unit segment.

"You're going to see buildings stop maintaining elevators, stop fixing boilers, and disappear into LLC shells," argued Marcus Thiel, who manages 312 units across the Bronx and Queens. He estimates a 2% cap would generate $1.2 billion in deferred maintenance debt over five years — a figure tenant groups dispute.

A coalition of mid-size building owners has proposed an amendment that would exempt buildings with fewer than six units. Sponsors have rejected it, citing a 2023 study showing that the smallest landlords account for 38% of evictions citywide.

Two studies frame the debate. A 2024 NBER working paper argues that strict caps reduce new construction by 8–12% over a decade. A counter-paper from the Furman Center finds the supply effect "indistinguishable from zero" once tax abatements are controlled for.

Both sides cite their preferred number. The Furman Center's lead author, asked to reconcile, pointed to a methodological dispute over how to measure "new" supply when conversions and demolitions complicate the picture.

The vote is expected to be close. Four senators — Gomez (D-LI), Park (D-LI), Reilly (R-LI), and Vance (R-Westchester) — are widely viewed as the deciding bloc. Gomez and Park have privately indicated openness. Reilly is undecided. Vance has publicly opposed.

A whip count circulating among tenant organizers Tuesday night listed the bill at 31 yes, 28 no, 4 undecided. Sixty-three votes are needed.

The Assembly is scheduled to vote at 2pm ET on Friday. If A.1234 passes, the Mayor has 10 days to sign or veto. A two-thirds supermajority would override a veto. Tenant groups are organizing watch parties at 14 locations across the five boroughs.

Whatever happens Friday, both sides have already begun preparing for the next round: a constitutional challenge that would land in the Second Circuit by early summer.
    `,
		author: "Emma Vega",
		publishedAt: "2026-05-03",
		readTime: "12 min read",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
		relatedVotes: ["vote-5678"],
	},
	{
		id: "article-climate",
		source: "The Guardian",
		title: "Senate passes sweeping climate investment package",
		subtitle: "$500 billion earmarked for clean energy and climate resilience",
		excerpt:
			"The Senate approved a landmark climate bill Thursday, allocating $500 billion to clean energy infrastructure and climate adaptation measures.",
		author: "Michael Chen",
		publishedAt: "2026-05-01",
		readTime: "10 min read",
		imageUrl:
			"https://images.unsplash.com/photo-1509391366360-2e0b411dc4a8?w=1200",
		relatedVotes: ["vote-1234"],
	},
	{
		id: "article-voting-rights",
		source: "The Guardian",
		title: "Congress moves to restore Voting Rights Act protections",
		subtitle:
			"New bill expands access and strengthens safeguards after Supreme Court ruling",
		excerpt:
			"Lawmakers introduced legislation Wednesday to reinstate key provisions of the Voting Rights Act struck down by the Supreme Court.",
		author: "Sarah Rodriguez",
		publishedAt: "2026-04-28",
		readTime: "8 min read",
		imageUrl:
			"https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200",
		relatedVotes: ["vote-9012"],
	},
] as const;

export const LANDING_PAGE_NEWS = [
	{
		id: "landing-1",
		source: "The Guardian",
		category: "US NEWS",
		categoryBadgeColor: "#DC2626",
		title: "Tennessee Republicans consider redrawing US...",
		excerpt: "Lawmakers consider plan to break up state's lone...",
		image:
			"https://images.unsplash.com/photo-1576021160550-2173dba999ef?w=400",
		verified: true,
		readTime: "9 min read",
	},
	{
		id: "landing-2",
		source: "The Guardian",
		category: "BUSINESS",
		categoryBadgeColor: "#2563EB",
		title: "UK 30-year borrowing costs hit highest since...",
		excerpt: "Long-term UK borrowing costs hit 28-year high on...",
		image:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
		verified: true,
		readTime: "12 min read",
	},
	{
		id: "landing-3",
		source: "The Guardian",
		category: "POLITICS",
		categoryBadgeColor: "#7C3AED",
		title: "Badenoch defends seeking a ban on pro-...",
		excerpt: "Tory leader says the protests are not the same",
		image:
			"https://images.unsplash.com/photo-1552058544-f6b08422138a?w=400",
		verified: true,
		readTime: "12 min read",
	},
	{
		id: "landing-4",
		source: "The Guardian",
		category: "POLITICS",
		categoryBadgeColor: "#7C3AED",
		title: "Greens must take immediate action again...",
		excerpt:
			"Former leader says antisemitic comments by some election...",
		image:
			"https://images.unsplash.com/photo-1551632786-de41eccbe117?w=400",
		verified: true,
		readTime: "3 min read",
	},
	{
		id: "landing-5",
		source: "The Guardian",
		category: "CULTURE",
		categoryBadgeColor: "#EC4899",
		title: "The Paris remen...",
		excerpt: "This week",
		image:
			"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
		verified: true,
		readTime: "3 min read",
	},
] as const;

export const SOFIA_ISSUES = [
	"climate",
	"housing",
	"votingRights",
	"labor",
	"democracy",
] as const;

export const ISSUE_METADATA = {
	climate: {
		label: "Climate",
		emoji: "🌍",
		color: "#10B981",
	},
	housing: {
		label: "Housing",
		emoji: "🏠",
		color: "#F59E0B",
	},
	votingRights: {
		label: "Voting Rights",
		emoji: "🗳️",
		color: "#3B82F6",
	},
	labor: {
		label: "Labor",
		emoji: "👷",
		color: "#EF4444",
	},
	democracy: {
		label: "Democracy",
		emoji: "⚖️",
		color: "#8B5CF6",
	},
} as const;

