import { auth, authType, userRole, users } from "@/db/postgres/schema";

export type TokenPayload = {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  role: UserRole;
};

export type UserRoles = typeof userRole.enumValues;
export type UserRole = UserRoles[number];
export type User = typeof users.$inferSelect;
export type AuthType = typeof authType.enumValues;
export type Auth = typeof auth.$inferSelect;

export type GoogleUserTokens = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};
