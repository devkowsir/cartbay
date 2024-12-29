import { validateToken } from "@/lib/jose";
import { TokenPayload, UserRole } from "@/types/auth";
import { cookies } from "next/headers";

/**
 * This function pareses headers set in the middleware and returns user.
 * Must be called on server side.
 */
export const getUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const payload = await validateToken<TokenPayload>(token);

  if (!payload) return null;

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    roles: payload.roles as UserRole[],
    photoUrl: payload.photoUrl,
  };
};
