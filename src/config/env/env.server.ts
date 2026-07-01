// Server-side environment variables (never exposed to the client bundle).
export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "",
  betterAuthUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
} as const;
