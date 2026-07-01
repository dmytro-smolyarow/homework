import { FastifyInstance } from 'fastify'

import { <module>Service } from './<module>.service'
import {
  ICreate<Module>Body,
  ICreate<Module>Res,
  IGet<Module>Params,
  IGet<Module>Res,
  IUpdate<Module>Body,
  IUpdate<Module>Res,
  SCreate<Module>Body,
  SCreate<Module>Res,
  SGet<Module>Params,
  SGet<Module>Res,
  SUpdate<Module>Body,
  SUpdate<Module>Res,
} from '../../entities/dto'

// <module> module
export const <module>Module = (server: FastifyInstance) => {
  // GET /<module>/:id
  server.route<{ Params: IGet<Module>Params; Reply: IGet<Module>Res }>({
    method: 'GET',
    url: '/<module>/:id',
    schema: {
      tags: ['<Module>'],
      params: SGet<Module>Params,
      response: SGet<Module>Res,
    },
    preHandler: [server.authenticate],
    handler: (req, reply) => <module>Service.getOne(server, req, reply),
  })

  // POST /<module>
  server.route<{ Body: ICreate<Module>Body; Reply: ICreate<Module>Res }>({
    method: 'POST',
    url: '/<module>',
    schema: {
      tags: ['<Module>'],
      body: SCreate<Module>Body,
      response: SCreate<Module>Res,
    },
    preHandler: [server.authenticate],
    handler: (req, reply) => <module>Service.create(server, req, reply),
  })

  // PATCH /<module>/:id
  server.route<{ Params: IGet<Module>Params; Body: IUpdate<Module>Body; Reply: IUpdate<Module>Res }>({
    method: 'PATCH',
    url: '/<module>/:id',
    schema: {
      tags: ['<Module>'],
      params: SGet<Module>Params,
      body: SUpdate<Module>Body,
      response: SUpdate<Module>Res,
    },
    preHandler: [server.authenticate],
    handler: (req, reply) => <module>Service.update(server, req, reply),
  })

  // DELETE /<module>/:id
  server.route<{ Params: IGet<Module>Params; Reply: IGet<Module>Res }>({
    method: 'DELETE',
    url: '/<module>/:id',
    schema: {
      tags: ['<Module>'],
      params: SGet<Module>Params,
      response: SGet<Module>Res,
    },
    preHandler: [server.authenticate],
    handler: (req, reply) => <module>Service.remove(server, req, reply),
  })
}
