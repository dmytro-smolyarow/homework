import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { envServer } from "@/config/env";
import { db, schema } from "@/pkg/db";

// auth — better-auth with drizzle adapter (email + password)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  secret: envServer.BETTER_AUTH_SECRET,
  baseURL: envServer.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
