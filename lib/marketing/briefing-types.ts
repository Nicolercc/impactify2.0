/** Shared types for marketing AI briefing (server + client). */

export type MarketingBriefingSource = {
	label: string;
	href: string;
};

/** Tokens streamed word-by-word on the client. */
export type MarketingBriefingToken =
	| { type: "h"; text: string }
	| { type: "p"; text: string }
	| {
			type: "li";
			badge: string;
			prefix: string;
			text: string;
	  }
	| { type: "a"; text: string; href?: string | null };

export type MarketingBriefingPayload = {
	title: string;
	subtitle: string;
	sources: MarketingBriefingSource[];
	tokens: MarketingBriefingToken[];
	meta: {
		updatedAt: string;
		lastCheckedAt: string;
		generationMs: number;
		verifiedSourceCount: number;
		isLive: boolean;
		isExample: boolean;
		usedClaude: boolean;
		staleFallbackDate?: string;
		errorMessage?: string;
		exampleLabel?: string;
	};
};
