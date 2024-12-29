import { TOKEN_AGE } from "@/config";
import { TokenPayload } from "@/types/auth";
import { JWTPayload, jwtVerify, SignJWT } from "jose";

const encodedSecret = new TextEncoder().encode(process.env.SECRET_KEY!);

export const getAuthCookie = async (payload: TokenPayload) => {
  const token = await signToken(payload, TOKEN_AGE);

  return {
    token,
    options: {
      maxAge: TOKEN_AGE,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV == "production",
    } as const,
  };
};

export const signToken = async <T extends JWTPayload>(payload: T, age: number) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Date.now() + age * 1000)
    .sign(encodedSecret);
};

export const validateToken = async <T>(token: string) => {
  try {
    const { payload } = await jwtVerify<T>(token, encodedSecret);
    return payload;
  } catch (e) {
    console.error(e);
    return null;
  }
};
