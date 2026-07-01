import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

import { authService } from './auth.service'

// auth plugin — decorates server.authenticate and server.authenticateAdmin
// must be wrapped with fp() so decorators are visible across the entire server scope
const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await authService.getSession(request)

      if (!session) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'You are not authorized' })
      }

      request.user = session.user
      request.session = session.session
    } catch {
      return reply.code(500).send({ error: 'Authentication error' })
    }
  })

  fastify.decorate('authenticateAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const adminUser = await authService.getAdminUser(request)

      if (!adminUser) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Admin authentication required' })
      }

      request.adminUser = adminUser
    } catch {
      return reply.code(500).send({ error: 'Authentication error' })
    }
  })
}

export default fp(authPlugin)
