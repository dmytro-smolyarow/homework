---
name: server-structure
description: Use when scaffolding a new Fastify project, bootstrapping from zero, adding a module/widget/feature/entity to an existing server codebase, adding a shared util/middleware/service, registering a route, deciding where a new file should live, or auditing an existing server against a Feature-Sliced Design (Layer/Slice/Segment) layout. Even if the user doesn't say "FSD" or "structure" explicitly — if they're placing new code in a Fastify server repo, use this skill. Skip for one-line edits, bug fixes, and refactors inside an existing slice.
---

# server-structure

Provide the canonical architectural pattern for **Fastify 5 + Zod** services. The pattern follows **Feature-Sliced Design (FSD)**: code is organised into **Layers** (top-level concerns), each Layer contains **Slices** (one folder per business unit), and Slices may contain **Segments** (named subfolders by purpose).

Names in this document are placeholders. `<module>`, `<widget>`, `<feature>`, `<entity>`, `<segment>` stand in for the resource being built — the skill describes the pattern, not specific names.

## When to use

Apply this skill to:
- Bootstrap a new Fastify project from zero (see `references/bootstrap.md`).
- Add a Slice to any Layer of an existing project (module, widget, feature, entity model, DTO, shared segment).
- Audit an existing project against the pattern (file layout, naming, layer dependency direction).

Skip this skill for one-line edits, bug fixes, and refactors *inside* an existing slice.

## Architecture

```
src/
├── server.ts                   # Entry — Fastify init, plugin registration, server start
│
├── config/                     # Application config (env, server, swagger, …)
│   ├── env.config.ts           # @t3-oss/env-core + Zod; exports envConfig
│   ├── server.config.ts        # FastifyServerOptions, cors, cookie, rate-limit, compress
│   ├── swagger.config.ts       # optional — OpenAPI / Swagger UI
│   └── index.ts
│
├── pkg/                        # External integrations (auth, cache, storage, …)
│   ├── auth/
│   │   ├── auth.plugin.ts      # Fastify plugin (fp) — decorates server.authenticate / server.authenticateAdmin
│   │   ├── auth.service.ts     # pure auth logic (session validation, token parsing)
│   │   ├── auth.interface.ts   # module augmentation — extends FastifyInstance + FastifyRequest
│   │   ├── auth.constant.ts    # optional — cookie names, header keys
│   │   └── index.ts
│   ├── cache/                  # optional — CDN cache helpers + Redis/memory client config
│   │   └── index.ts
│   ├── storage/                # optional — S3 / R2 / GCS object-storage client
│   │   └── index.ts
│   └── middleware/             # catch-all for generic Fastify hooks that don't deserve a dedicated folder
│       └── index.ts
│
└── app/
    ├── routes/                 # LAYER — API routing (registers modules onto the server)
    │   ├── server.routes.ts    # one aggregator; calls server.register(<module>Module, { prefix })
    │   └── index.ts
    ├── modules/                # LAYER — HTTP-facing business logic
    │   └── <module>/           # Slice
    │       ├── <module>.module.ts   # plain function (server: FastifyInstance) => void
    │       ├── <module>.service.ts  # object of (server, req, reply) handlers
    │       └── index.ts
    ├── widget/                 # LAYER — complex reusable behaviour (composes features/entities)
    │   └── <widget>/           # Slice
    │       ├── <widget>.service.ts
    │       ├── <widget>.interface.ts   # optional
    │       ├── <widget>.constant.ts    # optional
    │       └── index.ts
    ├── features/               # LAYER — single-purpose reusable capabilities
    │   └── <feature>/          # Slice
    │       ├── <feature>.service.ts   # or .block.ts for CMS block definitions
    │       ├── <feature>.interface.ts  # optional
    │       ├── <feature>.constant.ts   # optional
    │       └── index.ts
    ├── entities/               # LAYER — business entities (no layer-level barrel)
    │   ├── models/             # Segment — persistence definitions (engine-agnostic; rename to collections/ for CMS-only projects)
    │   │   ├── <entity>.collection.ts  # Payload CMS CollectionConfig
    │   │   ├── <entity>.table.ts       # Drizzle table schema
    │   │   ├── <entity>.model.ts       # generic ORM model fragment
    │   │   └── index.ts
    │   └── dto/                # Segment — Zod schemas + inferred types
    │       ├── common.dto.ts   # shared error response schemas (SBadRequestRes, SUnauthorizedRes, …)
    │       ├── <entity>.dto.ts
    │       └── index.ts
    └── shared/                 # LAYER — cross-layer reusable code
        ├── constant/           # Segment — global constants (*.constant.ts)
        ├── interface/          # Segment — global types (*.interface.ts)
        ├── middleware/         # Segment — Fastify preHandlers/hooks (*.middleware.ts)
        ├── service/            # Segment — shared services (*.service.ts)
        ├── hook/               # Segment — lifecycle or framework hooks (*.hook.ts)
        └── util/               # Segment — pure utilities (*.util.ts)
```

