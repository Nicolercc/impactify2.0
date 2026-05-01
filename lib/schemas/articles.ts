import { z } from "zod";

export const flagArticleSchema = z.object({
  articleId: z.string().uuid(),
  flagType: z.enum(["factual_error", "missing_context", "bias", "other"]),
  details: z.string().max(2000).optional().nullable(),
});

export type FlagArticleInput = z.infer<typeof flagArticleSchema>;
