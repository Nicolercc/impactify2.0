import { z } from "zod";
import { entityTypeSaveSchema } from "@/lib/schemas/shared";

export const toggleSaveSchema = z.object({
  entityType: entityTypeSaveSchema,
  entityId: z.string().uuid(),
});
export type ToggleSaveInput = z.infer<typeof toggleSaveSchema>;

export const listSavesSchema = z.object({
  entityType: entityTypeSaveSchema.optional(),
});
export type ListSavesInput = z.infer<typeof listSavesSchema>;
