"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/schemas/auth";

type ActionError = { message: string; code?: string };
type ActionResult<T> = { data: T | null; error: ActionError | null };

function zodError(error: z.ZodError): ActionError {
  return { message: error.issues[0]?.message ?? "Invalid input", code: "invalid_input" };
}

function asErrorMessage(error: unknown): ActionError {
  if (typeof error === "object" && error && "message" in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  return { message: "Unexpected error" };
}

export async function signIn(email: string, password: string): Promise<ActionResult<true>> {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  revalidatePath("/", "layout");
  return { data: true, error: null };
}

export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<ActionResult<true>> {
  const parsed = signUpSchema.safeParse({ email, password, username });
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        preferred_username: parsed.data.username,
      },
    },
  });
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  const userId = data.user?.id;
  if (userId) {
    // Best-effort: set username to the requested value (trigger will have created a default).
    await supabase
      .from("profiles")
      .update({ username: parsed.data.username })
      .eq("id", userId);
  }

  revalidatePath("/", "layout");
  return { data: true, error: null };
}

export async function signInWithGoogle(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const redirectTo =
    (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + "/auth/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    return { data: null, error: { message: error?.message ?? "OAuth init failed" } };
  }

  return { data: { url: data.url }, error: null };
}

export async function signInAnonymously(): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInAnonymously();
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  revalidatePath("/", "layout");
  return { data: true, error: null };
}

export async function signOut(): Promise<ActionResult<true>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: { message: error.message, code: error.code } };

  revalidatePath("/", "layout");
  return { data: true, error: null };
}

export async function updateProfile(data: UpdateProfileInput): Promise<ActionResult<true>> {
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) return { data: null, error: zodError(parsed.error) };

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) return { data: null, error: { message: authError.message, code: authError.code } };
  if (!authData.user) return { data: null, error: { message: "Not signed in", code: "not_authenticated" } };

  try {
    const { error } = await supabase
      .from("profiles")
      .update(parsed.data)
      .eq("id", authData.user.id);
    if (error) return { data: null, error: { message: error.message, code: error.code } };

    revalidatePath("/", "layout");
    return { data: true, error: null };
  } catch (e) {
    return { data: null, error: asErrorMessage(e) };
  }
}
