# Spec: per-action verification

After a specific action, run the matching block. Declarative `MUST` checks — read and confirm, no script.

## After `+module`

- **MUST** create `<module>/{<module>.module.ts, <module>.service.ts, index.ts}`.
- **MUST** keep `<module>.module.ts` thin: declare `schema`, set `preHandler`, delegate — no business logic.
- **MUST** return `reply.code(n).send(...)` on every service path, including `reply.code(500).send({ error: 'Internal Server Error' })` in `catch`.
- **MUST** declare `schema.response` as a status-code map on every route.
- **MUST** gate protected routes with `preHandler: [server.authenticate]` → unauthenticated requests return `401`.
- **MUST** return `400` for an invalid body (ZodTypeProvider validation).
- **MUST** register the module in `app/routes/server.routes.ts` (`server.register(<module>Module, { prefix })`).
- **MUST** add request/response schemas in `entities/dto/<module>.dto.ts` with `S*` / `I*` naming, re-exported from the dto barrel.
- **MUST NOT** import another module.

## After `+widget` / `+feature`

- **MUST** create `<slice>/<name>.service.ts` (or `<name>.block.ts` for a CMS block) + `index.ts`, optional `*.interface.ts` / `*.constant.ts`.
- **MUST** be pure logic — no `server.route`/`server.register`; no `FastifyInstance`/`FastifyRequest` dependency except for logging.
- **MUST** compose only from layers below (entities, shared); a feature **MUST NOT** import a widget; neither imports a module or a same-layer sibling.

## After `+entity` (model / dto)

- **MUST** use the engine suffix in `entities/models/` (`*.collection.ts` / `*.table.ts` / `*.model.ts`).
- **MUST** use `S*` for Zod schemas and `I*` for inferred types in `entities/dto/<entity>.dto.ts`, re-exported from the dto barrel.
- **MUST** write response schemas as a plain `{ [statusCode]: ZodSchema }` map, not a Zod schema.
- **MUST** run `yarn generate:types` after adding a Payload CMS collection to the CMS config; **MUST NOT** hand-edit `payload-types.ts`.

## After `+shared` segment file

- **MUST** pick the correct segment (`constant`/`interface`/`middleware`/`service`/`hook`/`util`).
- **MUST** use the matching suffix and re-export from the segment `index.ts`.
- **MUST** keep `util` pure (no Fastify, no service calls, no I/O).
- **MUST** return `{ data?, error? }` from a `shared/service` method — never `reply.send()`.

## After `+pkg` integration

- **MUST** create `src/pkg/<name>/` with `index.ts` and relevant files (`.plugin.ts`, `.service.ts`, `.interface.ts`, `.constant.ts`).
- **MUST** wrap a plugin that decorates `server.*` with `fp` from `fastify-plugin`.
- **MUST** place module augmentation (`declare module 'fastify' { … }`) in `<name>.interface.ts`, imported once in `server.ts`.
- **MUST** read config from `envConfig`, never `process.env`.
- **MUST NOT** import from `app/*` or another `pkg/*`; duplicate a shared helper privately if needed.

## After `+route` registration

- **MUST** register via the `app/routes/server.routes.ts` aggregator with the version prefix; the aggregator stays free of business logic.
- **MUST** keep the health route and `404` fallback intact.

## After `bootstrap` (new project)

- **MUST** pass `yarn type-check`.
- **MUST** pass `yarn lint` / `yarn format` end-to-end.
- **MUST** boot via `yarn dev`; `GET /api/v1/health` returns `OK`.
- **MUST** have `validatorCompiler` / `serializerCompiler` set, the auth plugin registered, and `envConfig` wired.
