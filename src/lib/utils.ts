import { User } from "@/db/postgres/schema";
import { clsx, type ClassValue } from "clsx";
import { sign } from "jsonwebtoken";
import { twMerge } from "tailwind-merge";
import { refreshTokenPayloadSchema } from "./zod/auth-schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getToken = (user: Pick<User, "id">) => {
  const payload = refreshTokenPayloadSchema.parse(user);
  return sign(payload, process.env.JWT_SECRET!);
};
