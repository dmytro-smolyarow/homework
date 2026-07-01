# Build And Deploy

## Purpose

The per-app dev / build / ship story for this three-app monorepo: the **client** (Next.js, deployed to Cloudflare Workers via OpenNext), the **server** (Fastify + PayloadCMS, packaged as a Docker image), and the **worker** (Hono on Cloudflare Workers, deployed with `wrangler`). Plus the `make` entrypoints and the local Docker Compose infra (Postgres + Redis) that backs dev. See [[architecture]] for the big-picture wiring and [[index]] for the catalog.

## How it works in this repo

### Monorepo layout — three independent Yarn projects

There is **no root workspace**. Each app has its own `package.json`, lockfile, and `node_modules`. The top-level [Makefile](../../Makefile) is the orchestrator and simply `cd`s into each app:

```
make copy-env     # cp .env.example .env in client, server, worker  (Makefile:52-56)
make install-deps # yarn install in each of the three apps           (Makefile:41-45)
make docker-up    # docker compose -f infra/docker-compose.yml up -d (Makefile:5-7)
make client-dev   # cd apps/client && yarn dev                       (Makefile:14-16)
make server-dev   # cd apps/server && yarn dev                       (Makefile:23-25)
make worker-dev   # cd apps/worker && yarn dev                        (Makefile:32-34)
```

Host requirements (from [README.md](../../README.md)): Node >= 22.x, Yarn 1.22.22, Docker. All three apps pin `yarn@1.22.22` and Node 22 via Volta.

### Local infra (Docker Compose)

[infra/docker-compose.yml](../../infra/docker-compose.yml), compose project `apps-containers`:

- `postgres-local` — `postgres:18`, host port **5434** -> container 5432, DB `develop`, user `postgres`.
- `redis-local` — `redis:8`, port 6379, `--appendonly yes`.

Backs the server's database/cache in dev. See [[database-and-migrations]].

### Client — Next.js -> Cloudflare Workers via OpenNext

Scripts in [apps/client/package.json](../../apps/client/package.json):

| Script | Command | Notes |
|---|---|---|
| `dev` | `next dev --turbo` | Turbopack dev server (`make client-dev`) |
| `build` | `next build` | plain Next build (used by OpenNext) |
| `deploy` | `opennextjs-cloudflare build --env=$CLOUDFLARE_ENV && opennextjs-cloudflare deploy --env=$CLOUDFLARE_ENV` | ships to CF Workers |
| `preview` | `opennextjs-cloudflare build && opennextjs-cloudflare preview --env=$CLOUDFLARE_ENV` | local Workers runtime preview |
| `devsafe` | `rm -rf .next && rm -rf .open-next && next dev` | clean rebuild, no Turbopack |

The client does **not** run on a Node host. `@opennextjs/cloudflare` (^1.14.0) transforms the Next build into a Worker bundle. The adapter config [apps/client/open-next.config.ts](../../apps/client/open-next.config.ts) is just `defineCloudflareConfig({})` (defaults).

Wrangler consumes the OpenNext output — [apps/client/wrangler.jsonc](../../apps/client/wrangler.jsonc):

- `main: ".open-next/worker.js"`, assets `directory: ".open-next/assets"` bound as `ASSETS`.
- `compatibility_date: 2025-08-15`, flags `["nodejs_compat", "global_fetch_strictly_public"]`, `minify: true`, `keep_names: false`.
- `WORKER_SELF_REFERENCE` service binding per env; `workers_dev`/`preview_urls` disabled; observability off.
- **Three Cloudflare envs:** `production` is top-level (`name: client-production`); `develop` (`client-develop`) and `staging` (`client-staging`) live under `env{}`.

`CLOUDFLARE_ENV` is the **only** knob that selects the wrangler env at deploy/preview time, and its value must match one of `production` / `develop` / `staging`. There is no inheritance between env blocks — each repeats its `name`, `services`, and `observability`.

Two layers of static caching:
- [apps/client/public/_headers](../../apps/client/public/_headers) — `/_next/static/*` -> `public,max-age=3600,immutable` (served via the Workers `ASSETS` binding).
- [apps/client/next.config.ts](../../apps/client/next.config.ts):51-56 — `/_next/image` -> `public, max-age=86400, immutable`; plus `images.minimumCacheTTL: 86400`, `deviceSizes`, `remotePatterns`. The config is wrapped by the `next-intl` plugin (messages from `translations/en.json`). Note the SVGR rule is declared twice — a `turbopack.rules` entry (used by `dev --turbo`) and a `webpack()` hook (used by `next build`).

More on the client surface: [[client-app]], [[client-config]].

### Server — Fastify + PayloadCMS -> Docker image

Scripts in [apps/server/package.json](../../apps/server/package.json):

- **`dev`** (`make server-dev`): `generate:types && generate:importmap && migrate:dep && nodemon`. So every dev start regenerates Payload types + import map, runs Payload migrations, then launches the watcher.
- **`build`**: `migrate:dep && next build && tsup`. `payload migrate` first, then `next build` compiles the **Payload admin** (a Next app under `src/app/(payload)`), then `tsup` bundles the Fastify server.
- **`start`**: `cross-env NODE_ENV=production node dist/server.js`.

