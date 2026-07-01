import Fastify from 'fastify'
import compress from '@fastify/compress'
import cookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'

import { serverRoutes } from './app/routes'
import { authPlugin } from './pkg/auth'
import { envConfig } from './config'
import { serverConfig, corsConfig, cookieConfig, compressConfig, rateLimitConfig, swaggerConfig, swaggerUiConfig } from './config'

// server
const server = Fastify(serverConfig).withTypeProvider<ZodTypeProvider>()

// plugins
server.register(fastifyCors, corsConfig)
server.register(cookie, cookieConfig)
server.register(compress, compressConfig)
server.register(multipart)
server.register(rateLimit, rateLimitConfig)

// auth
server.register(authPlugin)

// swagger — dev only
if (envConfig.NODE_ENV !== 'production') {
  server.register(fastifySwagger, swaggerConfig)
  server.register(fastifySwaggerUi, swaggerUiConfig)
}

// zod type provider
server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// routes
serverRoutes(server)

// start
const start = async () => {
  try {
    await server.listen({ port: envConfig.PORT, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
