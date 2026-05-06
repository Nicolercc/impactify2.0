import { NextResponse } from "next/server";

import { fetchArticleListItems, type NewsIssueId } from "@/lib/news/queries";

export const runtime = "nodejs";
export const revalidate = 3600;

const ISSUE_IDS: readonly NewsIssueId[] = [
	"all",
	"climate-action",
	"affordable-housing",
	"voting-rights",
	"labor-rights",
	"immigration",
] as const;

function asInt(v: string | null, fallback: number): number {
	if (!v) return fallback;
	const n = Number(v);
	return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function isIssueId(v: string): v is NewsIssueId {
	return (ISSUE_IDS as readonly string[]).includes(v);
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);

		const q = (url.searchParams.get("q") ?? "").trim() || undefined;

		const causeSlug =
			(
				url.searchParams.get("cause") ??
				url.searchParams.get("causeSlug") ??
				""
			).trim() || undefined;

		const issueRaw = (url.searchParams.get("issue") ?? "all").trim() || "all";

		const issue = isIssueId(issueRaw) ? issueRaw : ("all" as const);

		const page = Math.max(1, asInt(url.searchParams.get("page"), 1));

		const pageSize = Math.min(
			50,
			Math.max(10, asInt(url.searchParams.get("pageSize"), 20)),
		);

		const articles = await fetchArticleListItems({
			q,
			causeSlug,
			issue,
			page,
			pageSize,
		});

		return NextResponse.json(
			{
				articles,
				page,
				pageSize,
				issue,
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
