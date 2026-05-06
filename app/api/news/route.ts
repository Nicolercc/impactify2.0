import { NextResponse } from "next/server";

import { fetchArticleListItems } from "@/lib/news/queries";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const q = (url.searchParams.get("q") ?? "").trim() || undefined;
		const causeSlug =
			(url.searchParams.get("cause") ?? url.searchParams.get("causeSlug") ?? "")
				.trim() || undefined;

		const articles = await fetchArticleListItems({
			q,
			causeSlug,
		});

		return NextResponse.json(
			{
				articles,
				q: q ?? null,
				cause: causeSlug ?? null,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
				},
			},
		);
	} catch (e) {
		console.error("[api/news]", e);
		return NextResponse.json(
			{ articles: [], error: "failed_to_fetch" as const },
			{ status: 500 },
		);
	}
}

