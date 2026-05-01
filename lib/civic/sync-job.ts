import type { SupabaseClient } from "@supabase/supabase-js";

export async function beginSyncJob(
  supabase: SupabaseClient,
  jobType: string,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const { data, error } = await supabase
    .from("sync_jobs")
    .insert({
      job_type: jobType,
      status: "running",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { ok: false, message: error?.message ?? "Failed to create sync_jobs row" };
  }
  return { ok: true, id: data.id as string };
}

export async function finishSyncJob(
  supabase: SupabaseClient,
  jobId: string,
  fields: {
    status: "success" | "failed";
    recordsUpserted?: number;
    recordsFailed?: number;
    errorMessage?: string | null;
  },
): Promise<void> {
  await supabase
    .from("sync_jobs")
    .update({
      status: fields.status,
      completed_at: new Date().toISOString(),
      records_upserted: fields.recordsUpserted ?? 0,
      records_failed: fields.recordsFailed ?? 0,
      error_message: fields.errorMessage ?? null,
    })
    .eq("id", jobId);
}
