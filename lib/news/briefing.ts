import type { AiBriefingRow } from "@/lib/news/queries";

export type BriefingKeyPlayer = { name: string; role: string };
export type BriefingTimelineEvent = { date: string; event: string };

export type BriefingContent = {
  background: string;
  keyPlayers: BriefingKeyPlayer[];
  timeline: BriefingTimelineEvent[];
  whatsAtStake: string;
};

function asPlayerArray(value: unknown): BriefingKeyPlayer[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const name = typeof r.name === "string" ? r.name : "";
      const role = typeof r.role === "string" ? r.role : "";
      if (!name && !role) return null;
      return { name, role };
    })
    .filter(Boolean) as BriefingKeyPlayer[];
}

function asTimelineArray(value: unknown): BriefingTimelineEvent[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const date = typeof r.date === "string" ? r.date : "";
      const event = typeof r.event === "string" ? r.event : "";
      if (!date && !event) return null;
      return { date, event };
    })
    .filter(Boolean) as BriefingTimelineEvent[];
}

export function briefingFromRow(row: AiBriefingRow | null | undefined): BriefingContent | null {
  if (!row || row.deleted_at) return null;
  return {
    background: row.background?.trim() ?? "",
    keyPlayers: asPlayerArray(row.key_players),
    timeline: asTimelineArray(row.timeline),
    whatsAtStake: row.whats_at_stake?.trim() ?? "",
  };
}

export function pickActiveBriefingRow(rows: AiBriefingRow[] | null | undefined): AiBriefingRow | null {
  const list = rows ?? [];
  const active = list.find((r) => !r.deleted_at);
  return active ?? null;
}
