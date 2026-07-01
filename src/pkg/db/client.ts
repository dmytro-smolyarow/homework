import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { envServer } from "@/config/env";
import * as schema from "./schema";

// The Supabase transaction pooler (pgbouncer) does not support prepared
// statements, so disable them.
const client = postgres(envServer.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
