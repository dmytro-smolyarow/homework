import type { ValidationTargets } from 'hono'
import { type ZodSchema } from 'zod'

import { zValidator as zv } from '@hono/zod-validator'

// validator — wraps @hono/zod-validator to enforce the canonical 400 response shape
// always import from here, never from '@hono/zod-validator' directly
export const zValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zv(target, schema, (result, ctx) => {
    if (!result.success) {
      const msg = JSON.parse(result.error.message)

      return ctx.json({ error: 'Bad Request', message: msg }, 400)
    }
  })
