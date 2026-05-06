"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { toggleSaveSchema, listSavesSchema } from "@/lib/schemas/saves";

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

export async function toggleSave(entityType: string, entityId: string): Promise<ActionResult<{ saved: boolean }>> {
  const parsed = toggleSaveSchema.safeParse({ entityType, entityId });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const userIdResult = await requireUserId();
  if (userIdResult.error || !userIdResult.data) return { data: null, error: userIdResult.error };

  const userId = userIdResult.data;

  const { data: existing, error: existingError } = await supabase
    .from("saves")
    .select("id, deleted_at")
    .eq("user_id", userId)
    .eq("entity_type", parsed.data.entityType)
    .eq("entity_id", parsed.data.entityId)
    .maybeSingle();
  if (existingError) return { data: null, error: { message: existingError.message, code: existingError.code } };

  if (existing?.id && !existing.deleted_at) {
    const { error } = await supabase
      .from("saves")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    revalidatePath("/dashboard");
    return { data: { saved: false }, error: null };
  }

  if (existing?.id && existing.deleted_at) {
    const { error } = await supabase
      .from("saves")
      .update({ deleted_at: null })
      .eq("id", existing.id);
    if (error) return { data: null, error: { message: error.message, code: error.code } };
    revalidatePath("/dashboard");
    return { data: { saved: true }, error: null };
  }

  const { error } = await supabase.from("saves").insert({
    user_id: userId,
    entity_type: parsed.data.entityType,
    entity_id: parsed.data.entityId,
  });
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  revalidatePath("/dashboard");
  return { data: { saved: true }, error: null };
}

export async function listSaves(entityType?: string): Promise<ActionResult<unknown[]>> {
  const parsed = listSavesSchema.safeParse({ entityType });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const userIdResult = await requireUserId();
  if (userIdResult.error || !userIdResult.data) return { data: null, error: userIdResult.error };

  let query = supabase
    .from("saves")
    .select("*")
    .eq("user_id", userIdResult.data)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (parsed.data.entityType) {
    query = query.eq("entity_type", parsed.data.entityType);
  }

  const { data, error } = await query;
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  return { data: data ?? [], error: null };
}
