import { Hono } from 'hono'
import { cache } from 'hono/cache'

import { <module>Service } from './<module>.service'

import { zValidator } from '../../../pkg/validator'
import {
  SCreate<Module>Req,
  SDelete<Module>Params,
  SGetOne<Module>Params,
  SUpdate<Module>Req,
} from '../../entities/dto'

// <module> module
const <module>Module = new Hono<{ Bindings: Cloudflare<Entry>Bindings }>().basePath('/<module>')

// GET /<module>
<module>Module.get(
  '/',
  cache({
    cacheName: '<service>-<module>',
    cacheControl: 'max-age=60',
    keyGenerator: (ctx) => {
      const url = new URL(ctx.req.url)
      return `${url.origin}${url.pathname}`
    },
  }),
  async (ctx) => {
    return <module>Service.getAll(ctx)
  },
)

// GET /<module>/:id
<module>Module.get(
  '/:id',
  cache({
    cacheName: (ctx) => `<service>-<module>-${ctx.req.param('id')}`,
    cacheControl: 'max-age=60',
  }),
  zValidator('param', SGetOne<Module>Params),
  async (ctx) => {
    return <module>Service.getOne(ctx)
  },
)

// POST /<module>
<module>Module.post('/', zValidator('json', SCreate<Module>Req), async (ctx) => {
  const res = await <module>Service.create(ctx)

  // invalidate the list cache so the new item appears on next read
  if (res.ok) {
    const baseUrl = new URL(ctx.req.url).origin
    ctx.executionCtx.waitUntil(
      (async () => {
        const cacheInstance = await caches.open('<service>-<module>')
        await cacheInstance.delete(`${baseUrl}/<module>`)
      })(),
    )
  }

  return res
})

// PATCH /<module>/:id
<module>Module.patch(
  '/:id',
  zValidator('param', SGetOne<Module>Params),
  zValidator('json', SUpdate<Module>Req),
  async (ctx) => {
    const res = await <module>Service.update(ctx)

    // invalidate both list and per-id cache
    if (res.ok) {
      const id = ctx.req.param('id')
      const baseUrl = new URL(ctx.req.url).origin
      ctx.executionCtx.waitUntil(
        (async () => {
          const list = await caches.open('<service>-<module>')
          const item = await caches.open(`<service>-<module>-${id}`)
          await Promise.all([
            list.delete(`${baseUrl}/<module>`),
            item.delete(`${baseUrl}/<module>/${id}`),
          ])
        })(),
      )
    }

    return res
  },
)

// DELETE /<module>/:id
<module>Module.delete('/:id', zValidator('param', SDelete<Module>Params), async (ctx) => {
  const res = await <module>Service.delete(ctx)

  if (res.ok) {
    const id = ctx.req.param('id')
    const baseUrl = new URL(ctx.req.url).origin
    ctx.executionCtx.waitUntil(
      (async () => {
        const list = await caches.open('<service>-<module>')
        const item = await caches.open(`<service>-<module>-${id}`)
        await Promise.all([
          list.delete(`${baseUrl}/<module>`),
          item.delete(`${baseUrl}/<module>/${id}`),
        ])
      })(),
    )
  }

  return res
})

export default <module>Module
