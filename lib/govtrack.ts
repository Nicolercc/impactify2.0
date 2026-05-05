import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

// GovTrack public API base.
const GOVTRACK_BASE = "https://www.govtrack.us/api/v2";

// GovTrack rate limit: ~1 req/sec. We enforce a conservative interval.
const MIN_REQUEST_INTERVAL_MS = 1100;

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type GovTrackYearRange = {
	fromYear: number; // inclusive
	toYear: number; // inclusive
};

export type GovTrackBillSearchParams = GovTrackYearRange & {
	keyword: string;
	limit?: number; // max records to return
	sort?:
		| "-introduced_date"
		| "introduced_date"
		| "-current_status_date"
		| "current_status_date";
};

export type ImpactifyBill = {
	govtrackBillId: number;
	displayNumber: string; // e.g., "S. 4465"
	title: string; // includes number in GovTrack; we keep it as-is
	titleWithoutNumber: string | null;
	introducedDate: string; // YYYY-MM-DD
	congress: number;
	link: string;
	currentStatus: {
		code: string;
		label: string;
		date: string; // YYYY-MM-DD
	};
};

export type ImpactifyVote = {
	link: string; // canonical GovTrack vote URL
	created: string; // ISO timestamp
	chamber: "house" | "senate";
	congress: number;
	session: string;
	number: number; // roll number
	category: string;
	question: string;
	questionDetails: string | null;
	result: string;
	passed: boolean | null;
	totals: { plus: number; minus: number; other: number };
	relatedBillGovtrackId: number | null;
};

export type GovTrackVoter = {
	personGovtrackId: number;
	option: "+" | "-" | "P" | "0"; // Yea, Nay, Present, NV
	personName: string;
};

export type GovTrackErrorCode =
	| "RATE_LIMITED"
	| "TIMEOUT"
	| "UPSTREAM_ERROR"
	| "BAD_RESPONSE"
	| "NO_DATA"
	| "CACHE_ERROR";

export class GovTrackError extends Error {
	public readonly code: GovTrackErrorCode;
	public readonly status?: number;
	public readonly cause?: unknown;

	constructor(
		message: string,
		opts: { code: GovTrackErrorCode; status?: number; cause?: unknown },
	) {
		super(message);
		this.name = "GovTrackError";
		this.code = opts.code;
		this.status = opts.status;
		this.cause = opts.cause;
	}
}

type GovTrackListResponse<T> = {
	meta: {
		limit: number;
		offset: number;
		total_count: number;
		next?: string | null;
		previous?: string | null;
	};
	objects: T[];
};

type GovTrackBillObject = {
	// "text_info.bill_id" is the stable numeric ID we use to join to votes (vote.related_bill filter).
	text_info?: {
		bill_id: number;
		bill_name?: string;
		gpo_pdf_url?: string | null;
	};
	link: string;
	congress: number;
	display_number: string;
	introduced_date: string;
	title: string;
	title_without_number?: string | null;
	current_status: string;
	current_status_label: string;
	current_status_date: string;
};

type GovTrackVoteObject = {
	link: string;
	created: string;
	chamber: "house" | "senate";
	congress: number;
	session: string;
	number: number;
	category: string;
	question: string;
	question_details: string | null;
	result: string;
	passed: boolean | null;
	total_plus: number;
	total_minus: number;
	total_other: number;
	related_bill: GovTrackBillObject | null;
};

type GovTrackVoterObject = {
	person: { id: number; name: string };
	option: "+" | "-" | "P" | "0";
};

function isoDateForYearStart(year: number) {
	return `${year}-01-01`;
}
function isoDateForYearEnd(year: number) {
	return `${year}-12-31`;
}

function stableCacheKey(
	parts: Record<string, string | number | boolean | null | undefined>,
): string {
	const entries = Object.entries(parts)
		.filter(([, v]) => v !== undefined)
		.sort(([a], [b]) => a.localeCompare(b));
	return entries.map(([k, v]) => `${k}=${String(v ?? "")}`).join("&");
}

class RateLimitedQueue {
	private lastStart = 0;
	private pending: Array<{
		run: () => Promise<void>;
		reject: (e: unknown) => void;
	}> = [];
	private running = false;

	enqueue<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.pending.push({
				reject,
				run: async () => {
					try {
						const out = await fn();
						resolve(out);
					} catch (e) {
						reject(e);
					}
				},
			});
			void this.drain();
		});
	}

	private async drain(): Promise<void> {
		if (this.running) return;
		this.running = true;
		try {
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const next = this.pending.shift();
				if (!next) return;
				const now = Date.now();
				const wait = Math.max(
					0,
					MIN_REQUEST_INTERVAL_MS - (now - this.lastStart),
				);
				if (wait > 0) await new Promise((r) => setTimeout(r, wait));
				this.lastStart = Date.now();
				await next.run();
			}
		} finally {
			this.running = false;
			if (this.pending.length) void this.drain();
		}
	}
}

const queue = new RateLimitedQueue();

