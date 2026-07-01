import { Hono } from 'hono'

import { secretHeaderMiddleware } from '../../pkg/auth'
import { <module>Module } from '../modules/__module__'

// <entry> routes — aggregates every module exposed by app/<entry>.ts
const <entry>Routes = new Hono<{ Bindings: Cloudflare<Entry>Bindings }>()

// auth gate
<entry>Routes.use('*', secretHeaderMiddleware)

// modules — list every module the matching <entry> exposes
<entry>Routes.route('/', <module>Module)

export default <entry>Routes
