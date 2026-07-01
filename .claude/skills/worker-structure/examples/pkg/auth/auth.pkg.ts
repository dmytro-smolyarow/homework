import { Context, Next } from 'hono'

import { envConfig } from '../../config'

// secret header middleware — gates traffic with a shared secret in the request header
export const secretHeaderMiddleware = async (ctx: Context, next: Next) => {
  const headerSecret = ctx.req.header('x-header-secret')

  if (envConfig.<ENV_VAR> && headerSecret !== envConfig.<ENV_VAR>) {
    return ctx.json({ error: 'Unauthorized', message: 'Not allowed' }, 401)
  }

  return next()
}
