# Spec: per-action verification

After a specific action, run the matching block. Declarative `MUST` checks — read and confirm, no script.

## After `+module`

- **MUST** create `<module>/{<module>.module.ts, <module>.service.ts, index.ts}` and re-export `<module>Module` from the barrel.
- **MUST** keep `<module>.module.ts` thin: validate with the project `zValidator`, delegate — no business logic.
- **MUST** return `ctx.json(...)` on every service path, including the standard 500 in `catch`.
- **MUST** add Zod schemas in `entities/dto/<module>.dto.ts` with `S*` / `I*` naming, re-exported from the dto barrel.
- **MUST** mount the module in the matching `app/routes/<entry>.routes.ts` (`app.route('/v1', <module>Module)`).
- **MUST** invalidate every affected cache key via `ctx.executionCtx.waitUntil(...)` on each mutation.
- **MUST** return `401` for unauthenticated requests to gated routes (`/v1/*` or the project's auth prefix).
- **MUST NOT** import another module.

## After `+widget` / `+feature`

- **MUST** create `<slice>/<name>.service.ts` + `index.ts`, optional `*.interface.ts` / `*.constant.ts`.
- **MUST** be pure logic — no `new Hono()` / `app.route`, no DO class (DO classes live in `entities/models/`).
- **MUST** compose only from layers below (entities, shared); a feature **MUST NOT** import a widget; neither imports a module or a same-layer sibling.

## After `+entity` (model / dto)

- **MUST** use the engine suffix in `entities/models/` (`*.object.ts` / `*.table.ts` / `*.collection.ts` / `*.model.ts`).
- **MUST** use `S*` for Zod schemas and `I*` for inferred types in `entities/dto/<entity>.dto.ts`, re-exported from the dto barrel.
- **For a Durable Object** additionally:
  - **MUST** re-export the DO class from its owning `app/<entry>.ts`.
  - **MUST** add binding + migration to **all** env blocks of `wrangler.<entry>.jsonc`.
  - **MUST** run `yarn cf-typegen` so `ctx.env.<BINDING>` is typed; **MUST NOT** hand-edit `types-<entry>.d.ts`.
  - **MUST** export an accessor helper alongside the class so services do not call `idFromName` directly.

## After `+shared` segment file

- **MUST** pick the correct segment (`components`/`constants`/`interfaces`/`middlewares`/`services`/`utils`).
- **MUST** use the matching suffix and re-export from the segment `index.ts`.
- **MUST** keep `utils` pure (no Hono, no service calls, no I/O).

## After `+pkg` integration

- **MUST** create `src/pkg/<name>/` with `index.ts` and `<name>.pkg.ts` (split into service/middleware/constants for larger integrations).
- **MUST** read config from `envConfig`, never `process.env`.
- **MUST NOT** import from `app/*` or another `pkg/*`; duplicate a shared helper privately if needed.

## After `+entry` / `+route`

- **MUST** add `app/<entry>.ts` that instantiates `new Hono<{ Bindings: Cloudflare<Entry>Bindings }>()`, applies global middleware, mounts the health route, hands off to `app/routes/<entry>.routes.ts`, wires `notFound`/`onError`, re-exports its DO classes, and default-exports the handler.
- **MUST** create exactly one matching `app/routes/<entry>.routes.ts` aggregator; it mounts modules and stays free of business logic.
- **MUST** point `wrangler.<entry>.jsonc` `main` at the new entry and run `yarn cf-typegen` for its bindings interface.

## After `bootstrap` (new project)

- **MUST** pass `yarn type-check`.
- **MUST** pass `yarn lint` / `yarn format` end-to-end.
- **MUST** boot via `yarn dev`; `GET /` returns the health text.
- **MUST** have all four env blocks present per `wrangler.<entry>.jsonc`, the validator wrapper wired, and `envConfig` in place.
