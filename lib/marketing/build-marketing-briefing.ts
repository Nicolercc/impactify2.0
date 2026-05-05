import "server-only";

import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type {
	MarketingBriefingPayload,
	MarketingBriefingSource,
	MarketingBriefingToken,
} from "@/lib/marketing/briefing-types";
import {
	fetchGovTrackBillsDirect,
	fetchGovTrackVotesForBillDirect,
	fetchNewsArticles,
	fetchProPublicaRecentBill,
	type GovTrackBillLite,
	type GovTrackVoteLite,
	type NewsArticleLite,
} from "@/lib/marketing/fetch-sources";

const TOPIC_KEYWORD = "housing affordability rent";

const synthesisSchema = z.object({
	whatsHappening: z
		.string()
		.describe("Max ~50 words. Clear, factual snapshot of the issue."),
	perspectives: z
		.array(
			z.object({
				badge: z
					.string()
					.describe("Short label e.g. TENANTS, ANALYSTS, GOVTRACK"),
				prefix: z
					.string()
					.describe(
						'Source line e.g. "According to GovTrack:" or "Washington Post reports:"',
					),
				text: z.string(),
			}),
		)
		.length(3),
	actions: z
		.array(
			z.object({
				text: z.string(),
				url: z.string().nullable().optional(),
			}),
		)
		.length(3),
});

type ContextPack = {
	bill: GovTrackBillLite | null;
	votes: GovTrackVoteLite[];
	news: NewsArticleLite[];
	proPublica: { title: string; url: string } | null;
	errors: string[];
};

async function gatherContext(): Promise<ContextPack> {
	const errors: string[] = [];
	let bill: GovTrackBillLite | null = null;
	let votes: GovTrackVoteLite[] = [];
	let news: NewsArticleLite[] = [];
	let proPublica: { title: string; url: string } | null = null;

	try {
		const bills = await fetchGovTrackBillsDirect({
			keyword: TOPIC_KEYWORD,
			fromYear: 2023,
			toYear: new Date().getFullYear(),
			limit: 5,
		});
		bill = bills[0] ?? null;
		if (bill) {
			try {
				votes = await fetchGovTrackVotesForBillDirect(bill.govtrackBillId, 3);
			} catch (e) {
				errors.push(
					e instanceof Error ? e.message : "GovTrack votes unavailable",
				);
			}
		}
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "GovTrack bills unavailable");
	}

	try {
		news = await fetchNewsArticles({
			query: "housing Congress bill OR rent stabilization OR affordable housing",
			pageSize: 3,
		});
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "News fetch failed");
	}

	try {
		const pp = await fetchProPublicaRecentBill({ congress: 118 });
		if (pp) proPublica = { title: pp.title, url: pp.url };
	} catch (e) {
		errors.push(e instanceof Error ? e.message : "ProPublica unavailable");
	}

	return { bill, votes, news, proPublica, errors };
}

function buildSourceList(ctx: ContextPack): MarketingBriefingSource[] {
	const out: MarketingBriefingSource[] = [];

	out.push({
		label: "GovTrack — federal bills & votes",
		href: "https://www.govtrack.us/",
	});

	if (ctx.bill) {
		out.push({
			label: `${ctx.bill.displayNumber}: ${ctx.bill.title.slice(0, 72)}${ctx.bill.title.length > 72 ? "…" : ""}`,
			href: ctx.bill.link,
		});
	}

	ctx.news.slice(0, 3).forEach((a) => {
		out.push({
			label: `${a.source}: ${a.title.slice(0, 64)}${a.title.length > 64 ? "…" : ""}`,
			href: a.url,
		});
	});

	if (ctx.proPublica) {
		out.push({
			label: `ProPublica Congress — ${ctx.proPublica.title.slice(0, 64)}${ctx.proPublica.title.length > 64 ? "…" : ""}`,
			href: ctx.proPublica.url,
		});
	}

	const seen = new Set<string>();
	return out.filter((s) => {
		if (seen.has(s.href)) return false;
		seen.add(s.href);
		return true;
	});
}

