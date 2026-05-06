import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/get-session";
import { DEMO_EVENTS } from "@/lib/events/demo-events";

export type EventCauseRow = {
  cause_id: string;
  causes:
    | { id: string; slug: string; title: string }
    | { id: string; slug: string; title: string }[]
    | null;
};

export type PublishedEventListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  city: string | null;
  state: string | null;
  is_virtual: boolean;
  venue_name: string | null;
  cover_image_url: string | null;
  category: string | null;
  attendee_count: number | null;
  capacity: number | null;
  status: string;
  event_causes: EventCauseRow[] | null;
};

const publishedEventSelect = `
  id,
  slug,
  title,
  description,
  starts_at,
  ends_at,
  city,
  state,
  is_virtual,
  venue_name,
  cover_image_url,
  category,
  attendee_count,
  capacity,
  status,
  event_causes (
    cause_id,
    causes ( id, slug, title )
  )
`;

export async function fetchPublishedUpcomingEvents(): Promise<PublishedEventListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(publishedEventSelect)
    .eq("status", "published")
    .is("deleted_at", null)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(24);

  if (error) {
    console.error("[events] list fetch error", error.message);
    return [];
  }

  const results = (data ?? []) as unknown as PublishedEventListItem[];

  // DEMO FALLBACK — remove when DB is seeded
  if (results.length === 0) {
    return DEMO_EVENTS;
  }

  return results;
}

export type EventOrganizer = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type EventDetailCause = {
  causes:
    | {
        id: string;
        slug: string;
        title: string;
        category: string | null;
      }
    | Array<{
        id: string;
        slug: string;
        title: string;
        category: string | null;
      }>
    | null;
};

export type EventDetailRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string | null;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: string | null;
  lng: string | null;
  is_virtual: boolean;
  virtual_url: string | null;
  cover_image_url: string | null;
  category: string | null;
  capacity: number | null;
  attendee_count: number | null;
  status: string;
  organizer_id: string | null;
  deleted_at: string | null;
  organizer: EventOrganizer | EventOrganizer[] | null;
  event_causes: EventDetailCause[] | null;
};

export const getEventBySlug = cache(async (slug: string): Promise<EventDetailRow | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_causes (
        causes ( id, slug, title, category )
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[events] detail fetch error", error);
    return null;
  }

  if (!data) return null;

  let organizer: EventOrganizer | EventOrganizer[] | null = null;
  const organizerId = data.organizer_id as string | null;
  if (organizerId) {
    const { data: dir, error: dirError } = await supabase
      .from("profiles_directory")
      .select("id, username, display_name, avatar_url")
      .eq("id", organizerId)
      .maybeSingle();
    if (dirError) {
      console.error("[events] organizer directory fetch error", dirError.message);
    }
    if (dir) organizer = dir as EventOrganizer;
  }

  return { ...data, organizer } as EventDetailRow;
});

export async function resolveEventForRequest(slug: string): Promise<EventDetailRow> {
  const event = await getEventBySlug(slug);
  if (!event || event.deleted_at) {
    notFound();
  }

  const session = await getSession();
  const isDraft = event.status === "draft";
  if (isDraft) {
    if (!session?.id) notFound();
    if (event.organizer_id !== session.id) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.id)
        .maybeSingle();
      if (profile?.role !== "admin") notFound();
    }
  }

  return event;
}

export async function fetchUserRsvpStatus(
  eventId: string,
): Promise<"going" | "interested" | "waitlist" | "cancelled" | null> {
  const session = await getSession();
  if (!session?.id) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_attendees")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", session.id)
    .maybeSingle();

  if (error || !data?.status) return null;
  const s = data.status as string;
  if (s === "going" || s === "interested" || s === "waitlist" || s === "cancelled") return s;
  return null;
}

export type EventMeta = {
  title: string;
  description: string | null;
  cover_image_url: string | null;
};

export const getEventMetaBySlug = cache(async (slug: string): Promise<EventMeta | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("title, description, cover_image_url, deleted_at, status")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data || data.deleted_at) return null;
  if (data.status === "draft") return null;

  return {
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    cover_image_url: (data.cover_image_url as string | null) ?? null,
  };
});
