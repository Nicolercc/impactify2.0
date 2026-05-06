"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  createCommentSchema,
  deleteCommentSchema,
  type CreateCommentInput,
} from "@/lib/schemas/comments";

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

async function revalidateCommentEntity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entityType: CreateCommentInput["entityType"],
  entityId: string,
) {
  if (entityType === "event") {
    const { data } = await supabase.from("events").select("slug").eq("id", entityId).maybeSingle();
    if (data?.slug) revalidatePath(`/events/${data.slug}`);
    return;
  }
  if (entityType === "article") {
    const { data } = await supabase.from("articles").select("slug").eq("id", entityId).maybeSingle();
    if (data?.slug) revalidatePath(`/news/${data.slug}`);
    return;
  }
  if (entityType === "cause") {
    const { data } = await supabase.from("causes").select("slug").eq("id", entityId).maybeSingle();
    if (data?.slug) revalidatePath(`/causes/${data.slug}`);
  }
}

export async function createComment(
  entityType: CreateCommentInput["entityType"],
  entityId: string,
  body: string,
  parentId?: string | null,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createCommentSchema.safeParse({ entityType, entityId, body, parentId });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const userIdResult = await requireUserId();
  if (userIdResult.error || !userIdResult.data) return { data: null, error: userIdResult.error };

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: userIdResult.data,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      parent_id: parsed.data.parentId ?? null,
      body: parsed.data.body,
    })
    .select("id")
    .single();
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  await revalidateCommentEntity(supabase, parsed.data.entityType, parsed.data.entityId);
  return { data: { id: data.id }, error: null };
}

export async function deleteComment(id: string): Promise<ActionResult<true>> {
  const parsed = deleteCommentSchema.safeParse({ id });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const userIdResult = await requireUserId();
  if (userIdResult.error || !userIdResult.data) return { data: null, error: userIdResult.error };

  const { data: meta, error: metaError } = await supabase
    .from("comments")
    .select("entity_type, entity_id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (metaError) return { data: null, error: { message: metaError.message, code: metaError.code } };

  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  if (meta?.entity_type && meta.entity_id) {
    await revalidateCommentEntity(
      supabase,
      meta.entity_type as CreateCommentInput["entityType"],
      meta.entity_id,
    );
  }
  return { data: true, error: null };
}
