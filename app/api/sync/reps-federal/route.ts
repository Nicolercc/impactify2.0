import { NextResponse } from "next/server";
import { listMembersByState } from "@/lib/civic/congress-gov";
import { federalRepresentativeRow } from "@/lib/civic/rep-mappers";
import { beginSyncJob, finishSyncJob } from "@/lib/civic/sync-job";
import { verifySyncSecret } from "@/lib/civic/sync-secret";
import { US_STATE_CODES } from "@/lib/civic/us-states";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const started = Date.now();
  const secret = process.env.SYNC_SECRET;
  if (!verifySyncSecret(request.headers.get("x-sync-secret"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Service client unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const job = await beginSyncJob(supabase, "reps_federal");
  if (!job.ok) {
    return NextResponse.json({ error: job.message }, { status: 500 });
  }

  const rows: ReturnType<typeof federalRepresentativeRow>[] = [];
  const errors: string[] = [];
  let failedStates = 0;

  for (const code of US_STATE_CODES) {
    const res = await listMembersByState(code);
    if (!res.ok) {
      failedStates += 1;
      errors.push(`${code}: ${res.error.message}`);
      continue;
    }
    for (const m of res.data) {
      rows.push(federalRepresentativeRow(m));
    }
  }

  let upserted = 0;
  const chunk = 80;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from("representatives").upsert(slice, { onConflict: "bioguide_id" });
    if (error) {
      errors.push(`upsert ${i}-${i + slice.length}: ${error.message}`);
    } else {
      upserted += slice.length;
    }
  }

  const status = errors.length > 0 && upserted === 0 ? "failed" : "success";
  await finishSyncJob(supabase, job.id, {
    status,
    recordsUpserted: upserted,
    recordsFailed: failedStates,
    errorMessage: errors.length ? errors.slice(0, 20).join(" | ").slice(0, 8000) : null,
  });

  return NextResponse.json({
    jobId: job.id,
    recordsUpserted: upserted,
    recordsFailed: failedStates,
    durationMs: Date.now() - started,
    errors: errors.length ? errors.slice(0, 10) : undefined,
  });
}