### Layer dependency rule

Imports may flow **only downward**:
```
routes → modules → widget → features → entities → shared
```
`pkg/` and `config/` are infra; any layer may import from them. Never import upward (entity must not import a feature; feature must not import a widget; module must not import another module).

### Folder discipline

Barrels (`index.ts`) live at **slice and segment level only** — the deepest folder that directly contains implementation files (`modules/<module>/`, `widget/<widget>/`, `features/<feature>/`, `entities/dto/`, `entities/models/`, `shared/interface/`, `shared/util/`, `pkg/<name>/`, `config/`, `routes/`). Layer-level folders (`modules/`, `widget/`, `features/`, `entities/`, `shared/`, `pkg/`) do **not** ship a barrel — they only group slices/segments and never re-export across them. Consumers import from the slice/segment folder, not from the layer. Folder names are **kebab-case**; the slice folder name matches the file prefix (`<module>/<module>.module.ts`).

## Hard rules

Five rules that hold across every server built with this skill. Each rule has a one-line statement here; the reference docs own the detail.

1. **Slice/segment barrels** — every slice and every segment ships an `index.ts`; consumers import from that folder. Layer-level folders do **not** carry a barrel.
2. **Layer dependency direction** — imports flow only downward (`routes → modules → widget → features → entities → shared`). `pkg/` and `config/` are infra and may be imported from any layer.
3. **`pkg/*` self-containment** — a `pkg/*` slot never imports from `app/*` or from another `pkg/*`. Each `pkg/*` folder must be liftable into another project as one folder. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.
4. **Route schema is mandatory** — every `server.route(...)` call must declare `schema.body`, `schema.params`, and/or `schema.response`. The `fastify-type-provider-zod` ZodTypeProvider wires validation automatically from these schemas. Never validate manually or skip the `schema` property.
5. **Generated types are read-only** — when using Payload CMS, `payload-types.ts` is produced by `yarn generate:types`. When using Drizzle introspection, the output file is generated by the toolchain. Hand-edits are overwritten on the next regeneration.

## Layer responsibilities

**`server.ts`** — creates the Fastify instance with ZodTypeProvider, registers all plugins from `pkg/` (auth, cors, cookie, compress, multipart, rate-limit, cache, swagger in dev), sets `validatorCompiler` and `serializerCompiler`, calls `serverRoutes(server)`, and starts listening. One file.

**`app/routes/server.routes.ts`** — calls `server.register(<module>Module, { prefix: routePrefixV1 })` for each module. Adds a health route and a `404` fallback. No business logic. The barrel exports `serverRoutes`.

**`app/modules/<module>/`** — a **module** is a self-contained business-logic domain. The slice owns the domain end-to-end: HTTP surface, service, any module-private constants/interfaces.

Inside the slice, `<module>.module.ts` is a plain function `(server: FastifyInstance) => void` — thin: call `server.route<{ Body: I..., Params: I..., Reply: I... }>(...)` per endpoint; declare `schema` with Zod schemas from DTO; set `preHandler: [server.authenticate]` for private routes; delegate to the service. `<module>.service.ts` holds domain logic; each method signature is `(server: FastifyInstance, req: FastifyRequest<{...}>, reply: FastifyReply<{...}>) => Promise<FastifyReply>`, returns `reply.code(n).send(...)`, and wraps work in `try/catch` returning `reply.code(500).send({ error: 'Internal Server Error' })` on failure. Modules don't import each other — shared logic lifts down into a feature, shared types into `shared/interface/`.

**`app/widget/<widget>/`** — composition of multiple features/entities behind one coordinator. Pure logic (a service, no Fastify routing). Receives whatever inputs the coordinator needs; has no dependency on `FastifyInstance` or `FastifyRequest` unless explicitly needed for logging.

