import "server-only";

type GovTrackPersonListItem = {
	bioguideid?: string;
	lastname?: string;
	link?: string;
};

type GovTrackList<T> = { objects?: T[] };

/**
 * Resolve GovTrack numeric person id from ProPublica bioguide + last name search.
 * Photo CDN: `https://www.govtrack.us/static/legislator-photos/{id}-200px.jpeg`
 */
export async function resolveGovTrackPersonId(opts: {
	lastName: string;
	bioguideId: string;
}): Promise<number | null> {
	const q = encodeURIComponent(opts.lastName.trim());
	const url = `https://www.govtrack.us/api/v2/person?q=${q}&limit=15`;
	const res = await fetch(url, {
		next: { revalidate: 86_400 },
		headers: { accept: "application/json" },
	});
	if (!res.ok) return null;

	const data = (await res.json()) as GovTrackList<GovTrackPersonListItem>;
	const objects = data.objects ?? [];
	const hit =
		objects.find((p) => p.bioguideid === opts.bioguideId) ?? objects[0];
	if (!hit?.link) return null;

	const m = hit.link.match(/\/(\d+)\/?$/);
	if (!m) return null;
	const id = Number.parseInt(m[1]!, 10);
	return Number.isFinite(id) ? id : null;
}

export function govtrackLegislatorPhotoUrl(govtrackPersonId: number): string {
	return `https://www.govtrack.us/static/legislator-photos/${govtrackPersonId}-200px.jpeg`;
}
