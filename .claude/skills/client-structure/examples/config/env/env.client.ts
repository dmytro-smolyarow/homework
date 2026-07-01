import { z } from 'zod'

import { createEnv } from '@t3-oss/env-nextjs'

// env client — every NEXT_PUBLIC_* var declared here
export const envClient = createEnv({
  client: {
    NEXT_PUBLIC_<APP>_WEB_URL: z.string().nonempty({ message: 'NEXT_PUBLIC_<APP>_WEB_URL is required' }),
    NEXT_PUBLIC_<APP>_API_URL: z.string().nonempty({ message: 'NEXT_PUBLIC_<APP>_API_URL is required' }),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NEXT_PUBLIC_<APP>_WEB_URL: process.env.NEXT_PUBLIC_<APP>_WEB_URL,
    NEXT_PUBLIC_<APP>_API_URL: process.env.NEXT_PUBLIC_<APP>_API_URL,
  },
})
