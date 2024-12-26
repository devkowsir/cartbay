import { relations, sql } from "drizzle-orm";
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const authType = pgEnum("auth_type", ["email", "google"]);

export const auth = pgTable("auth", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  authType: authType().notNull(),
  email: text().notNull(),
  hashedPass: text(),
  refreshToken: text(),
});

export const authRelations = relations(auth, ({ one }) => ({
  user: one(users, { fields: [auth.userId], references: [users.id] }),
}));
