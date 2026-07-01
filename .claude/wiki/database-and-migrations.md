# Database And Migrations

**Purpose** — The persistence layer for the Payload CMS server app (`apps/server`): a PostgreSQL database reached through Payload's Postgres adapter, a directory of Payload-generated SQL migrations that own all schema changes, and a Redis-or-memory cache layer (`fastify-cacheman`) plus a CDN cache header helper. Local Postgres and Redis run as Docker containers.

> Note: don't confuse this app's persistence with the sibling *Cloudflare Workers + Hono* app ([[worker-app]], whose `worker-structure` skill covers Durable Objects, `wrangler.<entry>.jsonc`, and `yarn cf-typegen`). None of that applies to `apps/server` — there are no Workers, no `wrangler`, and no `cf-typegen` here. The analogous hard rules for this app are: never hand-edit migration `.ts`/`.json` (Payload generates them) and read env only through `envConfig`. See [[server-config-shared]].

## What it is

Schema and data live in Postgres. Payload owns the schema entirely: `push: false` means Payload never auto-syncs the DB in dev — every schema change must be authored as a migration file. App code never touches `pg` directly; it awaits a single shared Payload client (`dbService`) and calls `db.find` / `db.findGlobal` etc. Hot reads are wrapped in a cache (Redis in deployed envs, in-memory locally).

## Key files

- `apps/server/src/payload.config.ts` — configures `postgresAdapter`: `idType: 'uuid'`, `migrationDir` → `app/(payload)/migrations`, pool `connectionString: envConfig.DATABASE_URI` with `dbConfig` spread in, conditional `ssl` (production only), conditional `readReplicas`, and `push: false`.
- `apps/server/src/config/db.config.ts` — plain `dbConfig` pool-tuning object spread into the adapter pool.
- `apps/server/src/pkg/payload/db/db.service.ts` — `export const dbService = getPayload({ config })`. This is a **Promise** consumers must `await`.
- `apps/server/src/pkg/payload/db/index.ts` — barrel re-exporting `db.service` (imported as `@/pkg/payload/db`).
- `apps/server/src/app/(payload)/migrations/index.ts` — generated registry; imports each migration module and exports the ordered `migrations` array of `{ up, down, name }`.
- `apps/server/src/app/(payload)/migrations/20251129_201017.ts` — initial base migration (~39 KB `.ts`, ~135 KB `.json` snapshot) that creates the full schema.
- `apps/server/src/app/(payload)/migrations/20251202_212436.ts` — example incremental migration (creates the `customers` table + indexes/FKs); shows the `up`/`down` + `sql` + `MigrateUpArgs`/`MigrateDownArgs` pattern.
- `apps/server/src/pkg/cache/cache.service.ts` — `redisCache` (`fastify-cacheman` options) and `cdnCache()` helper.
- `apps/server/src/pkg/cache/cache.interface.ts` — `ECacheTTL` enum (seconds: `MINUTE` … `MONTHLY`).
- `apps/server/src/config/env.config.ts` — t3-env/Zod schema for `DATABASE_URI` (required), `DATABASE_URI_READ_ONLY`/`REDIS_URL` (optional), `PAYLOAD_SECRET`, `NODE_ENV`.
- `apps/server/src/server.ts` — registers the cache plugin: `server.register(fastifyCaching, redisCache)` (line 42).
- `apps/server/src/app/modules/cms/cms.service.ts` — representative consumer (cache-then-DB pattern). See [[server-modules]].
- `infra/docker-compose.yml` — local `postgres:18` (host `5434` → `5432`, db `develop`) and `redis:8` (`6379`, appendonly).
- `apps/server/package.json` — migrate/schema scripts; pins `@payloadcms/db-postgres` and `payload` at `3.66.0`, `fastify-cacheman` `^5.0.0`.

## How it works in this repo

### The Postgres adapter

`payload.config.ts` (lines 71–83):

```ts
db: postgresAdapter({
  idType: 'uuid',
  migrationDir: path.resolve(dirname, 'app/(payload)/migrations'),
  pool: {
    connectionString: envConfig.DATABASE_URI,
    ...(envConfig.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : {}),
    ...dbConfig,
  },
  readReplicas: envConfig.DATABASE_URI_READ_ONLY ? [envConfig.DATABASE_URI_READ_ONLY] : undefined,
  push: false,
  // schemaName: 'cms', // commented hint; default schema is 'public'
}),
```

- **UUID primary keys** — `idType: 'uuid'` surfaces in migrations as `"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()`.
- **SSL only in production** — `ssl: { rejectUnauthorized: false }` is added solely when `NODE_ENV === 'production'` (comment: standard AWS RDS certs).
- **Read replicas are optional** — only when `DATABASE_URI_READ_ONLY` is set.
- **Pool tuning** lives in `db.config.ts` and is spread *after* `connectionString`: `idleTimeoutMillis 20000`, `connectionTimeoutMillis 10000`, `keepAlive true`, `keepAliveInitialDelayMillis 30000`, `allowExitOnIdle true`.
- **`push: false`** — no auto schema sync; the database is mutated only by running migrations.

`payload.config.ts` is the central wiring point for [[payload-cms]]; the collections it registers (and whose schema the migrations create) are documented in [[server-collections]].

### The shared client

