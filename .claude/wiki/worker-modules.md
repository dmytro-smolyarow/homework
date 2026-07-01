# Worker Modules

## Purpose

The worker's one populated vertical slice: a **`webhooks` key/value CRUD API**
under `/v1/webhooks`, plus the `pkg` integrations and the `CacheDb` Durable
Object that back it. This page covers the worker's request layer, service,
persistence, schemas, and `pkg`; the entry/bootstrap/deploy story is in
[[worker-app]].

## Webhooks module — request layer

`apps/worker/src/app/modules/webhooks/webhooks.module.ts` — a Hono **sub-app**
(`new Hono<{ Bindings: CloudflareBindings }>().basePath('/webhooks')`) mounted at
`/v1` by [[worker-app]], so routes resolve at `/v1/webhooks*`.

| Method & path | Validation (`zValidator`) | Caching | Handler |
|---|---|---|---|
| `GET /` | — | `cache()` name `paynext-webhooks`, `max-age=60`, key = origin+pathname | `webhooksService.getAll` |
| `GET /:id` | `param` ← `SGetOneKeyParams` | `cache()` name `paynext-webhooks-${id}`, `max-age=60` | `webhooksService.getOne` |
| `POST /` | `json` ← `SCreateKeyReq` | invalidates list cache on success | `webhooksService.create` |
| `PATCH /:id` | `param` ← `SGetOneKeyParams`, `json` ← `SUpdateKeyReq` | invalidates list + item cache | `webhooksService.update` |
| `DELETE /:id` | `param` ← `SDeleteKeyParams` | invalidates list + item cache | `webhooksService.delete` |

Reads use Cloudflare's **Cache API** via `hono/cache`. Writes invalidate
explicitly inside `ctx.executionCtx.waitUntil(...)` by reopening the named caches
(`caches.open('paynext-webhooks')`, `caches.open('paynext-webhooks-${id}')`) and
`.delete(...)`-ing the affected URLs after `res.ok`. Validation failures short-
circuit to a `400 { error: 'Bad Request', message }` from the shared validator.

## Webhooks service

`apps/worker/src/app/modules/webhooks/webhooks.service.ts` — an object of async
handlers (`getAll/getOne/create/update/delete`). Each:

1. Resolves a Durable Object stub: `const db = cacheDb(ctx, ECacheDbTable.KEYS)`.
2. Calls the DO's RPC methods directly (`await db.getAll()`, `db.getOne(id)`,
   `db.create(body)`, `db.update(id, body)`, `db.delete(id)`).
3. Re-validates the DO's output with `SWebhookRes` / `SWebhooksRes` `safeParse`
   before responding, mapping missing rows to `404 { error: 'Not found' }` and
   thrown errors to `500 { error: 'Internal server error' }`.

> **Note:** the DO identifier passed to `cacheDb` is the literal table name
> `'keys'` (`ECacheDbTable.KEYS`) for **every** request, so all traffic shares a
> single global `CacheDb` instance rather than partitioning by tenant/key. (This
> is a sample/demo pattern.)

## CacheDb — Durable Object (persistence)

`apps/worker/src/app/entities/models/cache-db.object.ts` is the worker's
persistence layer — the edge-SQLite analog to the server's Postgres
([[database-and-migrations]]).

- `class CacheDb extends DurableObject<Env>` (`cloudflare:workers`). The
  constructor runs `ctx.blockConcurrencyWhile(() => this.handleMigrations())`.
- `handleMigrations()` lazily (`initialized` guard) creates the `keys` table
  (`id TEXT PRIMARY KEY, title TEXT NOT NULL, updated_at INTEGER, created_at
  INTEGER`) + an index, via `this.ctx.storage.sql.exec(...)` — the DO's embedded
  SQLite. This is a **code-defined schema**, distinct from the server's dated
  Payload migration files.
- RPC surface: `getAll`, `getOne`, `create`, `update`, `delete` — all
  parameterized `sql.exec` against the `keys` table; `Date.now()` stamps
  `created_at`/`updated_at`. Verbose `console.log` tracing throughout.
- `ECacheDbTable` enum (`KEYS = 'keys'`) names the table.
- `cacheDb(ctx, identifier)` helper: `ctx.env.CACHE_DB.idFromName(identifier)` →
  `ctx.env.CACHE_DB.get(id)` → the DO stub. The `CACHE_DB` binding is declared in
  `wrangler.jsonc` (see [[worker-app]]).

## Schemas — entities

`apps/worker/src/app/entities/schemas/webhook.schema.ts` (barrelled by
`schemas/index.ts`) — the worker's zod DTOs:

- Requests: `SCreateKeyReq` (`id` + `title`, both non-empty), `SUpdateKeyReq`
  (`title`), `SGetOneKeyParams` / `SDeleteKeyParams` (`id`).
- Responses: `SWebhookRes` (single record: `id/title/updated_at/created_at`),
  `SWebhooksRes` (`{ data: [...], meta: { total } }`), plus inferred `I*` types.

## Validation & middleware — pkg

- `apps/worker/src/pkg/validator/validator.pkg.ts` — `zValidator(target, schema)`
  wraps `@hono/zod-validator`, returning `ctx.json({ error: 'Bad Request',
  message }, 400)` on failure (the error message is the parsed
  `result.error.message`). This 400 shape matches the `worker-structure` skill
  contract (see [[conventions-and-skills]]).
- `apps/worker/src/pkg/middleware/middleware.pkg.ts`:
  - `secretHeaderMiddleware` — compares the `x-header-secret` request header to
    `envConfig.SECRET_HEADER`; returns `401` on mismatch. Wired on `/v1/*` in
    [[worker-app]].
  - `authMiddleware` — a JWT guard reading the `better-auth.session_data` /
    `__Secure-better-auth.session_data` cookie and verifying it with `hono/jwt`
    (HS256, `envConfig.JWT_SECRET`). It reuses the **same cookie + secret scheme
    as the client and server** ([[auth]]), but is **exported and never used** —
    no route applies it. (flagged)

## Depends on / talks to

- [[worker-app]] — the entry that mounts this module and declares `CACHE_DB`.
- [[data-flow]] — the worker request lifecycle in the broader system.
- [[auth]] — shared `better-auth` cookie/JWT scheme used by the unused `authMiddleware`.
- [[database-and-migrations]] — contrast with the server's Postgres + Payload migrations.
- [[architecture]] · [[conventions-and-skills]] · [[index]]