**`app/features/<feature>/`** — single reusable capability. Pure logic. If a feature starts composing multiple other features, lift the composition up into a widget. May be a service or a CMS block definition (`.block.ts`) — see file naming table.

**`app/entities/models/`** — persistence definitions, engine-agnostic. Suffix indicates technology: `*.collection.ts` for Payload CMS `CollectionConfig`, `*.table.ts` for Drizzle table schemas, `*.model.ts` for generic ORM fragments. Mixed engines may coexist in one project.

**`app/entities/dto/`** — Zod schemas and inferred types. **Response schemas use the Fastify type-provider pattern**: a plain object mapping status codes to Zod schemas, e.g. `{ 200: SFooData, 400: SBadRequestRes, 500: SInternalErrorRes }`. This is not a Zod schema itself. Request body/params/querystring schemas are standard Zod schemas (`z.object(...)`). Common error shapes live in `common.dto.ts` and are re-exported from the dto barrel.

**`app/shared/`** — cross-cutting code organised by **Segment**: `constant/`, `interface/`, `middleware/` (project-specific Fastify hooks/preHandlers), `service/` (services not tied to a single slice — methods receive plain inputs and return `{ data?: T; error?: string }`, never `reply.send()`), `hook/`, `util/` (pure utilities, no Fastify dependency).

**`config/`** — `env.config.ts` (Zod over `process.env` via `@t3-oss/env-core`, exports `envConfig`), `server.config.ts` (FastifyServerOptions + cors/cookie/rate-limit/compress options), `swagger.config.ts` (optional), one file per concern, all re-exported from `index.ts`. Add further `<purpose>.config.ts` files only when a project actually needs them.

**`pkg/`** — external-system clients and framework-level utilities. Each subfolder is self-contained with its own `index.ts` and stays liftable as one folder. The skill ships one canonical slot: `pkg/auth/`. Further slots (`cache/`, `storage/`, `mailer/`, `queue/`, third-party API clients) are added per project. `pkg/middleware/` is the catch-all for generic Fastify hooks that do not justify a dedicated folder.

> Detailed decision trees and isolation rules at the Layer/Slice/Segment levels (which layer, new slice vs extend, which segment, what each may import) live in `references/structure.md`.

## Patterns

### Auth plugin

Auth guards are **Fastify decorators**, not middleware. `pkg/auth/auth.plugin.ts` wraps the plugin with `fastify-plugin` (`fp`) so decorators are visible across the whole server:

```ts
export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => { ... })
  fastify.decorate('authenticateAdmin', async (request, reply) => { ... })
})
```

`auth.interface.ts` extends Fastify types via module augmentation so TypeScript knows about the decorators:

```ts
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user?: I<User>
  }
}
```

Routes gate themselves with `preHandler: [server.authenticate]` — no separate middleware mount needed.

### Route schema (ZodTypeProvider)

Every route must declare its schema using Zod types from DTO. The provider wires validation and serialization automatically:

```ts
server.route<{ Body: ICreate<X>Body; Reply: ICreate<X>Res }>({
  method: 'POST',
  url: '/<x>',
  schema: {
    body: SCreate<X>Body,          // Zod schema — validated automatically
    response: SCreate<X>Res,       // { 200: SFooData, 400: SBadRequestRes, 500: SInternalErrorRes }
  },
  preHandler: [server.authenticate],
  handler: (req, reply) => <x>Service.create(server, req, reply),
})
```

### Caching

HTTP caching uses `Cache-Control` response headers (set in the service or a shared helper). If Redis is available, `fastify-cacheman` (or equivalent) provides in-process or distributed caching. CDN cache invalidation happens via tagged purge requests, not via `waitUntil`-style background tasks.

## File naming (suffix = role)

| Suffix | Role | Layer |
|---|---|---|
| `*.module.ts` | Fastify route registration for a domain | `modules/` |
| `*.service.ts` | Business logic | modules, widget, features, shared/service |
| `*.plugin.ts` | Fastify plugin (wrapped with `fp`) | `pkg/<name>/` |
| `*.collection.ts` | Payload CMS CollectionConfig | `entities/models/` |
| `*.table.ts` | Drizzle table schema | `entities/models/` |
| `*.model.ts` | Generic ORM model fragment | `entities/models/` |
| `*.block.ts` | CMS block definition (e.g. Payload Block) | `features/` |
| `*.dto.ts` | Zod schemas + inferred types | `entities/dto/` |
| `*.interface.ts` | TypeScript types / module augmentation | widget, features, shared/interface, pkg/auth |
| `*.constant.ts` | Static values, enums | widget, features, shared/constant |
| `*.tags.ts` | Cache tag constants (keyed by entity/operation) | `pkg/cache/` |
| `*.middleware.ts` | Fastify preHandler / hook | shared/middleware |
| `*.hook.ts` | Lifecycle or framework hooks | shared/hook |
| `*.util.ts` | Pure utility functions | `shared/util/` |
| `*.config.ts` | Configuration | `config/` |
| `*.routes.ts` | Route aggregator | `app/routes/` |

