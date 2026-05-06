import { NextResponse } from "next/server";
import { buildCaliforniaLandingReps } from "@/lib/reps/build-landing-reps";
import { MOCK_REPS } from "@/lib/reps/mock-data";

export const runtime = "nodejs";
export const revalidate = 86_400;

/**
 * Marketing scorecard: California delegation (2 Senate + 1 House) with ProPublica
 * votes and GovTrack headshots. Mock when `PROPUBLICA_API_KEY` is unset.
 */
export async function GET() {
	const key = process.env.PROPUBLICA_API_KEY?.trim();
	const lastUpdated = new Date().toISOString();

	if (!key) {
		return NextResponse.json(
			{
				reps: MOCK_REPS,
				source: "mock" as const,
				isExample: true,
				lastUpdated,
				dataNote:
					"(Example — set PROPUBLICA_API_KEY for live members, votes, and photos.)",
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
				},
			},
		);
	}

	try {
		const reps = await buildCaliforniaLandingReps(key);
		return NextResponse.json(
			{
				reps,
				source: "propublica" as const,
				isExample: false,
				lastUpdated,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
				},
			},
		);
	} catch (e) {
		console.error("[api/reps]", e);
		return NextResponse.json(
			{
				reps: MOCK_REPS,
				source: "mock_fallback" as const,
				isExample: true,
				lastUpdated,
				dataNote:
					"Live data unavailable; showing example reps. Try again later.",
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
				},
			},
		);
	}
}
