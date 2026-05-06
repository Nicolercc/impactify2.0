import "server-only";

const GOVTRACK = "https://www.govtrack.us/api/v2";

export type GovTrackBillLite = {
	govtrackBillId: number;
	displayNumber: string;
	title: string;
	link: string;
	introducedDate: string;
	currentStatusLabel: string;
};

export type GovTrackVoteLite = {
	link: string;
	question: string;
	created: string;
	result: string;
};

export type NewsArticleLite = {
	title: string;
	url: string;
	source: string;
	publishedAt: string;
};

export type ProPublicaBillLite = {
	title: string;
	url: string;
	number: string;
};

type GTList<T> = { objects: T[] };

type GTRawBill = {
	text_info?: { bill_id?: number };
	display_number: string;
	title: string;
	link: string;
	introduced_date: string;
	current_status_label: string;
};

type GTRawVote = {
	link: string;
	question: string;
	created: string;
	result: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, {
		...init,
		next: { revalidate: 3600 },
		headers: { accept: "application/json", ...(init?.headers ?? {}) },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json() as Promise<T>;
}

/**
 * Direct GovTrack fetch (no Supabase cache) so marketing works without service role.
 */
export async function fetchGovTrackBillsDirect(opts: {
	keyword: string;
	fromYear: number;
	toYear: number;
	limit?: number;
}): Promise<GovTrackBillLite[]> {
	const keyword = opts.keyword.trim();
	const introducedGte = `${opts.fromYear}-01-01`;
	const introducedLte = `${opts.toYear}-12-31`;
	const limit = Math.min(Math.max(opts.limit ?? 3, 1), 10);
	const url =
		`${GOVTRACK}/bill` +
		`?q=${encodeURIComponent(keyword)}` +
		`&introduced_date__gte=${encodeURIComponent(introducedGte)}` +
		`&introduced_date__lte=${encodeURIComponent(introducedLte)}` +
		`&limit=${limit}` +
		`&sort=${encodeURIComponent("-introduced_date")}`;

	const raw = await fetchJson<GTList<GTRawBill>>(url);
	return raw.objects
		.map((b) => {
			const id = b.text_info?.bill_id;
			if (!id || typeof id !== "number") return null;
			return {
				govtrackBillId: id,
				displayNumber: b.display_number,
				title: b.title,
				link: b.link,
				introducedDate: b.introduced_date,
				currentStatusLabel: b.current_status_label,
			} satisfies GovTrackBillLite;
		})
		.filter((x): x is GovTrackBillLite => x !== null);
}

export async function fetchGovTrackVotesForBillDirect(
	govtrackBillId: number,
	limit = 3,
): Promise<GovTrackVoteLite[]> {
	const url =
		`${GOVTRACK}/vote` +
		`?related_bill=${encodeURIComponent(String(govtrackBillId))}` +
		`&limit=${limit}` +
		`&sort=${encodeURIComponent("-created")}`;
	const raw = await fetchJson<GTList<GTRawVote>>(url);
	return raw.objects.map((v) => ({
		link: v.link,
		question: v.question,
		created: v.created,
		result: v.result,
	}));
}

/** NewsAPI — optional `NEWSAPI_KEY` or `NEWSAPI_API_KEY`. */
export async function fetchNewsArticles(opts: {
	query: string;
	pageSize?: number;
}): Promise<NewsArticleLite[]> {
	const key =
		process.env.NEWSAPI_KEY?.trim() ?? process.env.NEWSAPI_API_KEY?.trim();
	if (!key) return [];

	const pageSize = Math.min(Math.max(opts.pageSize ?? 3, 1), 5);
	const url = new URL("https://newsapi.org/v2/everything");
	url.searchParams.set("q", opts.query);
	url.searchParams.set("language", "en");
	url.searchParams.set("sortBy", "publishedAt");
	url.searchParams.set("pageSize", String(pageSize));

	const res = await fetch(url.toString(), {
		headers: { "X-Api-Key": key },
		next: { revalidate: 3600 },
	});
	if (!res.ok) return [];
	const json = (await res.json()) as {
		articles?: Array<{
			title?: string;
			url?: string;
			source?: { name?: string };
			publishedAt?: string;
		}>;
	};
	const articles = json.articles ?? [];
	return articles
		.filter((a) => a.title && a.url)
		.map((a) => ({
			title: a.title!,
			url: a.url!,
			source: a.source?.name ?? "News",
			publishedAt: a.publishedAt ?? "",
		}));
}

/** ProPublica Congress API — recent House bills (sample). */
export async function fetchProPublicaRecentBill(opts: {
	congress?: number;
}): Promise<ProPublicaBillLite | null> {
	const key = process.env.PROPUBLICA_API_KEY?.trim();
	if (!key) return null;

	const congress = opts.congress ?? 118;
	const url = `https://api.propublica.org/congress/v1/${congress}/house/bills/recent.json`;

	const res = await fetch(url, {
		headers: { "X-API-Key": key },
		next: { revalidate: 3600 },
	});
	if (!res.ok) return null;

	const json = (await res.json()) as {
		results?: Array<{
			bills?: Array<{
				number?: string;
				short_title?: string;
				title?: string;
				congressdotgov_url?: string;
				url?: string;
			}>;
		}>;
	};
	const bills = json.results?.[0]?.bills;
	const b = bills?.[0];
	if (!b) return null;

	const title = (b.short_title || b.title || "").trim();
	if (!title) return null;

	const href =
		b.congressdotgov_url ||
		b.url ||
		`https://www.congress.gov/search?q=${encodeURIComponent(title.slice(0, 80))}`;

	return {
		title,
		number: b.number ?? "",
		url: href,
	};
}
