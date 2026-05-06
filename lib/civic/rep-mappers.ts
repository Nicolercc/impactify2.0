import type { CongressMemberListRecord } from "@/lib/civic/congress-gov";
import type { OpenStatesPerson } from "@/lib/civic/openstates";

function listNameToDisplay(name: string): string {
  const parts = name.split(",").map((s) => s.trim());
  if (parts.length === 2) return `${parts[1]} ${parts[0]}`.trim();
  return name.trim();
}

export function abbrevParty(partyName: string | null): string | null {
  if (!partyName) return null;
  const n = partyName.toLowerCase();
  if (n.includes("democrat")) return "D";
  if (n.includes("republican")) return "R";
  if (n.includes("independent")) return "I";
  if (n.includes("libertarian")) return "L";
  return partyName.slice(0, 12);
}

export type RepresentativeUpsertRow = Record<string, unknown>;

export function federalRepresentativeRow(m: CongressMemberListRecord): RepresentativeUpsertRow {
  const role = m.chamber === "senate" ? "senator" : "house_rep";
  return {
    bioguide_id: m.bioguideId,
    full_name: listNameToDisplay(m.name),
    party: abbrevParty(m.partyName),
    state: m.state,
    district: m.district,
    role,
    chamber: m.chamber,
    level: "federal",
    photo_url: m.imageUrl,
    website_url: null,
    phone: null,
    office_address: null,
    email: null,
    twitter: null,
    openstates_id: null,
    ocd_id: null,
    synced_at: new Date().toISOString(),
    deleted_at: null,
  };
}

export function stateRepresentativeRow(p: OpenStatesPerson, stateUpper: string): RepresentativeUpsertRow | null {
  const id = p.id?.trim();
  const name = p.name?.trim();
  if (!id || !name) return null;

  const org = p.current_role?.org_classification?.toLowerCase() ?? "";
  const isUpper = org.includes("upper");
  const chamber = isUpper ? "state_senate" : "state_house";
  const role = isUpper ? "state_senator" : "state_rep";
  const district =
    p.current_role?.district === undefined || p.current_role?.district === null
      ? null
      : String(p.current_role.district);

  return {
    openstates_id: id,
    bioguide_id: null,
    full_name: name,
    party: p.party ? abbrevParty(p.party) : null,
    state: stateUpper,
    district,
    role,
    chamber,
    level: "state",
    photo_url: p.image ?? null,
    ocd_id: id.startsWith("ocd-person/") ? id : id,
    website_url: null,
    phone: null,
    office_address: null,
    email: null,
    twitter: null,
    synced_at: new Date().toISOString(),
    deleted_at: null,
  };
}
