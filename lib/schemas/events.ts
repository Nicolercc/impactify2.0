import { z } from "zod";
import { rsvpStatusSchema } from "@/lib/schemas/shared";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

const optionalUrl = z.preprocess(
  emptyToNull,
  z.union([z.string().url(), z.null()]).optional(),
);

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional().nullable(),
  starts_at: z.string().min(1),
  ends_at: z.preprocess(emptyToNull, z.string().min(1).nullable().optional()),
  timezone: z.string().min(1).max(64).optional(),
  venue_name: z.string().max(200).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(120).optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  is_virtual: z.boolean().optional(),
  virtual_url: optionalUrl,
  cover_image_url: optionalUrl,
  category: z.string().max(120).optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).optional(),
  accepts_donations: z.boolean().optional(),
  stripe_account_id: z.string().max(200).optional().nullable(),
  cause_ids: z.array(z.string().uuid()).max(24).optional(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const rsvpSchema = z.object({
  eventId: z.string().uuid(),
  status: rsvpStatusSchema,
});
export type RsvpInput = z.infer<typeof rsvpSchema>;
