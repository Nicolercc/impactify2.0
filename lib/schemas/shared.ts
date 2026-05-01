import { z } from "zod";

export const entityTypeSaveSchema = z.enum(["event", "article", "cause", "representative"]);
export type EntityTypeSave = z.infer<typeof entityTypeSaveSchema>;

export const entityTypeFollowSchema = z.enum(["cause", "user", "representative"]);
export type EntityTypeFollow = z.infer<typeof entityTypeFollowSchema>;

export const entityTypeCommentSchema = z.enum(["event", "article", "cause"]);
export type EntityTypeComment = z.infer<typeof entityTypeCommentSchema>;

export const rsvpStatusSchema = z.enum(["going", "interested", "waitlist", "cancelled"]);
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>;