`dbService = getPayload({ config })` is a Promise. Consumers in [[server-modules]] do `const db = await dbService` then call Payload's local API (`db.find`, `db.findGlobal`, …). App code never imports `pg`. Importing path is the barrel `@/pkg/payload/db` (see [[server-pkg]]).

### Migrations

Each schema change is a **dated pair**: `<YYYYMMDD_HHMMSS>.ts` (the `up`/`down` runner) + a same-named `.json` schema snapshot. `index.ts` wires them in chronological order into the `migrations` array. Confirmed on disk:

```
20251129_201017.ts  (~39 KB initial schema)   + .json (~135 KB)
20251202_212436.ts  (customers table)         + .json
20251202_212612.ts / 20251202_215932.ts / 20251202_221438.ts / 20251202_221554.ts  (small ALTERs)
```

Migrations use Payload helpers and run raw SQL:

```ts
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE TABLE "customers" ( "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, ... )`)
}
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "customers" CASCADE; ...`)
}
```

**Workflow scripts** (`apps/server/package.json`):

| Script | Command | Use |
| --- | --- | --- |
| `migrate:dev` | `payload migrate:create` | author a new migration (generates the `.ts` + `.json` pair) |
| `migrate:dep` | `payload migrate` | run pending migrations |
| `generate:schema` | `payload generate:db-schema` | emit the Drizzle/SQL schema |
| `generate:types` | `payload generate:types` | regenerate `payload-types.ts` |

Migrations are part of the lifecycle: `dev` runs `generate:types && generate:importmap && migrate:dep` before `nodemon`, and `build` runs `migrate:dep` before `next build`. Migration files (and `payload-types.ts`) are generated — do not hand-edit them. See [[build-and-deploy]] for the full build/start chain.

### Caching

Two independent layers in `apps/server/src/pkg/cache/cache.service.ts`:

1. **In-app cache (`redisCache`)** — `fastify-cacheman` options. Engine is chosen at runtime: `engine: envConfig.REDIS_URL ? 'redis' : 'memory'`, `url: envConfig.REDIS_URL ?? undefined`. Registered in `server.ts` as `server.register(fastifyCaching, redisCache)`, which decorates instances with `server.cacheman.get/set`.
2. **CDN cache (`cdnCache`)** — a reply helper that sets `Cache-Control: public, max-age=0, s-maxage=<ttl>` and an optional `Cache-Tag` header (default `ECacheTTL.HOURLY`). This is for edge/CDN caching, separate from `cacheman`.

`ECacheTTL` (`cache.interface.ts`) enumerates TTLs in seconds: `MINUTE=60`, `FIFTEEN_MINUTES=900`, `THIRTY_MINUTES=1800`, `HOURLY=3600`, `FOUR_HOURLY=14400`, `DAILY=86400`, `WEEKLY=604800`, `MONTHLY=2592000`.

The canonical consumption pattern (`cms.service.ts`): build a cache key from `req.url`, check `server.cacheman.get`, fall through to `await dbService` + `db.find`/`db.findGlobal`, then `server.cacheman.set(key, data, ECacheTTL.FOUR_HOURLY)`.

```mermaid
flowchart LR
  H["module handler<br/>(cms.service.ts)"] -->|cacheman.get key| C{hit?}
  C -- yes --> R[reply 200]
  C -- no --> D["await dbService<br/>db.find / db.findGlobal"]
  D --> A["postgresAdapter pool"]
  A --> PG[("Postgres<br/>push:false")]
  D -->|cacheman.set ttl| CACHE[("Redis / memory")]
  D --> R
```

### Local infra

`infra/docker-compose.yml` (project `apps-containers`) provides `postgres:18` published on host port **5434** (not the default 5432; container is `5432`), db `develop`, user `postgres` / password `password`; and `redis:8` on `6379` with `--appendonly yes`. The committed `apps/server/.env` confirms the matching local values: `DATABASE_URI=postgresql://postgres:password@localhost:5434/develop` and `REDIS_URL=redis://localhost:6379`. (A committed `apps/server/.env.example` provides the blank-valued template.)

## Depends on / talks to

- [[payload-cms]] — `payload.config.ts` (the adapter, collections, globals) and the `getPayload` client.
- [[server-collections]] — the collections/globals whose tables these migrations create.
- [[server-pkg]] — `pkg/payload/db` (client barrel) and `pkg/cache` live here.
- [[server-config-shared]] — `db.config.ts` and `env.config.ts` (`envConfig` is the only sanctioned env access).
- [[server-app]] — migrations live under `app/(payload)/migrations`; `server.ts` registers the cache plugin.
- [[server-modules]] — feature services (e.g. `cms`) are the consumers of `dbService` + `cacheman`.
- [[build-and-deploy]] — `migrate:dep` runs inside `dev` and `build`; `generate:types`/`generate:schema` keep types in sync.

## Uncertainties

- The local `DATABASE_URI` (port `5434`, db `develop`) is verified from the committed `apps/server/.env` and matches `docker-compose.yml`; `apps/server/.env.example` is the blank template.
- `NODE_ENV` enum is `['local','production','development']`, but the DB/SSL/debug branches only test `=== 'production'` / `!== 'production'`; the `development` vs `local` distinction is not exercised for persistence choices.
- `fastify-cacheman` (`^5.0.0`) supplies the `server.cacheman` decorator used in `cms.service.ts`; it is typed via `FastifyCachemanOptions` but the decorator type augmentation wasn't located in the files read.
