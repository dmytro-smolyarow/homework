// Client-side environment variables (must be prefixed with NEXT_PUBLIC_).
export const clientEnv = {
  betterAuthUrl:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
} as const;