function contextPrompt(ctx: ContextPack): string {
	const parts: string[] = [];
	if (ctx.bill) {
		parts.push(
			`Bill (${ctx.bill.displayNumber}): ${ctx.bill.title}\nIntroduced: ${ctx.bill.introducedDate}\nStatus: ${ctx.bill.currentStatusLabel}\nLink: ${ctx.bill.link}`,
		);
	}
	if (ctx.votes.length) {
		const v = ctx.votes[0]!;
		parts.push(
			`Recent roll call: ${v.question}\nResult: ${v.result}\nVote page: ${v.link}`,
		);
	}
	ctx.news.forEach((a, i) => {
		parts.push(`News ${i + 1} (${a.source}): ${a.title}\nURL: ${a.url}`);
	});
	if (ctx.proPublica) {
		parts.push(
			`ProPublica bill context: ${ctx.proPublica.title}\n${ctx.proPublica.url}`,
		);
	}
	return parts.join("\n\n");
}

function tokensFromSynthesis(
	syn: z.infer<typeof synthesisSchema>,
	actionsFallbackHref: string | null,
): MarketingBriefingToken[] {
	const tokens: MarketingBriefingToken[] = [];
	tokens.push({ type: "h", text: "WHAT'S HAPPENING" });
	tokens.push({ type: "p", text: syn.whatsHappening.trim() });

	tokens.push({ type: "h", text: "PERSPECTIVES" });
	for (const p of syn.perspectives) {
		tokens.push({
			type: "li",
			badge: p.badge.trim().slice(0, 24),
			prefix: p.prefix.trim(),
			text: p.text.trim(),
		});
	}

	tokens.push({ type: "h", text: "WHAT YOU CAN DO" });
	for (const a of syn.actions) {
		const url = (a.url?.trim() || actionsFallbackHref) ?? null;
		tokens.push({
			type: "a",
			text: a.text.trim(),
			href: url,
		});
	}
	return tokens;
}

function heuristicTokens(ctx: ContextPack): MarketingBriefingToken[] {
	const bill = ctx.bill;
	const vote = ctx.votes[0];
	const n1 = ctx.news[0];

	const whats = bill
		? `${bill.displayNumber} (${bill.currentStatusLabel}): ${bill.title}. Track votes and text on GovTrack.`.slice(
				0,
				380,
			)
		: null;

	const fallbackWhats =
		"Congress is actively debating housing affordability and rent-related federal policy. Use GovTrack and recent coverage to follow votes and bill text.";

	return tokensFromSynthesis(
		{
			whatsHappening: (whats ?? fallbackWhats).split(/\s+/).slice(0, 55).join(" "),
			perspectives: [
				{
					badge: "GOVTRACK",
					prefix: "According to GovTrack:",
					text: bill
						? `The bill “${bill.title.slice(0, 120)}${bill.title.length > 120 ? "…" : ""}” is ${bill.currentStatusLabel.toLowerCase()} as of tracking data.`
						: "Federal bill metadata was unavailable in this fetch; check GovTrack for the latest introduced legislation on housing.",
				},
				{
					badge: "COVERAGE",
					prefix: n1 ? `According to ${n1.source}:` : "News coverage:",
					text: n1
						? n1.title
						: "Follow trusted outlets covering housing votes and tenant-impact analysis.",
				},
				{
					badge: "ROLL CALLS",
					prefix: "Latest recorded vote:",
					text: vote
						? `${vote.question} — result: ${vote.result}.`
						: "When votes post to GovTrack, you can see roll calls tied to housing-related bills.",
				},
			],
			actions: [
				{
					text: bill
						? `Open bill text & status for ${bill.displayNumber}`
						: "Browse housing bills on GovTrack",
					url: bill?.link ?? "https://www.govtrack.us/congress/bills/",
				},
				{
					text: "See roll calls linked to this bill",
					url:
						vote?.link ??
						(bill
							? `https://www.govtrack.us/congress/bills/browse?q=${encodeURIComponent("housing")}`
							: "https://www.govtrack.us/congress/votes/"),
				},
				{
					text: n1 ? `Read: ${n1.source}` : "Search trusted news on housing policy",
					url: n1?.url ?? "https://news.google.com/search?q=housing+bill+congress",
				},
			],
		},
		bill?.link ?? null,
	);
}

const EXAMPLE_SOURCES: MarketingBriefingSource[] = [
	{
		label: "GovTrack — federal bills & votes",
		href: "https://www.govtrack.us/",
	},
	{
		label: "ProPublica Congress API",
		href: "https://projects.propublica.org/api-docs/congress-api/",
	},
	{
		label: "NewsAPI",
		href: "https://newsapi.org/",
	},
];

