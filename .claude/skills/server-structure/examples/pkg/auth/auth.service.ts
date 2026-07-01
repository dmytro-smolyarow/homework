import { FastifyRequest } from 'fastify'

// auth service — pure auth logic, no Fastify routing
export const authService = {
  // get session — validates cookie/token and returns session + user
  getSession: async (request: FastifyRequest) => {
    // … parse cookies, validate token against auth provider
    return null as { user: I<User>; session: I<Session> } | null
  },

  // get admin user — validates admin credentials
  getAdminUser: async (request: FastifyRequest) => {
    // … validate admin session against CMS or internal user store
    return null as I<AdminUser> | null
  },
}
