import { FastifyInstance } from 'fastify'

import { <module>Module } from '../modules/<module>'

const routePrefixV1 = '/api/v1'

// server routes — registers all modules onto the Fastify instance
export const serverRoutes = (server: FastifyInstance) => {
  // health
  server.get(`${routePrefixV1}/health`, { schema: { hide: true } }, () => 'OK')

  // modules — list every module the server exposes
  server.register(<module>Module, { prefix: routePrefixV1 })

  // 404 fallback
  server.all(`${routePrefixV1}/*`, async (request, reply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    })
  })
}