function exampleTokens(): MarketingBriefingToken[] {
	return [
		{ type: "h", text: "WHAT'S HAPPENING" },
		{
			type: "p",
			text: "When live GovTrack, NewsAPI, and ProPublica keys are configured, this card fills with issue-specific bills, headlines, and roll calls—then Claude synthesizes them into this layout.",
		},
		{ type: "h", text: "PERSPECTIVES" },
		{
			type: "li",
			badge: "SAMPLE",
			prefix: "According to GovTrack (example):",
			text: "A featured federal bill would appear here with status and links to full text.",
		},
		{
			type: "li",
			badge: "SAMPLE",
			prefix: "News coverage (example):",
			text: "Recent headlines on housing affordability would surface with attribution.",
		},
		{
			type: "li",
			badge: "SAMPLE",
			prefix: "Votes (example):",
			text: "Latest roll-call questions tied to the bill would summarize how Congress acted.",
		},
		{ type: "h", text: "WHAT YOU CAN DO" },
		{
			type: "a",
			text: "→ Open the bill on GovTrack",
			href: "https://www.govtrack.us/congress/bills/",
		},
		{
			type: "a",
			text: "→ Read congressional reporting (ProPublica)",
			href: "https://www.propublica.org/",
		},
		{
			type: "a",
			text: "→ Contact your representatives",
			href: "https://www.govtrack.us/congress/members/",
		},
	];
}

export async function buildMarketingBriefingPayload(): Promise<MarketingBriefingPayload> {
	const t0 = Date.now();
	const ctx = await gatherContext();
	const sources = buildSourceList(ctx);

	const hasGovTrack = Boolean(ctx.bill);
	const hasNews = ctx.news.length > 0;
	const hasProPublica = Boolean(ctx.proPublica);
	const verifiedSourceCount =
		(hasGovTrack ? 1 : 0) + Math.min(ctx.news.length, 3) + (hasProPublica ? 1 : 0);
	const isLive = hasGovTrack || hasNews || hasProPublica;

	let tokens: MarketingBriefingToken[];
	let usedClaude = false;
	let errorMessage: string | undefined;

	const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
	const canSynthesize = Boolean(anthropicKey) && isLive;

	if (!isLive) {
		const stale = new Date().toISOString();
		return {
			title: "Structured Clarity",
			subtitle: "AI-synthesized briefing on this issue",
			sources: EXAMPLE_SOURCES,
			tokens: exampleTokens(),
			meta: {
				updatedAt: stale,
				lastCheckedAt: stale,
				generationMs: Date.now() - t0,
				verifiedSourceCount: 0,
				isLive: false,
				isExample: true,
				usedClaude: false,
				staleFallbackDate: stale,
				errorMessage:
					"We couldn't retrieve live data. Showing a labeled example layout.",
				exampleLabel: "(Example Briefing - What Your Briefing Will Look Like)",
			},
		};
	}

	if (canSynthesize) {
		try {
			const { object } = await generateObject({
				model: anthropic("claude-haiku-4-5-20251001"),
				schema: synthesisSchema,
				system: [
					"You synthesize civic briefings for Impactify using ONLY the facts provided.",
					"Rules:",
					"- whatsHappening: max ~50 words, plain language.",
					"- perspectives: exactly 3 items; each prefix must name the source style (e.g. According to GovTrack:, Reports from [outlet]:).",
					"- Do not invent statistics or votes not implied by the context.",
					"- actions: exactly 3 items; include real https URLs from context when possible.",
				].join("\n"),
				prompt: `Context:\n${contextPrompt(ctx) || "(no structured context)"}`,
			});
			usedClaude = true;
			tokens = tokensFromSynthesis(object, ctx.bill?.link ?? null);
		} catch (e) {
			errorMessage =
				e instanceof Error ? e.message : "Briefing synthesis unavailable.";
			tokens = heuristicTokens(ctx);
		}
	} else {
		if (!anthropicKey) {
			errorMessage =
				"AI synthesis skipped (no ANTHROPIC_API_KEY). Showing structured data only.";
		}
		tokens = heuristicTokens(ctx);
	}

	const now = new Date().toISOString();
	const generationMs = Date.now() - t0;

	return {
		title: "Structured Clarity",
		subtitle: "AI-synthesized briefing on this issue",
		sources,
		tokens,
		meta: {
			updatedAt: now,
			lastCheckedAt: now,
			generationMs,
			verifiedSourceCount,
			isLive: true,
			isExample: false,
			usedClaude,
			errorMessage,
		},
	};
}
