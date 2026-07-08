import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { envClient, envServer } from "@/config/env";
// intentional pkg->pkg: the drizzle client is the single shared DB connection.
// better-auth needs that exact instance; duplicating the pool here would be worse.
import { db, schema } from "@/pkg/db";

// github oauth — enabled only when both id (public) and secret are provided
const githubId = envClient.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const githubSecret = envServer.GITHUB_CLIENT_SECRET;

// auth — better-auth with drizzle adapter (email + password, optional github oauth)
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders:
    githubId && githubSecret
      ? { github: { clientId: githubId, clientSecret: githubSecret } }
      : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  secret: envServer.BETTER_AUTH_SECRET,
  baseURL: envServer.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
