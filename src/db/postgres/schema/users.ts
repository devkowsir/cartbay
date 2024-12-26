import { json, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
