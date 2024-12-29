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

export const tokenPayloadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  photoUrl: z.string().nullable(),
  roles: z.enum(USER_ROLES).array(),
});

export const resetPasswordSchema = z.object({
  code: z.string(),
  newPassword: z.string().min(6),
});
