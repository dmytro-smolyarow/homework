import { z } from 'zod'

import { createEnv } from '@t3-oss/env-nextjs'

// Server-side environment variables (never exposed to the client bundle),
// validated with Zod. Read from here instead of touching process.env.
export const envServer = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    // Only used by tooling (migrations/seed), optional for the app runtime.
    DIRECT_URL: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
    // optional — GitHub OAuth secret (client id is the public NEXT_PUBLIC_GITHUB_CLIENT_ID)
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
})
