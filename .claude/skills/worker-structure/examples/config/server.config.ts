import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'

// server config — global Hono middleware bundle consumed by app/server.ts
export const serverConfig = {
  cors: cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }),
  logger: logger(),
  timeout: timeout(60000),
}