## Symbol naming

- **Zod schemas** in `*.dto.ts`: prefix `S<Name>` (`SCreate<X>Body`, `SUpdate<X>Body`, `S<X>Data`, `S<X>Res`).
- **Inferred types**: `I<Name> = z.infer<typeof S<Name>>`, exported next to the schema.
- **Response schema objects**: `S<X>Res = { 200: S<X>Data, 400: SBadRequestRes, ... }` — plain object, not a Zod schema. The matching `type I<X>Res = z.infer<typeof S<X>Data>` is inferred from the data schema, not the response map.
- **Enums**: `E<Name>`.
- **Plain constants** in `*.constant.ts`: `UPPER_SNAKE_CASE` for static values and dictionaries; helper functions in the same file stay `camelCase`.
- **List response**: `{ data: T[], meta: { total: number } }`.
- **Module export**: `<module>/index.ts` re-exports `export { <module>Module } from './<module>.module'`.
- **Service export**: `export const <name>Service = { ... }` — plain object literal of async methods.

## Mode A — Bootstrap a new server

Follow `references/bootstrap.md` step-by-step. It covers `package.json`, `tsconfig.json`, ESLint flat config, Prettier, `.gitignore`, `src/config/`, `src/pkg/`, `src/server.ts`, `src/app/routes/server.routes.ts`, the first module, and verification.

## Mode B — Add a Slice to an existing project

Pick the Layer the new code belongs to (top-down: routes → modules → widget → features → entities → shared). Pull complexity *down* the stack: when a module's logic is reused by another module, lift the shared part into a feature; when types appear in 3+ layers, lift them into `shared/interface/`.

### B1. New module
1. Create `src/app/modules/<module>/{<module>.module.ts, <module>.service.ts, index.ts}`.
2. Add Zod schemas in `src/app/entities/dto/<module>.dto.ts` using `S*` / `I*` naming. Re-export from the dto barrel.
3. If persistence is needed, add the corresponding file to `src/app/entities/models/` (suffix per engine).
4. Register in `src/app/routes/server.routes.ts`: `server.register(<module>Module, { prefix: routePrefixV1 })`.
5. Run `yarn format`.

### B2. New widget / feature
1. Create `src/app/widget/<widget>/` or `src/app/features/<feature>/` with `<name>.service.ts` (or `<name>.block.ts` for CMS blocks), optional `*.interface.ts`, `*.constant.ts`, and `index.ts`.
2. Compose from layers below (entities, shared). Do not call modules. Do not import another widget from a feature.

### B3. New entity (DTO and/or model)
1. DTO only: `src/app/entities/dto/<entity>.dto.ts`, re-export from barrel.
2. With persistence: pair with `<entity>.<engine>.ts` under `entities/models/`. For Payload CMS, run `yarn generate:types` after adding the collection to the CMS config.

### B4. New shared segment file
1. Pick the right segment (`constant/`, `interface/`, `middleware/`, `service/`, `hook/`, `util/`).
2. Use the matching suffix.
3. Re-export from the segment's `index.ts`.

### B5. New `pkg/` integration
1. New folder `src/pkg/<name>/` with `index.ts` and relevant files (`.plugin.ts`, `.service.ts`, `.interface.ts`, `.constant.ts`). For Fastify plugins, wrap with `fp` from `fastify-plugin`.
2. Read configuration from `envConfig`. Do not touch `process.env` directly.
3. **Pkg self-containment**: never import from `app/*` or from another `pkg/*`.

## Comments

Short label-style `//` comments sit above named symbols and expand on the identifier in 1–5 words. Routes use `// METHOD /path` shorthand. Methods inside a service get a single-verb label. Full convention, examples, and anti-patterns live in `references/comments.md`.

## Examples

