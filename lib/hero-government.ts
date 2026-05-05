export type HeroGovernment = {
  stateCode: string;
  stateName: string;
  senators: { name: string }[];
  houseLabel: string;
  sourceLabel: string;
  updatedAt: string;
};

const PROPUBLICA_BASE = "https://api.propublica.org/congress/v1";

function fullName(m: any): string {
  const parts = [m?.first_name, m?.middle_name, m?.last_name].filter(Boolean);
  return parts.join(" ").trim();
}

export async function fetchHeroGovernmentNY(): Promise<HeroGovernment | null> {
  const key = process.env.PROPUBLICA_API_KEY?.trim();
  if (!key) return null;

  const updatedAt = new Date().toISOString();
  const congress = "118";
  const state = "NY";

  const url = `${PROPUBLICA_BASE}/${congress}/senate/members/${state}.json`;
  const r = await fetch(url, {
    headers: { "X-API-Key": key },
    next: { revalidate: 86_400 },
  });
  if (!r.ok) return null;

  const json = (await r.json()) as any;
  const members = json?.results?.[0]?.members;
  if (!Array.isArray(members) || members.length < 2) return null;

  // Keep it conservative: show the two senators (always true), and a district-agnostic house label.
  const senators = members
    .map((m: any) => ({ name: fullName(m) }))
    .filter((m: { name: string }) => Boolean(m.name))
    .slice(0, 2);

  if (senators.length < 2) return null;

  return {
    stateCode: "NY",
    stateName: "New York",
    senators,
    // We don’t know the user’s district in the hero. Keep the claim truthful.
    houseLabel: "House member (district shown after ZIP)",
    sourceLabel: "ProPublica Congress API",
    updatedAt,
  };
}

