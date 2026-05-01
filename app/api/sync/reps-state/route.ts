import { NextResponse } from "next/server";
import { z } from "zod";
import { listLegislatorsByJurisdiction } from "@/lib/civic/openstates";
import { stateRepresentativeRow } from "@/lib/civic/rep-mappers";
import { beginSyncJob, finishSyncJob } from "@/lib/civic/sync-job";
import { verifySyncSecret } from "@/lib/civic/sync-secret";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const bodySchema = z.object({
  state: z
    .string()
    .trim()
    .min(2)
    .max(2)
    .transform((s) => s.toUpperCase()),
});

export async function POST(request: Request) {
  const started = Date.now();
  const secret = process.env.SYNC_SECRET;
  if (!verifySyncSecret(request.headers.get("x-sync-secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Service client unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const job = await beginSyncJob(supabase, "reps_state");
  if (!job.ok) {
    return NextResponse.json({ error: job.message }, { status: 500 });
  }

  const state = parsed.data.state;
  const list = await listLegislatorsByJurisdiction(state);
  if (!list.ok) {
    await finishSyncJob(supabase, job.id, {
      status: "failed",
      recordsUpserted: 0,
      recordsFailed: 1,
      errorMessage: list.error.message,
    });
    return NextResponse.json(
      {
        jobId: job.id,
        recordsUpserted: 0,
        durationMs: Date.now() - started,
        error: list.error,
      },
      { status: 502 },
    );
  }

  const byOpenStatesId = new Map<string, NonNullable<ReturnType<typeof stateRepresentativeRow>>>();
  for (const p of list.data) {
    const row = stateRepresentativeRow(p, state);
    if (!row) continue;
    const id = row.openstates_id as string;
    byOpenStatesId.set(id, row);
  }
  const rows = [...byOpenStatesId.values()];

  let upserted = 0;
  const chunk = 80;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from("representatives").upsert(slice, { onConflict: "openstates_id" });
    if (error) {
      errors.push(`upsert ${i}: ${error.message}`);
    } else {
      upserted += slice.length;
    }
  }

  const status = errors.length > 0 && upserted === 0 ? "failed" : "success";
  await finishSyncJob(supabase, job.id, {
    status,
    recordsUpserted: upserted,
    recordsFailed: errors.length,
    errorMessage: errors.length ? errors.join(" | ").slice(0, 8000) : null,
  });

  return NextResponse.json({
    jobId: job.id,
    recordsUpserted: upserted,
    durationMs: Date.now() - started,
    errors: errors.length ? errors : undefined,
  });
}
