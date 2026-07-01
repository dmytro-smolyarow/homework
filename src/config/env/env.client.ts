import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_),
// validated with Zod. Read from here instead of touching process.env.
export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z
      .string()
      .url()
      .default("http://localhost:3000"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
  emptyStringAsUndefined: true,
});
