# Cloudflare-specific contract

Rules that apply when the worker uses Cloudflare bindings — Durable Objects, the Cache API, environment-scoped deploys.

## Wrangler environments

`wrangler.<entry>.jsonc` defines four workers from one codebase: top-level `local`, plus `env.develop`, `env.staging`, `env.production`. Each block independently owns:
- `name`
- `services` (`MY_SERVICE` self-binding)
- `durable_objects.bindings`
- `migrations`
- `limits.cpu_ms`
- `observability`
- env vars

There is **no inheritance** between top-level and `env.*`. Mirror every binding, DO, migration, and var across **all four** blocks. Skipping one breaks deploys for that environment, often silently until the first invocation.

## Secrets

Use `wrangler secret put --env <name>` for deployed environments. Never commit secret values to `wrangler.<entry>.jsonc`. Local development reads from `.env` / `.dev.vars`; both are git-ignored.

## Compatibility date

Keep `compatibility_date` in every `wrangler.<entry>.jsonc` **no older than ~1 month**. Cloudflare's official guidance is "set `compatibility_date` to the current date"; the project policy tightens that to a 30-day staleness budget. Bumping the date silently enables every flag whose default-on date falls within the bump window — review the flags listed at <https://developers.cloudflare.com/workers/configuration/compatibility-flags/> before merging.

When bumping:
1. Pick today's date (or the latest known stable flag date, whichever is older).
2. Apply the same date to **every** `wrangler.<entry>.jsonc` so entries do not diverge.
3. Run `yarn cf-typegen` per entry to refresh `types-<entry>.d.ts`.
4. Run `yarn format && yarn dev` and exercise modules touched by any newly-default flag (Node.js APIs, fetch streaming, URL pattern, etc.).

## Generated types

`types-<entry>.d.ts` is produced by `yarn cf-typegen` (alias of `wrangler types --env-interface Cloudflare<Entry>Bindings`). Regenerate after every change to bindings, DOs, vars, or secrets. Never hand-edit — the next generation overwrites edits.

## Durable Object lifecycle

When adding a DO:

1. **Create the class** in `src/app/entities/models/<entity>.object.ts` extending `DurableObject<Env>`.
2. **Run migrations idempotently** from the constructor:
   ```ts
   constructor(ctx: DurableObjectState, env: Env) {
     super(ctx, env)
     this.ctx.blockConcurrencyWhile(async () => { this.handleMigrations() })
   }
   private handleMigrations(): void {
     this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS ...`)
   }
   ```
3. **Expose CRUD** as public methods using `this.ctx.storage.sql.exec(...)`.
4. **Provide an accessor** so services do not touch bindings directly:
   ```ts
   export const <entity> = (ctx: Context, identifier: string) =>
     ctx.env.<BINDING>.get(ctx.env.<BINDING>.idFromName(identifier))
   ```
   Choose `identifier` deliberately: per-tenant, per-resource, or a fixed string for a singleton. The identifier is the DO partition key.
5. **Re-export the class from `src/app/<entry>.ts`**. Wrangler requires DO classes on the worker entry — without this re-export the DO will not be addressable.
6. **Update all four env blocks** of `wrangler.<entry>.jsonc`:
   - Add the binding under `durable_objects.bindings`.
   - Add the corresponding migration under `migrations` (e.g. `{ "tag": "v1", "new_sqlite_classes": ["<DOClass>"] }` for SQLite-backed DOs).
7. Run `yarn cf-typegen`. The new binding now appears on `ctx.env`.

## Per-route caching

Read routes use Hono's `cache()` middleware:
```ts
cache({
  cacheName: '<service>-<resource>',           // collection
  cacheControl: 'max-age=60',
  keyGenerator: (ctx) => `${url.origin}${url.pathname}`,
})
```
For per-id reads, scope the cache name to the id:
```ts
cache({
  cacheName: (ctx) => `<service>-<resource>-${ctx.req.param('id')}`,
  cacheControl: 'max-age=60',
})
```

## Cache invalidation on mutations

Every `POST` / `PATCH` / `DELETE` route must invalidate **every affected cache key** inside `ctx.executionCtx.waitUntil(...)`:

```ts
ctx.executionCtx.waitUntil((async () => {
  const list = await caches.open('<service>-<resource>')
  await list.delete(`${baseUrl}/<resource>`)

  // when the mutation targets a single item, also clear the per-id cache:
  const item = await caches.open(`<service>-<resource>-${id}`)
  await item.delete(`${baseUrl}/<resource>/${id}`)
})())
```

Skipping invalidation results in stale reads for the duration of `cacheControl: max-age`. The bug is silent and time-delayed; treat invalidation as part of the mutation, not an extra step.

## Validator wrapper

Routes must validate through the project's `zValidator` (from `pkg/validator/`), not `@hono/zod-validator` directly. The wrapper standardises the 400 error shape:
```ts
return ctx.json({ error: 'Bad Request', message }, 400)
```
Using `@hono/zod-validator` directly produces a different shape and breaks consumer error parsing.

## Env access

Read environment variables only through `envConfig` from `src/config/env.config.ts`. Add new vars to the Zod schema **and** document them in `.env.example`. `process.env` is forbidden in module/service/feature code.
