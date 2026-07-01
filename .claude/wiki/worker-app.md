# Worker App

## Purpose

`apps/worker` (package name **`paynext-microservice`**) is the third app of the
monorepo: a standalone **Hono 4 app running on a Cloudflare Worker**, deployed
with `wrangler`. It exposes a small, shared-secret-protected `/v1` API (a sample
key/"webhooks" CRUD) backed by a **`CacheDb` Durable Object** (SQLite at the
edge). It is fully independent of the [[server-app]] — no Postgres, no Redis, no
Node host. See [[architecture]] for how it fits the three-app layout.

## Key files

- `apps/worker/src/app/server.ts` — the Worker entry. Builds the root
  `Hono<{ Bindings: CloudflareBindings }>` app, wires global middleware, mounts
  routes, and **re-exports the `CacheDb` Durable Object** (line 9:
  `export { CacheDb } from './entities/models'` — required so the Workers runtime
  can find the DO class on the entry module). `export default app`.
- `apps/worker/wrangler.jsonc` — the deploy/runtime contract (bindings,
  Durable Object, migrations, limits). See below.
- `apps/worker/worker-configuration.d.ts` — **generated** by
  `wrangler types --env-interface CloudflareBindings` (`yarn cf-typegen`).
  Supplies the `CloudflareBindings` type used as the Hono `Bindings`. Never
  hand-edit (the `worker-structure` skill's "generated types are read-only"
  convention; see [[conventions-and-skills]]).
- `apps/worker/src/config/env.config.ts` (+ `index.ts` barrel) — typed env via
  `@t3-oss/env-core` `createEnv`. Server vars: `NODE_ENV` (optional enum
  `local|production|development`), `SECRET_HEADER` (required), `JWT_SECRET`
  (required); `runtimeEnv: process.env`, `emptyStringAsUndefined: true`, with a
  top-of-file `import 'dotenv/config'`. `envConfig` is the **only** env accessor.
- `apps/worker/tsconfig.json` — `ESNext` / `Bundler` resolution, `jsx: react-jsx`
  with `jsxImportSource: hono/jsx`, `types: ["./worker-configuration.d.ts", "node"]`.
- `apps/worker/package.json` — deps: `hono`, `@hono/zod-validator`, `zod`,
  `@t3-oss/env-core`, `dotenv`. Scripts in [[build-and-deploy]].

## The Hono entry (`server.ts`)

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', logger(), cors({ origin: '*', allowMethods: [...], allowHeaders: [...] }), timeout(60000))
app.get('/', (c) => c.text('Server is running...'))      // health check (public)
app.use('/v1/*', secretHeaderMiddleware)                 // shared-secret gate
app.route('/v1', webhooksModule)                         // → /v1/webhooks/*
app.notFound(...)   // 404 { message: 'Not found' }
app.onError(...)    // 500 { message: 'Internal server error' }, logs method+path
export default app
export { CacheDb } from './entities/models'
```

Two-tier surface: `GET /` is open; everything under `/v1/*` must present a valid
`x-header-secret` (checked by `secretHeaderMiddleware`, see [[worker-modules]]).
The single mounted slice is the `webhooks` module. The full request lifecycle
(validation → service → Durable Object → Cache API invalidation) is documented
in [[worker-modules]] and [[data-flow]].

## `wrangler.jsonc` — runtime contract

- `main: src/app/server.ts`, `compatibility_date: 2025-09-27`, flag
  `nodejs_compat`.
- `assets: { binding: ASSETS, directory: ./public }`.
- **Durable Object:** `durable_objects.bindings` → `{ name: CACHE_DB, class_name: CacheDb }`,
  with `migrations: [{ tag: v1, new_sqlite_classes: ["CacheDb"] }]` (SQLite-backed DO).
- `limits.cpu_ms: 180000`; `services: [{ binding: MY_SERVICE, service: microservice-production }]`
  (self-reference); `workers_dev: true`, `preview_urls: false`, observability off.
- **Single top-level config** named `microservice-production` — there is **no
  `env{}` block**, unlike the client's multi-env `wrangler.jsonc`
  (contrast in [[build-and-deploy]]).

## FSD layout

```
apps/worker/src/
  app/
    modules/webhooks/     webhooks.module.ts + webhooks.service.ts   → [[worker-modules]]
    entities/
      models/cache-db.object.ts   CacheDb Durable Object (SQLite)    → [[worker-modules]]
      schemas/webhook.schema.ts   zod request/response DTOs
    shared/{constants,services}/  empty placeholder barrels
    widgets/                      empty placeholder barrel (no features layer)
  config/env.config.ts    typed env (above)
  pkg/
    middleware/middleware.pkg.ts  secretHeaderMiddleware (+ unused authMiddleware)
    validator/validator.pkg.ts    zValidator wrapper
```

The layout follows the `worker-structure` skill (router + independent segments).
It is **scaffolded more than populated**: only the `webhooks` slice, the
`CacheDb` model, the two schemas, and the two `pkg` integrations carry real code;
`shared/*` and `widgets/` are comment-only `index.ts` files. See
[[conventions-and-skills]].

## Build & deploy

`yarn dev` → `wrangler dev --port 5000`; `yarn deploy` → `wrangler deploy --minify`;
`yarn cf-typegen` → regenerate `worker-configuration.d.ts`. Driven via
`make worker-dev`. Full table and the OpenNext/Docker contrasts live in
[[build-and-deploy]].

> Note: this worker is governed by the `worker-structure` skill. The
> Cloudflare-specific conventions (`cf-typegen`, `envConfig`,
> generated-types-are-read-only, mirror bindings across `wrangler.<entry>.jsonc`
> env blocks) live in that skill — the architectural source of truth, alongside
> the README. Details in [[architecture]] and [[conventions-and-skills]].

## Depends on / talks to

- [[worker-modules]] — the `webhooks` slice, `CacheDb` Durable Object, and `pkg`.
- [[architecture]] · [[build-and-deploy]] · [[data-flow]] — where the worker sits, ships, and serves.
- [[auth]] — the unused `authMiddleware` reuses the same `better-auth.session_data` cookie / `JWT_SECRET` scheme as the client + server.
- [[database-and-migrations]] — the `CacheDb` DO is the worker's edge-SQLite analog to the server's Postgres.
- [[conventions-and-skills]] · [[index]]

## Discrepancies / uncertainties

- `env.config.ts` reads `process.env` (via `createEnv` + `dotenv/config`). On a
  Worker, vars come from `wrangler` (`.dev.vars` / dashboard secrets) and are
  exposed through `process.env` only under `nodejs_compat` — runtime population
  not verified here. (unverified)
- The `MY_SERVICE` self-reference service binding is declared in `wrangler.jsonc`
  but no consumer was found in `src/`. (unverified)
- `authMiddleware` (`pkg/middleware`) is exported but **never wired** — only
  `secretHeaderMiddleware` is used in `server.ts`. See [[worker-modules]].
