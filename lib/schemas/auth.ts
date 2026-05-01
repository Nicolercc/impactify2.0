import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[A-Za-z0-9_]+$/, "Username must be alphanumeric + underscore");

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: usernameSchema,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z.string().max(80).optional().nullable(),
  bio: z.string().max(280).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  interests: z.array(z.string().max(40)).max(50).optional(),
  location_city: z.string().max(80).optional().nullable(),
  location_state: z.string().max(80).optional().nullable(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
