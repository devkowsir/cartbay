import { relations } from "drizzle-orm";
import { json, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auth } from "./auth";

export const userRole = pgEnum("user_role", ["buyer", "seller", "admin"]);

export const users = pgTable("users", {
  id: uuid().primaryKey(),
  name: varchar(),
  email: varchar().unique(),
  photoUrl: text(),
  role: userRole().default("buyer"),
  phoneNumber: text(),
  profile: json().default({}),
  createdAt: timestamp().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  auth: many(auth),
}));
