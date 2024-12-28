import { TOKEN_AGE } from "@/config";
import { User } from "@/types/auth";
import { NotBeforeError, sign, TokenExpiredError, verify } from "jsonwebtoken";
import { refreshTokenPayloadSchema } from "./zod/auth-schemas";

export const getToken = (user: User) => {
  const payload = refreshTokenPayloadSchema.parse(user);
  return {
    token: sign(payload, process.env.JWT_SECRET!),
    options: {
      maxAge: TOKEN_AGE,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    } as const,
  };
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
