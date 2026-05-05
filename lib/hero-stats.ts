import { fetchNewsArticles } from "@/lib/news/queries";

export type HeroStatSource = "ProPublica" | "GovTrack" | "The Guardian" | "Internal";

export type HeroStat = {
  label: string;
  value: number;
  source: HeroStatSource;
  updatedAt: string;
  /** True only for <5m updates. We don’t claim that today. */
  isLive: boolean;
  /** Flag to support “Data from yesterday” UI. */
  isStale?: boolean;
  /** Flag to support honest demo labeling. */
  isExample?: boolean;
};

const PROPUBLICA_BASE = "https://api.propublica.org/congress/v1";

async function fetchProPublicaMemberCount(): Promise<number | null> {
  const key = process.env.PROPUBLICA_API_KEY?.trim();
  if (!key) return null;

  // Count current members across Senate + House for the current Congress.
  // This is cheap and stable and can be cached hourly.
  const congress = "118";
  const chambers = ["senate", "house"] as const;

  const res = await Promise.all(
    chambers.map(async (ch) => {
      const url = `${PROPUBLICA_BASE}/${congress}/${ch}/members.json`;
      const r = await fetch(url, {
        headers: { "X-API-Key": key },
        next: { revalidate: 3600 },
      });
      if (!r.ok) return null;
      const json = (await r.json()) as any;
      const members = json?.results?.[0]?.members;
      return Array.isArray(members) ? members.length : null;
    }),
  );

  if (res.some((x) => x == null)) return null;
  return (res[0] ?? 0) + (res[1] ?? 0);
}

function countArticlesToday(articles: Awaited<ReturnType<typeof fetchNewsArticles>>): number {
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  const d = today.getUTCDate();
  return articles.filter((a) => {
    const t = new Date(a.webPublicationDate);
    return t.getUTCFullYear() === y && t.getUTCMonth() === m && t.getUTCDate() === d;
  }).length;
}

export async function fetchHeroStats(): Promise<HeroStat[]> {
  const updatedAt = new Date().toISOString();

  const [articles, repCount] = await Promise.all([
    fetchNewsArticles(),
    fetchProPublicaMemberCount(),
  ]);

  // If ProPublica is unavailable, mark as example rather than inventing “live”.
  const repsTracked: HeroStat = repCount
    ? { label: "REPS TRACKED", value: repCount, source: "ProPublica", updatedAt, isLive: false }
    : {
        label: "REPS TRACKED",
        value: 535,
        source: "ProPublica",
        updatedAt,
        isLive: false,
        isExample: true,
      };

  const articlesToday: HeroStat = {
    label: "ARTICLES TODAY",
    value: countArticlesToday(articles),
    source: "The Guardian",
    updatedAt,
    isLive: false,
  };

  // “AI BRIEFINGS” is internal: today it’s the marketing briefing generator + any cached runs.
  // We don’t have a persisted counter here yet, so we keep it conservative and label as example.
  const aiBriefings: HeroStat = {
    label: "AI BRIEFINGS",
    value: 12,
    source: "Internal",
    updatedAt,
    isLive: false,
    isExample: true,
  };

  // “BILLS THIS SESSION”: we don’t have a reliable cross-session count wired.
  // Better to omit than mislead. (Hero can render fewer than 4.)
  return [repsTracked, articlesToday, aiBriefings];
}

