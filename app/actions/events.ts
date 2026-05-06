"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  createEventSchema,
  updateEventSchema,
  rsvpSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/lib/schemas/events";

type ActionError = { message: string; code?: string };
type ActionResult<T> = { data: T | null; error: ActionError | null };

const SLUG_BLOCKLIST = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "events",
  "news",
  "causes",
  "reps",
  "feed",
  "settings",
  "profile",
  "about",
  "new",
  "edit",
]);

function zodError(error: z.ZodError): ActionError {
  return { message: error.issues[0]?.message ?? "Invalid input", code: "invalid_input" };
}

function eventSlugFromTitle(title: string): string {
  let s = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  s = s.replace(/^-+|-+$/g, "");
  if (s.length < 3) {
    s = "event";
  }
  if (SLUG_BLOCKLIST.has(s)) {
    s = `${s}-event`.replace(/^-+|-+$/g, "").slice(0, 60);
  }
  if (s.length < 3) {
    s = "event";
  }
  return s;
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "23505") return true;
  return error.message?.toLowerCase().includes("duplicate") ?? false;
}

async function getAuthedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { userId: null, error: { message: error.message, code: error.code } };
  if (!data.user) return { userId: null, error: { message: "Not signed in", code: "not_authenticated" } };
  return { userId: data.user.id, error: null };
}

async function revalidateEventById(supabase: Awaited<ReturnType<typeof createClient>>, eventId: string) {
  const { data } = await supabase.from("events").select("slug").eq("id", eventId).maybeSingle();
  if (data?.slug) {
    revalidatePath(`/events/${data.slug}`);
  }
}

export async function createEvent(
  input: CreateEventInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const auth = await getAuthedUserId();
  if (auth.error || !auth.userId) return { data: null, error: auth.error };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.userId)
    .maybeSingle();
  if (profileError) return { data: null, error: { message: profileError.message, code: profileError.code } };
  if (!profile || (profile.role !== "organizer" && profile.role !== "admin")) {
    return { data: null, error: { message: "Organizer access required", code: "forbidden" } };
  }

  const { cause_ids, ...eventFields } = parsed.data;
  const baseSlug = eventSlugFromTitle(parsed.data.title);

  const rowPayload = {
    ...eventFields,
    organizer_id: auth.userId,
    starts_at: new Date(parsed.data.starts_at).toISOString(),
    ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null,
  };

  let data: { id: string; slug: string } | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const slugCandidate =
      attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`.slice(0, 80);
    const { data: inserted, error } = await supabase
      .from("events")
      .insert({
        ...rowPayload,
        slug: slugCandidate,
      })
      .select("id, slug")
      .single();

    if (!error && inserted) {
      data = inserted;
      break;
    }
    if (!isUniqueViolation(error)) {
      return {
        data: null,
        error: { message: error?.message ?? "Could not create event.", code: error?.code },
      };
    }
  }

  if (!data) {
    return { data: null, error: { message: "Could not allocate a unique URL slug.", code: "slug_exhausted" } };
  }

  if (cause_ids?.length) {
    const rows = cause_ids.map((cause_id) => ({
      event_id: data.id,
      cause_id,
    }));
    const { error: linkError } = await supabase.from("event_causes").insert(rows);
    if (linkError) {
      return { data: null, error: { message: linkError.message, code: linkError.code } };
    }
  }

  revalidatePath("/events");
  revalidatePath(`/events/${data.slug}`);
  return { data: { id: data.id, slug: data.slug }, error: null };
}

export async function updateEvent(
  id: string,
  input: UpdateEventInput,
): Promise<ActionResult<true>> {
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) return { data: null, error: { message: "Invalid event id", code: "invalid_input" } };

  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const auth = await getAuthedUserId();
  if (auth.error || !auth.userId) return { data: null, error: auth.error };

  const patch: Record<string, unknown> = { ...parsed.data };
  if (typeof parsed.data.starts_at === "string") patch.starts_at = new Date(parsed.data.starts_at).toISOString();
  if (typeof parsed.data.ends_at === "string") patch.ends_at = new Date(parsed.data.ends_at).toISOString();

  const { error } = await supabase.from("events").update(patch).eq("id", idParsed.data);
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  const { data: row } = await supabase.from("events").select("slug").eq("id", idParsed.data).maybeSingle();
  if (row?.slug) {
    revalidatePath(`/events/${row.slug}`);
  }
  revalidatePath("/events");
  return { data: true, error: null };
}

export async function rsvpToEvent(eventId: string, status: string): Promise<ActionResult<true>> {
  const parsed = rsvpSchema.safeParse({ eventId, status });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const auth = await getAuthedUserId();
  if (auth.error || !auth.userId) return { data: null, error: auth.error };

  const { error } = await supabase.from("event_attendees").upsert(
    {
      event_id: parsed.data.eventId,
      user_id: auth.userId,
      status: parsed.data.status,
    },
    { onConflict: "event_id,user_id" },
  );
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  await revalidateEventById(supabase, parsed.data.eventId);
  return { data: true, error: null };
}

export async function cancelRsvp(eventId: string): Promise<ActionResult<true>> {
  const parsed = z.string().uuid().safeParse(eventId);
  if (!parsed.success) return { data: null, error: { message: "Invalid event id", code: "invalid_input" } };

  const supabase = await createClient();
  const auth = await getAuthedUserId();
  if (auth.error || !auth.userId) return { data: null, error: auth.error };

  const { error } = await supabase
    .from("event_attendees")
    .delete()
    .eq("event_id", parsed.data)
    .eq("user_id", auth.userId);
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  await revalidateEventById(supabase, parsed.data);
  return { data: true, error: null };
}
