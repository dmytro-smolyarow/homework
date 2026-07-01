# Wiki Log

Append-only chronicle. One entry per run.

## [2026-06-08] ingest | whole repository

First full ingest of `rl-apps-template`. Explored the monorepo with Glob/Grep/Read
(ignoring `node_modules`, build output, lockfiles) and wrote pages grounded in the
actual source.

- Discovered the repo is a **three-app monorepo** (`apps/client` Next.js, `apps/server`
  Fastify+Payload CMS, `apps/worker` Hono Cloudflare Worker) — broader than the
  prior single-worker framing.
- Created `index.md`: project overview, tech-stack table, top-level Mermaid
  architecture diagram, and a catalog of all 21 pages grouped into **Concepts /
  Client / Server / Worker**.
- Created **6 Concept pages**: [[architecture]], [[data-flow]], [[build-and-deploy]],
  [[auth]], [[database-and-migrations]], [[conventions-and-skills]].
- Created **6 Client pages**: [[client-app]], [[client-routing]],
  [[client-modules-widgets]], [[client-shared]], [[client-pkg]], [[client-config]].
- Created **7 Server pages**: [[server-app]], [[payload-cms]], [[server-collections]],
  [[server-features-blocks]], [[server-modules]], [[server-pkg]],
  [[server-config-shared]].
- Created **2 Worker pages**: [[worker-app]], [[worker-modules]] (added after the
  initial pass to close a coverage gap — the worker app had no dedicated page).
- Each page was adversarially verified against the source; cross-links restricted
  to canonical page names.
- Notable code findings captured in pages (not wiki errors, real repo state):
  the client's `getSession()` always returns a truthy object so the middleware
  `/dashboard` guard never fires; client→server auth hits `/api/v1/auth/...` with
  no matching rewrite in `next.config.ts`; social login is a `console.log` stub;
  `apps/server/Dockerfile.worker` references a non-existent `build:worker`/`dist/worker.js`;
  Payload `graphQL` is disabled in `payload.config.ts`; the worker's `authMiddleware`
  is exported but unused.
- **Reconciliation:** mid-ingest, `.claude/CLAUDE.md` was replaced with generic
  engineering guidelines (no project-specific architecture/commands/hard rules).
  Updated 9 pages (architecture, conventions-and-skills, client-shared,
  database-and-migrations, payload-cms, server-app, server-config-shared,
  server-features-blocks, worker-app) to drop now-false CLAUDE.md citations and
  re-attribute conventions to the `.claude/skills/` structure skills + README,
  while preserving the genuine code findings embedded in those notes.

## [2026-06-08] ingest | whole repository (verification refresh)

Re-ran the full Ingest over the repo to reconcile the wiki against current source.

- Confirmed the working tree is clean and the only commits after the initial
  ingest are the two wiki commits (`f1515ad`, `f315402`) — i.e. **application
  code is unchanged** since the wiki was first written.
- Re-walked the `apps/{client,server,worker}` file trees (excluding
  `node_modules`/build output): all match the FSD layout documented in
  [[architecture]] and the per-app pages exactly. No new/removed/renamed slices.
- Spot-verified every "notable finding" against live source — all still hold:
  Payload `graphQL: { disable: true }` (`payload.config.ts`); `Dockerfile.worker`
  still references a non-existent `build:worker` / `dist/worker.js`; the worker's
  `authMiddleware` is exported but only `secretHeaderMiddleware` is wired in
  `worker/src/app/server.ts`; client social login is a `console.log(_data)` stub;
  no rewrites in client `next.config.ts` while `auth.server.ts` fetches
  `/api/v1/auth/get-session`; `getSession()` returns a truthy object on all paths
  so the `/dashboard` + `/sign-in` middleware guards misbehave.
- **Result:** no drift found; no page content or `index.md` changes required.
  Pages remain grounded in current source.
