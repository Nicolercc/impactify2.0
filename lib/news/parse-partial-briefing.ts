import type { BriefingContent, BriefingKeyPlayer, BriefingTimelineEvent } from "@/lib/news/briefing";

export type PartialBriefing = Partial<{
  background: string;
  keyPlayers: BriefingKeyPlayer[];
  timeline: BriefingTimelineEvent[];
  whatsAtStake: string;
}>;

function stripJsonFence(raw: string) {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return s.trim();
}

/** Unicode “smart” quotes break `JSON.parse`; models often emit them inside strings. */
function normalizeJsonQuotes(s: string) {
  return s
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019/g, "'");
}

function extractJsonString(input: string, key: string): string | undefined {
  const needle = `"${key}"`;
  const idx = input.indexOf(needle);
  if (idx === -1) return undefined;
  const after = input.slice(idx + needle.length);
  const m = after.match(/^\s*:\s*"/);
  if (!m) return undefined;
  const start = idx + needle.length + m[0].length;
  let out = "";
  let i = start;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\\") {
      if (i + 1 >= input.length) return undefined;
      out += input[i + 1];
      i += 2;
      continue;
    }
    if (ch === '"') return out;
    out += ch;
    i++;
  }
  return undefined;
}

function extractJsonArrayLiteral(input: string, key: string): string | null {
  const re = new RegExp(`"${key}"\\s*:\\s*\\[`, "m");
  const match = re.exec(input);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[0].length - 1;
  if (input[start] !== "[") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const c = input[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === "\\") {
        escaped = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "[") depth++;
    if (c === "]") {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
}

function tryParseArray<T>(literal: string | null): T[] | undefined {
  if (!literal) return undefined;
  try {
    const v = JSON.parse(literal) as unknown;
    return Array.isArray(v) ? (v as T[]) : undefined;
  } catch {
    return undefined;
  }
}

/** Best-effort parse while a JSON object is still streaming in. */
export function parsePartialBriefingJson(buffer: string): PartialBriefing {
  const input = normalizeJsonQuotes(stripJsonFence(buffer));
  const out: PartialBriefing = {};

  const bg = extractJsonString(input, "background");
  if (bg !== undefined) out.background = bg;

  const stake =
    extractJsonString(input, "whatsAtStake") ?? extractJsonString(input, "whats_at_stake");
  if (stake !== undefined) out.whatsAtStake = stake;

  const kpLit =
    extractJsonArrayLiteral(input, "keyPlayers") ?? extractJsonArrayLiteral(input, "key_players");
  const kp = tryParseArray<BriefingKeyPlayer>(kpLit);
  if (kp) out.keyPlayers = kp;

  const tlLit = extractJsonArrayLiteral(input, "timeline");
  const tl = tryParseArray<BriefingTimelineEvent>(tlLit);
  if (tl) out.timeline = tl;

  return out;
}

function normalizePlayers(value: unknown): BriefingKeyPlayer[] {
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

function normalizeTimeline(value: unknown): BriefingTimelineEvent[] {
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

function briefingFromParsedRecord(v: Record<string, unknown>): BriefingContent {
  const background = typeof v.background === "string" ? v.background : "";
  const whatsRaw = v.whatsAtStake ?? v.whats_at_stake;
  const whatsAtStake = typeof whatsRaw === "string" ? whatsRaw : "";
  const keyPlayers = normalizePlayers(v.keyPlayers ?? v.key_players);
  const timeline = normalizeTimeline(v.timeline);
  return { background, keyPlayers, timeline, whatsAtStake };
}

function tryParseBriefingObjectString(s: string): BriefingContent | null {
  try {
    const v = JSON.parse(s) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    return briefingFromParsedRecord(v as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** First top-level `{ ... }` in `s` starting at `start` (must be `{`), respecting strings and escapes. */
function extractBalancedJsonObject(s: string, start: number): string | null {
  if (s[start] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === "\\") {
        escaped = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** Full model output: strip fences, parse JSON; if wrapped in prose, extract first balanced `{...}` and parse. */
export function parseBriefingJsonComplete(buffer: string): BriefingContent | null {
  const cleaned = normalizeJsonQuotes(stripJsonFence(buffer));
  const direct = tryParseBriefingObjectString(cleaned);
  if (direct) return direct;
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  const slice = extractBalancedJsonObject(cleaned, start);
  if (!slice) return null;
  return tryParseBriefingObjectString(slice);
}
