import { z } from "zod";
import { civicFetchJson, type CivicApiError } from "@/lib/civic/http";

const BASE = "https://v3.openstates.org";

function apiKey(): string | null {
  return process.env.OPENSTATES_API_KEY?.trim() || null;
}

function headers(): HeadersInit {
  const key = apiKey();
  return {
    Accept: "application/json",
    ...(key ? { "X-API-KEY": key } : {}),
  };
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string | null {
  if (!apiKey()) return null;
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

const personSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    party: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    jurisdiction: z
      .object({
        id: z.string().optional(),
        classification: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    current_role: z
      .object({
        title: z.string().optional(),
        org_classification: z.string().optional(),
        district: z.union([z.string(), z.number()]).optional().nullable(),
        division_id: z.string().optional().nullable(),
      })
      .optional(),
  })
  .passthrough();

const personDetailSchema = personSchema;

const peopleListSchema = z
  .object({
    results: z.array(personSchema).optional(),
    pagination: z
      .object({
        page: z.number().optional(),
        per_page: z.number().optional(),
        max_page: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

export type OpenStatesPerson = z.infer<typeof personSchema>;

export async function getLegislator(
  openstatesId: string,
): Promise<{ ok: true; data: OpenStatesPerson } | { ok: false; error: CivicApiError }> {
  const id = encodeURIComponent(openstatesId.trim());
  const url = buildUrl(`/people/${id}`, {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "OPENSTATES_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    init: { headers: headers() },
    parse: (raw) => personDetailSchema.parse(raw),
  });
}

export async function listLegislatorsByJurisdiction(
  state: string,
): Promise<{ ok: true; data: OpenStatesPerson[] } | { ok: false; error: CivicApiError }> {
  const st = state.trim().toLowerCase();
  const jurisdiction = `ocd-jurisdiction/country:us/state:${st}`;
  const collected: OpenStatesPerson[] = [];
  let page = 1;
  const perPage = 100;
  for (;;) {
    const url = buildUrl("/people", {
      jurisdiction,
      page,
      per_page: perPage,
    });
    if (!url) {
      return { ok: false, error: { kind: "unknown", message: "OPENSTATES_API_KEY is not set" } };
    }
    const res = await civicFetchJson({
      url,
      init: { headers: headers() },
      parse: (raw) => peopleListSchema.parse(raw),
    });
    if (!res.ok) return res;
    const batch = res.data.results ?? [];
    collected.push(...batch);
    if (batch.length === 0) break;
    const maxPage = res.data.pagination?.max_page;
    if (maxPage !== undefined && page >= maxPage) break;
    if (batch.length < perPage) break;
    page += 1;
  }
  return { ok: true, data: collected };
}

const billDetailSchema = z.record(z.string(), z.unknown());

export async function getBill(
  jurisdiction: string,
  session: string,
  billId: string,
): Promise<{ ok: true; data: z.infer<typeof billDetailSchema> } | { ok: false; error: CivicApiError }> {
  const j = encodeURIComponent(jurisdiction.trim());
  const s = encodeURIComponent(session.trim());
  const b = encodeURIComponent(billId.trim());
  const url = buildUrl(`/bills/${j}/${s}/${b}`, {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "OPENSTATES_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    init: { headers: headers() },
    parse: (raw) => billDetailSchema.parse(raw),
  });
}

const billSearchSchema = z
  .object({
    results: z.array(z.record(z.string(), z.unknown())).optional(),
    pagination: z
      .object({
        page: z.number().optional(),
        per_page: z.number().optional(),
        max_page: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

export type OpenStatesBillSearchFilters = {
  jurisdiction?: string;
  session?: string;
  subject?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export async function searchBills(
  filters: OpenStatesBillSearchFilters,
): Promise<
  { ok: true; data: { results: Record<string, unknown>[]; page: number; maxPage: number } } | { ok: false; error: CivicApiError }
> {
  const url = buildUrl("/bills", {
    jurisdiction: filters.jurisdiction,
    session: filters.session,
    subject: filters.subject,
    search: filters.search,
    page: filters.page ?? 1,
    per_page: filters.perPage ?? 20,
  });
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "OPENSTATES_API_KEY is not set" } };
  }
  const res = await civicFetchJson({
    url,
    init: { headers: headers() },
    parse: (raw) => billSearchSchema.parse(raw),
  });
  if (!res.ok) return res;
  const page = res.data.pagination?.page ?? filters.page ?? 1;
  const maxPage = res.data.pagination?.max_page ?? page;
  return {
    ok: true,
    data: {
      results: res.data.results ?? [],
      page,
      maxPage,
    },
  };
}
