import { z } from "zod";
import { civicFetchJson, type CivicApiError } from "@/lib/civic/http";

const BASE = "https://www.googleapis.com/civicinfo/v2";

function apiKey(): string | null {
  return process.env.GOOGLE_CIVIC_API_KEY?.trim() || null;
}

function withKey(path: string, params: Record<string, string>): string | null {
  const key = apiKey();
  if (!key) return null;
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("key", key);
  return u.toString();
}

const divisionsByAddressSchema = z
  .object({
    normalizedInput: z.record(z.string(), z.unknown()).optional(),
    divisions: z.record(z.string(), z.object({ name: z.string().optional() }).passthrough()).optional(),
  })
  .passthrough();

export type GoogleCivicDivisionsResult = z.infer<typeof divisionsByAddressSchema>;

export async function divisionsByAddress(
  address: string,
): Promise<{ ok: true; data: GoogleCivicDivisionsResult } | { ok: false; error: CivicApiError }> {
  const url = withKey("/divisionsByAddress", { address: address.trim() });
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "GOOGLE_CIVIC_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => divisionsByAddressSchema.parse(raw),
  });
}

const electionsListSchema = z
  .object({
    elections: z.array(z.record(z.string(), z.unknown())).optional(),
    kind: z.string().optional(),
  })
  .passthrough();

/**
 * Google Civic v2 exposes a global election discovery list at `/elections`.
 * Address-specific contests are returned via {@link voterInfoByAddress} once you have an `electionId`.
 */
export async function electionsByAddress(
  _address: string,
): Promise<{ ok: true; data: z.infer<typeof electionsListSchema> } | { ok: false; error: CivicApiError }> {
  const url = withKey("/elections", {});
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "GOOGLE_CIVIC_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => electionsListSchema.parse(raw),
  });
}

const voterInfoSchema = z.record(z.string(), z.unknown());

export async function voterInfoByAddress(
  address: string,
  electionId?: string,
): Promise<{ ok: true; data: z.infer<typeof voterInfoSchema> } | { ok: false; error: CivicApiError }> {
  const params: Record<string, string> = { address: address.trim() };
  if (electionId) params.electionId = electionId;
  const url = withKey("/voterinfo", params);
  if (!url) {
    return { ok: false, error: { kind: "unknown", message: "GOOGLE_CIVIC_API_KEY is not set" } };
  }
  return civicFetchJson({
    url,
    parse: (raw) => voterInfoSchema.parse(raw),
  });
}
