import { auth, authType, userRole, users } from "@/db/postgres/schema";

export type AccessTokenPayload = {
  name: string;
  email: string;
  photoUrl: string | null;
  role: UserRole;
};

export type RefreshTokenPayload = {
  id: string;
};

export type UserRole = typeof userRole.enumValues;
export type User = typeof users.$inferSelect;
export type AuthType = typeof authType.enumValues;
export type Auth = typeof auth.$inferSelect;
