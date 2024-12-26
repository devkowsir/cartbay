import { USER_ROLES } from "@/config";
import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = signUpSchema.omit({ name: true });

export type TSignInSchema = z.infer<typeof signUpSchema>;

export const userResponseSchema = z.object({
  name: z.string(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  role: z.enum(USER_ROLES),
});

export const refreshTokenPayloadSchema = z.object({
  id: z.string(),
});
