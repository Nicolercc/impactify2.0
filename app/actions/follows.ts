"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { toggleFollowSchema } from "@/lib/schemas/follows";

type ActionError = { message: string; code?: string };
type ActionResult<T> = { data: T | null; error: ActionError | null };

function zodError(error: z.ZodError): ActionError {
  return { message: error.issues[0]?.message ?? "Invalid input", code: "invalid_input" };
}

async function requireUserId(): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { data: null, error: { message: error.message, code: error.code } };
  if (!data.user) return { data: null, error: { message: "Not signed in", code: "not_authenticated" } };
  return { data: data.user.id, error: null };
}

async function revalidateFollowPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entityType: string,
  entityId: string,
) {
  if (entityType === "cause") {
    const { data } = await supabase.from("causes").select("slug").eq("id", entityId).maybeSingle();
    if (data?.slug) {
      revalidatePath(`/causes/${data.slug}`);
    }
    return;
  }
  revalidatePath("/dashboard");
}

export async function toggleFollow(
  entityType: string,
  entityId: string,
): Promise<ActionResult<{ following: boolean }>> {
  const parsed = toggleFollowSchema.safeParse({ entityType, entityId });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const userIdResult = await requireUserId();
  if (userIdResult.error || !userIdResult.data) return { data: null, error: userIdResult.error };

  const userId = userIdResult.data;

  const { data: existing, error: existingError } = await supabase
    .from("follows")
    .select("id, deleted_at")
    .eq("user_id", userId)
    .eq("entity_type", parsed.data.entityType)
    .eq("entity_id", parsed.data.entityId)
    .maybeSingle();
  if (existingError) return { data: null, error: { message: existingError.message, code: existingError.code } };

  if (existing?.id && !existing.deleted_at) {
    const { error } = await supabase
      .from("follows")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    await revalidateFollowPaths(supabase, parsed.data.entityType, parsed.data.entityId);
    return { data: { following: false }, error: null };
  }

  if (existing?.id && existing.deleted_at) {
    const { error } = await supabase
      .from("follows")
      .update({ deleted_at: null })
      .eq("id", existing.id);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    await revalidateFollowPaths(supabase, parsed.data.entityType, parsed.data.entityId);
    return { data: { following: true }, error: null };
  }

  const { error } = await supabase.from("follows").insert({
    user_id: userId,
    entity_type: parsed.data.entityType,
    entity_id: parsed.data.entityId,
  });
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  await revalidateFollowPaths(supabase, parsed.data.entityType, parsed.data.entityId);
  return { data: { following: true }, error: null };
}