Canonical file shapes for every layer live in `examples/`. The tree mirrors the canonical `src/` layout. Use the relevant subtree for incremental refactors of an existing project.

**Placeholder conventions:**
- **Identifiers** inside files use angle-bracket notation: `<module>`, `<entity>`, `<Module>`, `<Entity>`, `S<Module>Body`, `I<Module>Res`. Replace every `<…>` before saving in a real project.
- **File and folder names** with placeholders use double-underscore notation: `__module__/`, `__entity__.dto.ts`. Rename to the real slice name when copying.
- Files are **shape references, not runnable code** — angle-bracket identifiers are invalid TypeScript. The contract is structural: imports, layer dependencies, function signatures, return shapes, comment style.

## Self-verification

After adding or changing a slice, self-verify against `spec/`:
1. **`spec/invariants.spec.md`** — global structural invariants (barrels, import direction, routing boundary, `pkg` self-containment, route schema, service return shapes, generated types, env, naming, layer purity).
2. **`spec/per-action.spec.md`** — the block matching what you did (`+module`, `+widget/feature`, `+entity`, `+shared`, `+pkg`, `+route`, `bootstrap`).

Each spec item is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue). Confirm each before declaring work done.

## Common Mistakes

| Mistake | Reality |
|---|---|
| Adding `index.ts` at layer level (`modules/index.ts`) | Forbidden — barrels live at slice/segment level only. |
| Importing upward (feature → widget, entity → feature) | Imports flow only downward: `routes → modules → widget → features → entities → shared`. |
| Module importing another module | Modules don't import each other. Lift shared logic down into a feature. |
| `pkg/<name>` importing from `app/*` or another `pkg/<name>` | `pkg/*` must stay self-contained and liftable. Duplicate helpers if needed. |
| Missing `fp()` wrapper on auth plugin | Without `fastify-plugin`, decorators are scoped to the child context and invisible to the rest of the server. |
| Business logic in `*.module.ts` | Module files register routes and delegate — nothing else. Move all logic to `*.service.ts`. |
| Skipping `schema.response` on a route | The ZodTypeProvider won't serialize the response; TypeScript types are also lost. Always declare the response map. |
| Response schema as a Zod object | Response schemas are plain objects `{ 200: SFooData, ... }`, not `z.object(...)`. Using `z.object()` breaks the status-code mapping. |
| Hand-editing `payload-types.ts` | Generated by `yarn generate:types` — overwritten on next regeneration. |
| Reading `process.env` directly inside `pkg/*` or `app/*` | Read from `envConfig` only. |
| Folder naming with camelCase or `_` | All folders are `kebab-case`; slice folder name matches file prefix. |
| Using plural `widgets/` instead of `widget/` | The widget layer folder is singular: `app/widget/`. |

Full explanations of the *why* behind each rule live in `references/pitfalls.md`.

## Resources

This SKILL is the router: it decides which resource to open for the situation. The three resource sets are independent — they do **not** reference one another.

| Situation | Open |
|---|---|
| Deciding **where new code goes** (which layer / new slice vs extend / which segment / what it may import / when to lift up or down) | `references/structure.md` |
| Need a **file or slice template** to copy and rename | `examples/` |
| **Verifying** after a change — what file type belongs where, what each layer must/must not do | `spec/invariants.spec.md` + the matching block in `spec/per-action.spec.md` |
| Understanding **why** a rule exists / diagnosing a smell | `references/pitfalls.md` |
| **Fastify contract** specifics (ZodTypeProvider, auth plugin, route schema, cache, CMS types) | `references/fastify.md` |
| **Bootstrapping** a new project from zero | `references/bootstrap.md` |
| **Comment style** for any file | `references/comments.md` |

- **`references/structure.md`** — Layer/Slice/Segment decision trees + isolation rules.
- **`references/bootstrap.md`** — Mode A new-project scaffold (package.json, tsconfig, tooling, configs, server entry, first module).
- **`references/fastify.md`** — Fastify-specific contract: ZodTypeProvider setup, auth plugin decoration, route schema convention, cache pattern, Payload CMS type generation.
- **`references/comments.md`** — comment-style convention.
- **`references/pitfalls.md`** — common mistakes with explanations.
- **`spec/`** — declarative self-verification: `invariants.spec.md` (global invariants) + `per-action.spec.md` (checks per action).
- **`examples/`** — canonical file shapes per layer with `<…>` / `__…__` placeholders.
