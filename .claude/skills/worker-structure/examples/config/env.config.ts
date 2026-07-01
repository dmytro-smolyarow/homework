import { z } from 'zod'

import { createEnv } from '@t3-oss/env-core'

import 'dotenv/config'

// env config — the single entry point for env access; never read process.env directly elsewhere
export const envConfig = createEnv({
  server: {
    NODE_ENV: z.enum(['local', 'production', 'development']).optional(),
    <ENV_VAR>: z.string().nonempty({ message: '<ENV_VAR> is required' }),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
