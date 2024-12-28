import { USER_ROLES } from "@/config";
import { relations, sql } from "drizzle-orm";
import { json, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auth } from "./auth";

export const userRole = pgEnum("user_role", USER_ROLES);

export const users = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar().notNull(),
  email: varchar().unique().notNull(),
  photoUrl: text(),
  role: userRole().default("customer").notNull(),
  profile: json().default({}).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  auth: one(auth),
}));
