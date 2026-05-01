import { z } from "zod";
import { entityTypeCommentSchema } from "@/lib/schemas/shared";

export const createCommentSchema = z.object({
  entityType: entityTypeCommentSchema,
  entityId: z.string().uuid(),
  body: z.string().min(1).max(4000),
  parentId: z.string().uuid().optional().nullable(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const deleteCommentSchema = z.object({
  id: z.string().uuid(),
});
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
