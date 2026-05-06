import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { briefingFromRow } from "@/lib/news/briefing";
import type { AiBriefingRow } from "@/lib/news/queries";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  articleId: z.string().min(1).max(500),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(120_000),
});

const briefingSchema = z.object({
  background: z.string(),
  keyPlayers: z.array(z.object({ name: z.string(), role: z.string() })),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })),
  whatsAtStake: z.string(),
});

const SYSTEM = [
  "You are a civic intelligence briefing generator for Impactify, a civic action platform. Given a news article, produce a structured briefing matching the provided schema.",
  "",
  "Rules:",
  "- Output ONLY valid JSON. No markdown fences, no commentary before or after the JSON object.",
  "- The first non-whitespace character of your entire response must be an opening curly brace and the last non-whitespace character must be a closing curly brace.",
  "- Keep each section concise. Background: 2-3 sentences.",
  "- Key players: max 4 entries.",
  "- Timeline: max 5 events; use short date labels like \"Apr 2025\" or \"-14d\" when exact dates are unknown.",
  "- What's at stake: 1-2 sentences focused on civic impact.",
].join("\n");

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateLimitBuckets = new Map<string, number[]>();

function allowBriefingRequest(key: string): boolean {
  const now = Date.now();
  let stamps = rateLimitBuckets.get(key) ?? [];
  stamps = stamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (stamps.length >= RATE_MAX) {
    rateLimitBuckets.set(key, stamps);
    return false;
  }
  stamps.push(now);
  rateLimitBuckets.set(key, stamps);
  return true;
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function POST(req: Request) {
  // TODO: Re-enable auth check after demo period
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip")?.trim() ??
    "anon";

  if (!allowBriefingRequest(`ip:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { articleId, title, body } = parsed.data;

  const canUseDb = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) && isUuid(articleId);

  if (canUseDb) {
    const serviceSupabase = createServiceRoleClient();

    const { data: foundArticle, error: articleError } = await serviceSupabase
      .from("articles")
      .select("id")
      .eq("id", articleId)
      .is("deleted_at", null)
      .maybeSingle();

    if (articleError || !foundArticle) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const { data: existingRow, error: briefingSelectError } = await serviceSupabase
      .from("ai_briefings")
      .select("*")
      .eq("article_id", articleId)
      .is("deleted_at", null)
      .maybeSingle();

    if (briefingSelectError) {
      console.error("[briefings/generate] Cached briefing lookup error", briefingSelectError.message);
      return NextResponse.json({ error: "Briefing lookup failed." }, { status: 500 });
    }

    const cached = briefingFromRow(existingRow as AiBriefingRow | null);
    if (cached) {
      return NextResponse.json({ cached: true, briefing: cached }, { status: 200 });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 503 });
  }

  const excerpt = body.slice(0, 1500);
  const userPrompt = `Title: ${title}\n\nArticle excerpt:\n${excerpt}`;

  try {
    const { object: briefing } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: briefingSchema,
      schemaName: "ImpactifyBriefing",
      schemaDescription: "Structured civic intelligence briefing for a news article",
      system: SYSTEM,
      prompt: userPrompt,
      temperature: 0.35,
      maxOutputTokens: 4096,
      abortSignal: req.signal,
    });

    if (canUseDb) {
      const persistClient = createServiceRoleClient();
      const { error } = await persistClient.from("ai_briefings").upsert(
        {
          article_id: articleId,
          background: briefing.background,
          key_players: briefing.keyPlayers,
          timeline: briefing.timeline,
          whats_at_stake: briefing.whatsAtStake,
          model: "claude-haiku-4-5-20251001",
          deleted_at: null,
        },
        { onConflict: "article_id" },
      );
      if (error) {
        console.error("[briefings/generate] Upsert error", error.message);
      }
    }
    return NextResponse.json({ briefing }, { status: 200 });
  } catch (e) {
    console.error("[briefings/generate] generateObject failed", e);
    const msg = e instanceof Error ? e.message : "Briefing generation failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
