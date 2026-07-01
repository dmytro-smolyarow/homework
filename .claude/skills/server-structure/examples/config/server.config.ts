import type { FastifyServerOptions } from 'fastify'
import type { FastifyCorsOptions } from '@fastify/cors'
import type { FastifyCookieOptions } from '@fastify/cookie'
import type { FastifyRateLimitOptions } from '@fastify/rate-limit'
import type { FastifyCompressOptions } from '@fastify/compress'

import { envConfig } from './env.config'

// server config — Fastify constructor options
export const serverConfig: FastifyServerOptions = {
  requestTimeout: 60000,
  bodyLimit: 1024 * 1024 * 10,
  trustProxy: true,
  logger: {
    level: envConfig.NODE_ENV !== 'production' ? undefined : 'error',
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
    },
  },
}

// cors config
export const corsConfig: FastifyCorsOptions = {
  origin: envConfig.CORS_ORIGIN.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  maxAge: 86400,
}

// cookie config
export const cookieConfig: FastifyCookieOptions = {
  secret: envConfig.JWT_SECRET,
  parseOptions: {
    httpOnly: true,
    secure: envConfig.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
}

// compress config
export const compressConfig: FastifyCompressOptions = {
  encodings: ['br', 'gzip', 'deflate'],
}

// rate limit config
export const rateLimitConfig: FastifyRateLimitOptions = {
  max: 100,
  timeWindow: '1 minute',
  global: true,
}
