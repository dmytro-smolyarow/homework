import { Context } from 'hono'

import {
  ICreate<Module>Req,
  IUpdate<Module>Req,
  I<Module>Res,
  S<Module>Res,
  S<Modules>Res,
} from '../../entities/dto'
import { <entity>, E<Entity>Table } from '../../entities/models/<entity>.object'

// <module> service
export const <module>Service = {
  // get all
  getAll: async (ctx: Context) => {
    try {
      const instance = <entity>(ctx, E<Entity>Table.<TABLE>)

      const items: I<Module>Res[] = await instance.getAll()
      const res = S<Modules>Res.safeParse({ data: items || [], meta: { total: items.length } })

      return ctx.json(res.data)
    } catch {
      return ctx.json({ error: 'Internal server error', message: 'Ops, something went wrong' }, 500)
    }
  },

  // get one
  getOne: async (ctx: Context) => {
    try {
      const instance = <entity>(ctx, E<Entity>Table.<TABLE>)

      const id = ctx.req.param('id')

      const item = await instance.getOne(id)
      const res = S<Module>Res.safeParse(item)
      if (!res.data) {
        return ctx.json({ error: 'Not found', message: '<Module> not found' }, 404)
      }

      return ctx.json(res.data)
    } catch {
      return ctx.json({ error: 'Internal server error', message: 'Ops, something went wrong' }, 500)
    }
  },

  // create
  create: async (ctx: Context) => {
    try {
      const instance = <entity>(ctx, E<Entity>Table.<TABLE>)

      const body: ICreate<Module>Req = await ctx.req.json()

      await instance.create(body)

      const item = await instance.getOne(body.id)
      const res = S<Module>Res.safeParse(item)

      return ctx.json(res.data)
    } catch {
      return ctx.json({ error: 'Internal server error', message: 'Ops, something went wrong' }, 500)
    }
  },

  // update
  update: async (ctx: Context) => {
    try {
      const instance = <entity>(ctx, E<Entity>Table.<TABLE>)

      const id = ctx.req.param('id')
      const body: IUpdate<Module>Req = await ctx.req.json()

      const existing = await instance.getOne(id)
      const check = S<Module>Res.safeParse(existing)
      if (!check.data) {
        return ctx.json({ error: 'Not found', message: '<Module> not found' }, 404)
      }

      const updated = await instance.update(id, body)
      const res = S<Module>Res.safeParse(updated)

      return ctx.json(res.data)
    } catch {
      return ctx.json({ error: 'Internal server error', message: 'Ops, something went wrong' }, 500)
    }
  },

  // delete
  delete: async (ctx: Context) => {
    try {
      const instance = <entity>(ctx, E<Entity>Table.<TABLE>)

      const id = ctx.req.param('id')

      const existing = await instance.getOne(id)
      const res = S<Module>Res.safeParse(existing)
      if (!res.data) {
        return ctx.json({ error: 'Not found', message: '<Module> not found' }, 404)
      }

      await instance.delete(id)

      return ctx.json(res.data)
    } catch {
      return ctx.json({ error: 'Internal server error', message: 'Ops, something went wrong' }, 500)
    }
  },
}
