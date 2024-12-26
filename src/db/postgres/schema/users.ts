import { relations, sql } from "drizzle-orm";
import { json, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auth } from "./auth";

export const userRole = pgEnum("user_role", ["buyer", "seller", "admin"]);

export const users = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar().notNull(),
  email: varchar().unique().notNull(),
  photoUrl: text(),
  role: userRole().default("buyer").notNull(),
  profile: json().default({}).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  auth: many(auth),
}));