async function fetchJson<T>(
	url: string,
	opts?: { timeoutMs?: number; retries?: number },
): Promise<T> {
	const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const retries = opts?.retries ?? 2;

	return queue.enqueue(async () => {
		let attempt = 0;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			attempt += 1;
			const ac = new AbortController();
			const to = setTimeout(() => ac.abort(), timeoutMs);
			try {
				const res = await fetch(url, {
					method: "GET",
					headers: { accept: "application/json" },
					signal: ac.signal,
					cache: "no-store",
				});

				if (res.status === 429) {
					if (attempt <= retries) {
						// Backoff but keep within global queue pacing.
						await new Promise((r) => setTimeout(r, 1000 * attempt));
						continue;
					}
					throw new GovTrackError("GovTrack rate limited (429)", {
						code: "RATE_LIMITED",
						status: 429,
					});
				}

				if (!res.ok) {
					if (
						attempt <= retries &&
						(res.status === 502 || res.status === 503 || res.status === 504)
					) {
						await new Promise((r) => setTimeout(r, 700 * attempt));
						continue;
					}
					throw new GovTrackError(`GovTrack HTTP ${res.status}`, {
						code: "UPSTREAM_ERROR",
						status: res.status,
					});
				}

				const text = await res.text();
				try {
					return JSON.parse(text) as T;
				} catch (e) {
					throw new GovTrackError("GovTrack returned invalid JSON", {
						code: "BAD_RESPONSE",
						cause: e,
					});
				}
			} catch (e) {
				if (e instanceof GovTrackError) throw e;
				if (e instanceof DOMException && e.name === "AbortError") {
					throw new GovTrackError("GovTrack request timed out", {
						code: "TIMEOUT",
						cause: e,
					});
				}
				if (attempt <= retries) {
					await new Promise((r) => setTimeout(r, 500 * attempt));
					continue;
				}
				throw new GovTrackError("GovTrack request failed", {
					code: "UPSTREAM_ERROR",
					cause: e,
				});
			} finally {
				clearTimeout(to);
			}
		}
	});
}

async function cacheGet(
	namespace: string,
	cacheKey: string,
): Promise<unknown | null> {
	const supabase = createServiceRoleClient();
	const nowIso = new Date().toISOString();

	const { data, error } = await supabase
		.from("api_cache")
		.select("value, expires_at")
		.eq("namespace", namespace)
		.eq("cache_key", cacheKey)
		.gt("expires_at", nowIso)
		.maybeSingle();

	if (error)
		throw new GovTrackError("Cache read failed", {
			code: "CACHE_ERROR",
			cause: error,
		});
	return data?.value ?? null;
}

async function cacheSet(
	namespace: string,
	cacheKey: string,
	value: unknown,
	ttlMs: number,
): Promise<void> {
	const supabase = createServiceRoleClient();
	const now = new Date();
	const expires = new Date(now.getTime() + ttlMs);

	const { error } = await supabase.from("api_cache").upsert(
		{
			namespace,
			cache_key: cacheKey,
			value,
			fetched_at: now.toISOString(),
			expires_at: expires.toISOString(),
		},
		{ onConflict: "namespace,cache_key" },
	);

	if (error)
		throw new GovTrackError("Cache write failed", {
			code: "CACHE_ERROR",
			cause: error,
		});
}

function normalizeBill(b: GovTrackBillObject): ImpactifyBill {
	const id = b.text_info?.bill_id;
	if (!id || typeof id !== "number") {
		throw new GovTrackError("GovTrack bill missing text_info.bill_id", {
			code: "BAD_RESPONSE",
		});
	}
	return {
		govtrackBillId: id,
		displayNumber: b.display_number,
		title: b.title,
		titleWithoutNumber: b.title_without_number ?? null,
		introducedDate: b.introduced_date,
		congress: b.congress,
		link: b.link,
		currentStatus: {
			code: b.current_status,
			label: b.current_status_label,
			date: b.current_status_date,
		},
	};
}

function normalizeVote(v: GovTrackVoteObject): ImpactifyVote {
	const relatedId =
		v.related_bill?.text_info?.bill_id &&
		typeof v.related_bill.text_info.bill_id === "number"
			? v.related_bill.text_info.bill_id
			: null;

	return {
		link: v.link,
		created: v.created,
		chamber: v.chamber,
		congress: v.congress,
		session: v.session,
		number: v.number,
		category: v.category,
		question: v.question,
		questionDetails: v.question_details ?? null,
		result: v.result,
		passed: v.passed,
		totals: { plus: v.total_plus, minus: v.total_minus, other: v.total_other },
		relatedBillGovtrackId: relatedId,
	};
}

/**
 * Extract vote ID from GovTrack vote link.
 * Link format: https://www.govtrack.us/congress/votes/119-2026/h155
 * Returns: 119-2026/h155
 */
function extractVoteIdFromLink(link: string): string | null {
	const match = link.match(/\/congress\/votes\/([^/]+\/[^/]+)$/);
	return match?.[1] ?? null;
}

