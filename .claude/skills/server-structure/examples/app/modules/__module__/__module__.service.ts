import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import {
  ICreate<Module>Body,
  ICreate<Module>Res,
  IGet<Module>Params,
  IGet<Module>Res,
  IUpdate<Module>Body,
  IUpdate<Module>Res,
} from '../../entities/dto'

// <module> service
export const <module>Service = {
  // get one
  getOne: async (
    server: FastifyInstance,
    req: FastifyRequest<{ Params: IGet<Module>Params }>,
    reply: FastifyReply<{ Reply: IGet<Module>Res }>,
  ) => {
    try {
      const { id } = req.params
      // … domain work
      return reply.code(200).send({ id, /* … */ })
    } catch (error) {
      server.log.error(error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }
  },

  // create
  create: async (
    server: FastifyInstance,
    req: FastifyRequest<{ Body: ICreate<Module>Body }>,
    reply: FastifyReply<{ Reply: ICreate<Module>Res }>,
  ) => {
    try {
      const body = req.body
      // … domain work
      return reply.code(200).send({ /* … */ })
    } catch (error) {
      server.log.error(error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }
  },

  // update
  update: async (
    server: FastifyInstance,
    req: FastifyRequest<{ Params: IGet<Module>Params; Body: IUpdate<Module>Body }>,
    reply: FastifyReply<{ Reply: IUpdate<Module>Res }>,
  ) => {
    try {
      const { id } = req.params
      const body = req.body
      // … domain work
      return reply.code(200).send({ id, /* … */ })
    } catch (error) {
      server.log.error(error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }
  },

  // remove
  remove: async (
    server: FastifyInstance,
    req: FastifyRequest<{ Params: IGet<Module>Params }>,
    reply: FastifyReply<{ Reply: IGet<Module>Res }>,
  ) => {
    try {
      const { id } = req.params
      // … domain work
      return reply.code(200).send({ id, /* … */ })
    } catch (error) {
      server.log.error(error)
      return reply.code(500).send({ error: 'Internal Server Error' })
    }
  },
}
