import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(process.env.DATABASE_URL!, { prepare: false, debug: process.env.NODE_ENV == "development" });
const db = drizzle({ client, schema, casing: "snake_case" });

export default db;
