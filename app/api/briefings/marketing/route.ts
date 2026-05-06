import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { buildMarketingBriefingPayload } from "@/lib/marketing/build-marketing-briefing";

export const runtime = "nodejs";

const getCachedMarketingBriefing = unstable_cache(
	async () => buildMarketingBriefingPayload(),
	["marketing-briefing-v2"],
	{ revalidate: 3600 },
);

/**
 * Cached marketing-page briefing: GovTrack + optional NewsAPI / ProPublica + Claude synthesis.
 */
export async function GET() {
	try {
		const payload = await getCachedMarketingBriefing();
		return NextResponse.json(payload, {
			headers: {
				"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
			},
		});
	} catch (e) {
		console.error("[briefings/marketing]", e);
		return NextResponse.json(
			{ error: "Briefing unavailable." },
			{ status: 502 },
		);
	}
}
