import { User } from "@/types/auth";
import { clsx, type ClassValue } from "clsx";
import { NotBeforeError, sign, TokenExpiredError, verify } from "jsonwebtoken";
import { twMerge } from "tailwind-merge";
import { refreshTokenPayloadSchema } from "./zod/auth-schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getToken = (user: Pick<User, "id">) => {
  const payload = refreshTokenPayloadSchema.parse(user);
  return sign(payload, process.env.JWT_SECRET!);
};

export const validateToken = <T = any>(token: string) => {
  console.time();
  try {
    const payload = verify(token, process.env.JWT_SECRET!);
    return { error: null, payload: payload as T };
  } catch (error) {
    console.error(error);
    if (error instanceof TokenExpiredError) return { payload: null, error: "Token is expired." };
    if (error instanceof NotBeforeError) return { payload: null, error: "Token used before claim time." };
    return { payload: null, error: "Token signature verification failed." };
  } finally {
    console.timeEnd();
  }
};
