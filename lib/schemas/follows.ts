import { z } from "zod";
import { entityTypeFollowSchema } from "@/lib/schemas/shared";

export const toggleFollowSchema = z.object({
  entityType: entityTypeFollowSchema,
  entityId: z.string().uuid(),
});
export type ToggleFollowInput = z.infer<typeof toggleFollowSchema>;
