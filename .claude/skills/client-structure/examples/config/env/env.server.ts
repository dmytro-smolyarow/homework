import { z } from 'zod'

import { createEnv } from '@t3-oss/env-nextjs'

// env server — secrets and server-only vars
export const envServer = createEnv({
  server: {
    <HEADER_SECRET>: z.string().nonempty({ message: '<HEADER_SECRET> is required' }),
    <SERVICE>_URL: z.string().nonempty({ message: '<SERVICE>_URL is required' }),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    <HEADER_SECRET>: process.env.<HEADER_SECRET>,
    <SERVICE>_URL: process.env.<SERVICE>_URL,
  },
})
