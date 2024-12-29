import db from "@/db/postgres";
import { auth, users } from "@/db/postgres/schema";
import { UserRole } from "@/types/auth";
import { eq } from "drizzle-orm";

export const getUserData = async (email: string) => {
  const [data] = await db.select().from(auth).where(eq(auth.email, email)).innerJoin(users, eq(users.id, auth.userId));

  if (!data?.users) return null;

  return {
    id: data.users.id,
    email: data.users.email,
    name: data.users.name,
    photoUrl: data.users.photoUrl,
    roles: data.users.roles as UserRole[],
    profile: data.users.profile,
    createdAt: data.users.createdAt,
    authId: data.auth.id,
    authType: data.auth.authType,
    hashedPass: data.auth.hashedPass,
    refreshToken: data.auth.refreshToken,
    passResetCode: data.auth.passResetCode,
  };
};

export const createUser = async (data: typeof users.$inferInsert) => {
  const [res] = await db.insert(users).values(data).returning();
  return res;
};

export const createAuth = async (data: typeof auth.$inferInsert) => {
  const [res] = await db.insert(auth).values(data).returning();
  return res;
};

export const setResetPasswordCode = async (authId: string, code: string) => {
  await db.update(auth).set({ passResetCode: code }).where(eq(auth.id, authId));
};

export const updatePassword = async (authId: string, hashedPass: string) => {
  await db.update(auth).set({ hashedPass, passResetCode: null }).where(eq(auth.id, authId));
};
