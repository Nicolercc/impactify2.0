import { z } from "zod";
import { civicFetchJson, type CivicApiError } from "@/lib/civic/http";

const BASE = "https://api.congress.gov/v3";

function apiKey(): string | null {
  return process.env.CONGRESS_GOV_API_KEY?.trim() || null;
}

function withKey(path: string, search: Record<string, string>): string | null {
  const key = apiKey();
  if (!key) return null;
  const u = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
  for (const [k, v] of Object.entries(search)) u.searchParams.set(k, v);
  u.searchParams.set("format", "json");
  u.searchParams.set("api_key", key);
  return u.toString();
}

const paginationSchema = z
  .object({
    count: z.number().optional(),
    next: z.string().optional().nullable(),
  })
  .passthrough();

const memberListItemSchema = z
  .object({
    bioguideId: z.string().optional(),
    state: z.string().optional(),
    partyName: z.string().optional(),
    district: z.union([z.number(), z.string()]).optional().nullable(),
    name: z.string().optional(),
    depiction: z
      .object({
        imageUrl: z.string().optional(),
      })
      .optional(),
    terms: z
      .object({
        item: z.union([z.array(z.record(z.string(), z.unknown())), z.record(z.string(), z.unknown())]).optional(),
      })
      .optional(),
  })
  .passthrough();

const memberListResponseSchema = z
  .object({
    members: z
      .array(
        z.union([
          z.object({ member: memberListItemSchema }),
          memberListItemSchema,
        ]),
      )
      .optional(),
    pagination: paginationSchema.optional(),
  })
  .passthrough();

type MemberListResponse = z.infer<typeof memberListResponseSchema>;

type CivicFetchMemberListResult =
  | { ok: true; data: MemberListResponse }
  | { ok: false; error: CivicApiError };

export type CongressMemberListRecord = {
  bioguideId: string;
  name: string;
  state: string;
  partyName: string | null;
  district: string | null;
  chamber: "senate" | "house";
  imageUrl: string | null;
};

function unwrapMember(entry: unknown): z.infer<typeof memberListItemSchema> | null {
  const o = entry as Record<string, unknown>;
  if (o && typeof o === "object" && "member" in o && o.member && typeof o.member === "object") {
    return memberListItemSchema.safeParse(o.member).data ?? null;
  }
  const p = memberListItemSchema.safeParse(entry);
  return p.success ? p.data : null;
}

function latestChamberFromTerms(m: z.infer<typeof memberListItemSchema>): "senate" | "house" {
  const raw = m.terms?.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  let last: Record<string, unknown> | null = null;
  for (const it of items) {
    if (it && typeof it === "object") last = it as Record<string, unknown>;
  }
  const ch = typeof last?.chamber === "string" ? last.chamber.toLowerCase() : "";
  if (ch.includes("senate")) return "senate";
  return "house";
}

function toListRecord(m: z.infer<typeof memberListItemSchema>): CongressMemberListRecord | null {
  const bioguideId = m.bioguideId?.trim();
  const name = m.name?.trim();
  const state = m.state?.trim();
  if (!bioguideId || !name || !state) return null;
  const chamber = latestChamberFromTerms(m);
  const d = m.district;
  const districtStr =
    chamber === "senate"
      ? null
      : d === undefined || d === null
        ? null
        : String(d);
  return {
    bioguideId,
    name,
    state,
    partyName: m.partyName?.trim() ?? null,
    district: districtStr,
    chamber,
    imageUrl: m.depiction?.imageUrl?.trim() ?? null,
  };
}

export async function listMembersByState(
  state: string,
  chamber?: "senate" | "house",
): Promise<{ ok: true; data: CongressMemberListRecord[] } | { ok: false; error: CivicApiError }> {
  if (!apiKey()) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  const upper = state.trim().toUpperCase();
  const collected: CongressMemberListRecord[] = [];
  let nextUrl: string | null =
    withKey(`/member/${encodeURIComponent(upper)}`, {
      currentMember: "true",
      limit: "250",
      offset: "0",
    }) ?? null;
  if (!nextUrl) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }

  while (nextUrl) {
    const memberPage: CivicFetchMemberListResult = await civicFetchJson<MemberListResponse>({
      url: nextUrl,
      parse: (raw) => memberListResponseSchema.parse(raw),
    });
    if (!memberPage.ok) return memberPage;
    const members = memberPage.data.members ?? [];
    for (const entry of members) {
      const m = unwrapMember(entry);
      if (!m) continue;
      const rec = toListRecord(m);
      if (!rec) continue;
      if (chamber && rec.chamber !== chamber) continue;
      collected.push(rec);
    }
    const nextLink: string | null | undefined = memberPage.data.pagination?.next;
    nextUrl =
      typeof nextLink === "string" && nextLink.length > 0
        ? nextLink.includes("api_key=")
          ? nextLink
          : `${nextLink}${nextLink.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(apiKey() ?? "")}`
        : null;
  }

  return { ok: true, data: collected };
}

const memberDetailSchema = z.record(z.string(), z.unknown());

export type CongressMemberDetail = z.infer<typeof memberDetailSchema>;

export async function getMember(
  bioguideId: string,
): Promise<
  { ok: true; data: CongressMemberDetail } | { ok: false; error: CivicApiError }
> {
  const id = encodeURIComponent(bioguideId.trim());
  const url = withKey(`/member/${id}`, {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => memberDetailSchema.parse(raw),
  });
}

const billDetailSchema = z.record(z.string(), z.unknown());

export async function getBill(
  congress: string,
  type: string,
  number: string,
): Promise<{ ok: true; data: z.infer<typeof billDetailSchema> } | { ok: false; error: CivicApiError }> {
  const path = `/bill/${encodeURIComponent(congress)}/${encodeURIComponent(type)}/${encodeURIComponent(number)}`;
  const url = withKey(path, {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => billDetailSchema.parse(raw),
  });
}

const billActionsSchema = z.record(z.string(), z.unknown());

export async function getBillActions(
  congress: string,
  type: string,
  number: string,
): Promise<{ ok: true; data: z.infer<typeof billActionsSchema> } | { ok: false; error: CivicApiError }> {
  const path = `/bill/${encodeURIComponent(congress)}/${encodeURIComponent(type)}/${encodeURIComponent(number)}/actions`;
  const url = withKey(path, {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => billActionsSchema.parse(raw),
  });
}

const memberVotesSchema = z.record(z.string(), z.unknown());

/**
 * Fetches member vote history when available from Congress.gov.
 * The exact sub-resource varies by chamber/congress; callers should tolerate empty payloads.
 */
export async function getMemberVotes(
  bioguideId: string,
  limit: number,
): Promise<{ ok: true; data: unknown } | { ok: false; error: CivicApiError }> {
  if (!apiKey()) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  const id = encodeURIComponent(bioguideId.trim());
  const lim = Math.min(Math.max(limit, 1), 250);
  const url = withKey(`/member/${id}/votes`, { limit: String(lim) });
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "CONGRESS_GOV_API_KEY is not set" } };
  }
  const res = await civicFetchJson({
    url,
    parse: (raw) => memberVotesSchema.parse(raw),
  });
  if (!res.ok && res.error.kind === "not_found") {
    return { ok: true, data: { votes: [] } };
  }
  return res;
}
