import { z } from 'zod'
import { createEnv } from '@t3-oss/env-core'
import 'dotenv/config'

// env config — the single entry point for env access; never read process.env directly elsewhere
export const envConfig = createEnv({
  server: {
    PORT: z
      .number()
      .or(z.string().transform((val) => Number(val)))
      .default(4000),
    NODE_ENV: z.enum(['local', 'production', 'development']).default('local'),
    CORS_ORIGIN: z.string().nonempty({ message: 'CORS_ORIGIN is required' }),
    JWT_SECRET: z.string().nonempty({ message: 'JWT_SECRET is required' }),
    // … add project-specific vars here
    <ENV_VAR>: z.string().nonempty({ message: '<ENV_VAR> is required' }),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
