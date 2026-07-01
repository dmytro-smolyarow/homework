import { FastifyReply, FastifyRequest } from 'fastify'

// extends Fastify types with auth decorators — import this file once in server.ts or a global types file
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    authenticateAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    user?: I<User>
    session?: I<Session>
    adminUser?: I<AdminUser>
  }
}
