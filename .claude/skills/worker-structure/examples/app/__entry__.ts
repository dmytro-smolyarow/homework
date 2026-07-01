import { Hono } from 'hono'

import { <entry>Routes } from './routes'

import { serverConfig } from '../config'

// re-export every Durable Object class — Wrangler requires DO classes on the worker entry
export { <DOClass> } from './entities/models'

// <entry>
const app = new Hono<{ Bindings: Cloudflare<Entry>Bindings }>()

// global middleware
app.use('*', serverConfig.logger, serverConfig.cors, serverConfig.timeout)

// health check
app.get('/', (c) => {
  return c.text('<entry> is running...')
})

// routes
app.route('/v1', <entry>Routes)

// global not found
app.notFound((ctx) => {
  return ctx.json({ message: 'Not found' }, 404)
})

// global error handler
app.onError((err, ctx) => {
  console.error(`${ctx.req.method} ${ctx.req.path} - ${err}`)
  return ctx.json({ message: 'Internal server error' }, 500)
})

export default app
