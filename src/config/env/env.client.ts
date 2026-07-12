import { z } from 'zod'

import { createEnv } from '@t3-oss/env-nextjs'

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_),
// validated with Zod. Read from here instead of touching process.env.
export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
    // github oauth client id (public — also drives the button's visibility)
    NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().min(1).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  },
  emptyStringAsUndefined: true,
})