[apps/server/nodemon.json](../../apps/server/nodemon.json) watches `src/server.ts` + `src/**/*`, **ignores** `src/app/(payload)/**` (so editing the admin doesn't restart the API), and execs `tsx src/server.ts` on `.ts` changes.

[apps/server/tsup.config.ts](../../apps/server/tsup.config.ts): entry `src/server.ts` -> `dist/`, `format: esm`, `target: node24`, `minify`, `treeshake`, `clean`, `skipNodeModulesBundle`. It **externalizes** `payload`, `next`, and all `@payloadcms/*` packages — they are NOT bundled and must exist in `node_modules` at runtime.

The Payload admin is Next-inside-Fastify: [apps/server/next.config.ts](../../apps/server/next.config.ts) ends with `export default withPayload(nextConfig, { devBundleServerPackages: false })`, and the admin route group lives at `src/app/(payload)`. See [[payload-cms]] and [[server-app]].

Packaging — [apps/server/Dockerfile.server](../../apps/server/Dockerfile.server) (the working image):

```
base   = node:24-alpine
deps   -> yarn install --frozen-lockfile (build context root: package.json + yarn.lock)
builder-> COPY . . ; yarn build  (Next + tsup, with a .next/cache mount)
runner -> non-root user 'nextjs'; copies node_modules + .next + dist + package.json
          ENV HOSTNAME=0.0.0.0 ; CMD ["node", "dist/server.js"]
```

### Worker — Hono on Cloudflare Workers

[apps/worker/package.json](../../apps/worker/package.json) (package name `paynext-microservice`):

- `dev` (`make worker-dev`): `wrangler dev --port 5000`.
- `deploy`: `wrangler deploy --minify`.
- `cf-typegen`: `wrangler types --env-interface CloudflareBindings`.

[apps/worker/wrangler.jsonc](../../apps/worker/wrangler.jsonc): `main: src/app/server.ts`, `compatibility_date: 2025-09-27`, flag `nodejs_compat`, `ASSETS` bound to `./public`, `limits.cpu_ms: 180000`. Declares a **`CacheDb` Durable Object** (`CACHE_DB` binding) with sqlite migration `tag: v1` / `new_sqlite_classes: ["CacheDb"]`, plus a `MY_SERVICE` self-reference. Unlike the client, the worker config is a single top-level config (`name: microservice-production`) with no `env{}` block. See [[worker-app]] and [[worker-modules]].

### Environment bootstrap

`make copy-env` copies `.env.example` -> `.env` in all three apps (each has its own example). Roughly:
- **client** — `NEXT_PUBLIC_*` plus `CLOUDFLARE_ENV` (deploy-time env selector). See [[client-config]].
- **server** — `PORT`, `DATABASE_URI`, `REDIS_URL`, `PAYLOAD_SECRET`, etc. See [[server-config-shared]] and [[auth]].
- **worker** — e.g. `SECRET_HEADER`, `JWT_SECRET`. See [[worker-app]].

## Where it lives

- Orchestration: [Makefile](../../Makefile), [README.md](../../README.md), [infra/docker-compose.yml](../../infra/docker-compose.yml).
- Client build/deploy: `apps/client/{package.json, wrangler.jsonc, open-next.config.ts, next.config.ts, public/_headers}`.
- Server build/deploy: `apps/server/{package.json, nodemon.json, tsup.config.ts, next.config.ts, Dockerfile.server}`.
- Worker build/deploy: `apps/worker/{package.json, wrangler.jsonc}`.

## Discrepancies / uncertainties

- **`apps/server/Dockerfile.worker` is broken/stale.** It runs `yarn build:worker` (line 12) and `CMD ["node", "dist/worker.js"]` (line 27), but `apps/server/package.json` defines **neither** a `build:worker` script nor any worker entry — `tsup` only emits `dist/server.js` from `src/server.ts` (there is no `worker.ts` in `src/`, so `dist/worker.js` is never produced). This image would fail to build. It also uses a **different build context** than `Dockerfile.server`: it COPYs `./apps/server/package.json ./apps/server/yarn.lock` and `./apps/server` (context = repo root), whereas `Dockerfile.server` COPYs `package.json yarn.lock` from the context root (context = `apps/server`). (verified by reading both Dockerfiles)
- **No CI/CD pipeline files were found in scope.** How `Dockerfile.server` and the `wrangler`/OpenNext deploys are actually invoked (which env, on which branch) is not defined here — no `.github/workflows` reviewed. (unverified beyond this area)
- Only the **client** and the **worker** ship to Cloudflare via wrangler/OpenNext; the **server** is a Dockerized Fastify/Node app, not a Worker. (verified)
- `apps/server/.env.example` reportedly ships a hardcoded `JWT_SECRET` placeholder value — flagged for env-handling guidance; see [[auth]]. (not re-read in this pass)