/**
 * Fetch bills by keyword and introduced year range (inclusive), normalized to Impactify schema.
 * Cached in Supabase for 24h.
 */
export async function searchGovTrackBills(
	params: GovTrackBillSearchParams,
): Promise<ImpactifyBill[]> {
	const keyword = params.keyword.trim();
	if (!keyword)
		throw new GovTrackError("Keyword is required", { code: "BAD_RESPONSE" });
	if (params.fromYear > params.toYear)
		throw new GovTrackError("Invalid year range", { code: "BAD_RESPONSE" });

	const limit = Math.min(Math.max(params.limit ?? 25, 1), 100);
	const sort = params.sort ?? "-introduced_date";

	const introducedGte = isoDateForYearStart(params.fromYear);
	const introducedLte = isoDateForYearEnd(params.toYear);

	const cacheKey = stableCacheKey({
		q: keyword,
		introducedGte,
		introducedLte,
		limit,
		sort,
	});
	const cached = await cacheGet("govtrack.bill.search", cacheKey);
	if (cached) return cached as ImpactifyBill[];

	const url =
		`${GOVTRACK_BASE}/bill` +
		`?q=${encodeURIComponent(keyword)}` +
		`&introduced_date__gte=${encodeURIComponent(introducedGte)}` +
		`&introduced_date__lte=${encodeURIComponent(introducedLte)}` +
		`&limit=${limit}` +
		`&sort=${encodeURIComponent(sort)}`;

	const raw = await fetchJson<GovTrackListResponse<GovTrackBillObject>>(url);
	const out = raw.objects.map(normalizeBill);

	await cacheSet("govtrack.bill.search", cacheKey, out, DEFAULT_CACHE_TTL_MS);
	return out;
}

/**
 * Fetch vote roll calls associated with a GovTrack bill id (text_info.bill_id).
 * Returns vote summaries (totals, question, result). Cached in Supabase for 24h.
 */
export async function fetchGovTrackVotesForBill(opts: {
	govtrackBillId: number;
	limit?: number;
}): Promise<ImpactifyVote[]> {
	const billId = opts.govtrackBillId;
	if (!Number.isFinite(billId))
		throw new GovTrackError("Invalid bill id", { code: "BAD_RESPONSE" });

	const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
	const cacheKey = stableCacheKey({ related_bill: billId, limit });
	const cached = await cacheGet("govtrack.vote.by_bill", cacheKey);
	if (cached) return cached as ImpactifyVote[];

	const url = `${GOVTRACK_BASE}/vote?related_bill=${encodeURIComponent(String(billId))}&limit=${limit}&sort=-created`;
	const raw = await fetchJson<GovTrackListResponse<GovTrackVoteObject>>(url);
	const out = raw.objects.map(normalizeVote);

	await cacheSet("govtrack.vote.by_bill", cacheKey, out, DEFAULT_CACHE_TTL_MS);
	return out;
}

/**
 * Fetch per-voter records for a specific vote from GovTrack.
 * Maps GovTrack person IDs to vote choices (Yea/Nay/Present/NV).
 * Cached for 24h.
 *
 * Vote link format: https://www.govtrack.us/congress/votes/119-2026/h155
 * API endpoint: /api/v2/vote/{congress}-{session}/{chamber}{number}/voters
 */
export async function fetchGovTrackVoteVoters(opts: {
	voteLink: string;
}): Promise<GovTrackVoter[]> {
	const voteId = extractVoteIdFromLink(opts.voteLink);
	if (!voteId) {
		throw new GovTrackError("Could not parse vote ID from link", {
			code: "BAD_RESPONSE",
		});
	}

	const cacheKey = stableCacheKey({ voteId });
	const cached = await cacheGet("govtrack.vote.voters", cacheKey);
	if (cached) return cached as GovTrackVoter[];

	const url = `${GOVTRACK_BASE}/vote/${voteId}/voters?limit=1000`;

	const raw = await fetchJson<GovTrackListResponse<GovTrackVoterObject>>(url);
	const voters: GovTrackVoter[] = raw.objects.map((v) => ({
		personGovtrackId: v.person.id,
		option: v.option,
		personName: v.person.name,
	}));

	await cacheSet(
		"govtrack.vote.voters",
		cacheKey,
		voters,
		DEFAULT_CACHE_TTL_MS,
	);
	return voters;
}

/**
 * Helper: map GovTrack person ID to representative bioguide_id.
 * This requires a mapping table (govtrack_person_id -> bioguide_id).
 * For now, return null (will be populated via a separate sync process or GovTrack person endpoint).
 */
export async function mapGovTrackPersonToBioguideId(
	_govtrackPersonId: number,
): Promise<string | null> {
	// TODO: Implement mapping from govtrack_person_id -> bioguide_id
	// Option 1: Query GovTrack /person/{id} and extract bioguide_id
	// Option 2: Maintain a sync table that maps these IDs (requires ETL or external service)
	// For now, return null to signal that mapping isn't ready yet.
	return null;
}
