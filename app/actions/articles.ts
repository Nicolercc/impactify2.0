"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { flagArticleSchema, type FlagArticleInput } from "@/lib/schemas/articles";

type ActionError = { message: string; code?: string };
type ActionResult<T> = { data: T | null; error: ActionError | null };

function zodError(error: import("zod").ZodError): ActionError {
  return { message: error.issues[0]?.message ?? "Invalid input", code: "invalid_input" };
}

export async function flagArticle(input: FlagArticleInput): Promise<ActionResult<true>> {
  const parsed = flagArticleSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) return { data: null, error: { message: authError.message, code: authError.code } };
  if (!user) return { data: null, error: { message: "Sign in to flag an article.", code: "not_authenticated" } };

  const { data: article, error: articleLookupError } = await supabase
    .from("articles")
    .select("slug")
    .eq("id", parsed.data.articleId)
    .maybeSingle();
  if (articleLookupError) {
    return { data: null, error: { message: articleLookupError.message, code: articleLookupError.code } };
  }

  const { error } = await supabase.from("article_flags").insert({
    article_id: parsed.data.articleId,
    user_id: user.id,
    flag_type: parsed.data.flagType,
    details: parsed.data.details ?? null,
  });

  if (error) return { data: null, error: { message: error.message, code: error.code } };

  if (article?.slug) {
    revalidatePath(`/news/${article.slug}`);
  }
  return { data: true, error: null };
}
