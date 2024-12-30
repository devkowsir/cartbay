import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  out: "./src/db/postgres/migrations",
  schema: "./src/db/postgres/schema",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL!,
  },
});
