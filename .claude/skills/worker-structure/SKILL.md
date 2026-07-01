---
name: worker-structure
description: Use when scaffolding a new Cloudflare Workers + Hono project, bootstrapping from zero, adding a module/widget/feature/entity to an existing worker codebase, adding a shared util/middleware/service, registering a route, deciding where a new file should live, or auditing an existing worker against a Feature-Sliced Design (Layer/Slice/Segment) layout. Even if the user doesn't say "FSD" or "structure" explicitly — if they're placing new code in a Worker repo, use this skill. Skip for one-line edits, bug fixes, and refactors inside an existing slice.
---

# worker-structure

Provide the canonical architectural pattern for **Cloudflare Workers + Hono** services. The pattern follows **Feature-Sliced Design (FSD)**: code is organised into **Layers** (top-level concerns), each Layer contains **Slices** (one folder per business unit), and Slices may contain **Segments** (named subfolders by purpose).

Names in this document are placeholders. `<module>`, `<widget>`, `<feature>`, `<entity>`, `<segment>` stand in for the resource being built — the skill describes the pattern, not specific names.

## When to use

Apply this skill to:
- Bootstrap a new worker project from zero (see `references/bootstrap.md`).
- Add a Slice to any Layer of an existing project (module, widget, feature, entity model, DTO, shared segment).
- Audit an existing project against the pattern (file layout, naming, layer dependency direction).

Skip this skill for one-line edits, bug fixes, and refactors *inside* an existing slice.

## Architecture

```
src/
├── app/
│   ├── <entry>.ts                  # Entry — Hono app, global middleware, error handlers, DO re-exports.
│   │                               # One file per worker target (e.g. server.ts, api.ts, cron.ts);
│   │                               # `wrangler.<entry>.jsonc` `main` points at the chosen entry.
│   ├── routes/                     # LAYER — API routing (mounts modules)
│   │   ├── <entry>.routes.ts       # One aggregator per <entry>.ts; can be many.
│   │   └── index.ts
│   ├── modules/                    # LAYER — HTTP-facing business logic
│   │   └── <module>/               # Slice
│   │       ├── <module>.module.ts
│   │       ├── <module>.service.ts
│   │       └── index.ts
│   ├── widgets/                    # LAYER — complex reusable behaviour (composes features/entities)
│   │   └── <widget>/               # Slice
│   │       ├── <widget>.service.ts
│   │       ├── <widget>.interface.ts   # optional
│   │       ├── <widget>.constant.ts    # optional
│   │       └── index.ts
│   ├── features/                   # LAYER — single-purpose reusable capabilities
│   │   └── <feature>/              # Slice
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.interface.ts  # optional
│   │       ├── <feature>.constant.ts   # optional
│   │       └── index.ts
│   ├── entities/                   # LAYER — business entities (no layer-level barrel)
│   │   ├── models/                 # Segment — persistence definitions (engine-agnostic)
│   │   │   ├── <entity>.object.ts        # Cloudflare Durable Object
│   │   │   ├── <entity>.table.ts         # Drizzle schema
│   │   │   ├── <entity>.collection.ts    # Payload CMS
│   │   │   ├── <entity>.model.ts         # ORM model fragment
│   │   │   └── index.ts
│   │   └── dto/                    # Segment — Zod request/response schemas + inferred types
│   │       ├── <entity>.dto.ts
│   │       └── index.ts
│   └── shared/                     # LAYER — cross-layer reusable code
│       ├── components/             # Segment — JSX/UI components
│       ├── constants/              # Segment — global constants (*.constant.ts)
│       ├── interfaces/             # Segment — global types (*.interface.ts)
│       ├── middlewares/            # Segment — Hono middleware (*.middleware.ts)
│       ├── services/               # Segment — shared services (*.service.ts)
│       └── utils/                  # Segment — pure utilities (*.util.ts)
├── config/                         # Application config (env, server, swagger, …)
└── pkg/                            # External integrations (auth, cache, validator, …)
```

### Layer dependency rule

Imports may flow **only downward**:
```
routes → modules → widgets → features → entities → shared
```
`pkg/` and `config/` are infra; any layer may import from them. Never import upward (entity must not import a feature; feature must not import a widget; module must not import another module).

### Folder discipline

Barrels (`index.ts`) live at **slice and segment level only** — the deepest folder that directly contains implementation files (`modules/<module>/`, `widgets/<widget>/`, `features/<feature>/`, `entities/dto/`, `entities/models/`, `shared/interfaces/`, `shared/utils/`, `pkg/<name>/`, `config/`, `routes/`). Layer-level folders (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`) do **not** ship a barrel — they only group slices/segments and never re-export across them. Consumers import from the slice/segment folder, not from the layer. Folder names are **kebab-case**; the slice folder name matches the file prefix (`<module>/<module>.module.ts`).

## Hard rules

Five rules that hold across every worker built with this skill. Each rule has a one-line statement here; the reference docs own the detail.

1. **Slice/segment barrels** — every slice and every segment ships an `index.ts`; consumers import from that folder. Layer-level folders (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`) do **not** carry a barrel.
2. **Layer dependency direction** — imports flow only downward (`routes → modules → widgets → features → entities → shared`). `pkg/` and `config/` are infra and may be imported from any layer.
3. **`pkg/*` self-containment** — a `pkg/*` slot never imports from `app/*` or from another `pkg/*`. Each `pkg/*` folder must be liftable into another project as one folder. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.
4. **Env-block mirroring** — when adding a binding / DO / migration / queue / var, mirror it across **all** Wrangler env blocks (no inheritance). Source: `references/cloudflare.md`.
5. **Generated types are read-only** — `types-<entry>.d.ts` is produced by `wrangler types` (alias `yarn cf-typegen`). Hand edits are overwritten on the next regeneration.

## Layer responsibilities

**`app/<entry>.ts`** — one file per worker target. A project may ship several entries (e.g. `server.ts` for the public API, `cron.ts` for scheduled jobs, `inbound.ts` for an integration receiver); each becomes a separate Cloudflare Worker by pointing `wrangler.<entry>.jsonc` `main` at it. Each entry instantiates `new Hono<{ Bindings: Cloudflare<Entry>Bindings }>()` against its own per-entry bindings interface, applies global middleware from `config/server.config.ts` (or its own config slice), mounts the public health route, hands off to its matching `app/routes/<entry>.routes.ts`, wires `notFound` and `onError`, re-exports every Durable Object class it owns, and default-exports the app.

An entry may export more than `fetch` — `queue`, `scheduled`, `email`, `tail` are all first-class on `ExportedHandler`. Each non-`fetch` handler is a thin dispatcher that delegates to a widget or feature; the entry itself stays a router. Generic shape:

```ts
export default {
  fetch: app.fetch,
  queue: <widget>Service.consumeBatch,
  scheduled: <widget>Service.runScheduled,
} satisfies ExportedHandler<Cloudflare<Entry>Bindings>
```

**`app/routes/`** — one aggregator per `<entry>.ts`, named `<entry>.routes.ts`. Each aggregator imports the modules that entry exposes and mounts them (`app.route('/v1', <module>Module)`); for many modules in one project, mount them all in the matching aggregator. Auth-gated traffic goes under `/v1/*` (or another prefix) so the auth middleware covers it. No business logic. The barrel exports each aggregator by name.

**`app/modules/<module>/`** — a **module** is a self-contained business-logic domain (the slice as a whole), not just a Hono sub-app. The slice owns the domain end-to-end: HTTP surface, service, any module-private constants/interfaces. Inside the slice, `<module>.module.ts` is the **HTTP entry** of that domain — thin: validate with the project's `zValidator`, delegate to the service, schedule cache invalidation via `ctx.executionCtx.waitUntil(...)` on mutations. `<module>.service.ts` holds the domain logic; reads params/body via `ctx.req.param(...)` / `ctx.req.json()`; wraps work in `try/catch` returning `{ error, message }` 500 on failure. Modules don't import each other — shared logic lifts down into a feature, shared types into `shared/interfaces/`.

**`app/widgets/<widget>/`** — composition of multiple features/entities behind one coordinator. Pure logic (a service, no Hono routing, no DO class — DO classes live in `entities/models/` and the widget service composes feature calls around them via the entity accessor).

**`app/features/<feature>/`** — single reusable capability. Pure logic. If composition of multiple features starts to appear inside a feature, lift the composition up into a widget.

**`app/entities/models/`** — persistence definitions, **engine-agnostic**. Suffix indicates the technology: `*.object.ts` for Cloudflare DO classes, `*.table.ts` for Drizzle, `*.collection.ts` for Payload CMS, `*.model.ts` for generic ORM fragments, `*.generated.ts` for DB-introspection output. Mixed engines may coexist in one project. Cloudflare-specific lifecycle rules live in `references/cloudflare.md`.

**`app/entities/dto/`** — Zod schemas and inferred types for the entity's request/response surface. One `<entity>.dto.ts` per entity.

**`app/shared/`** — cross-cutting code organised by **Segment**: `components/` (JSX), `constants/`, `interfaces/`, `middlewares/` (project-specific Hono middleware), `services/` (services not tied to a single slice), `utils/` (pure utilities, no Hono dependency).

**`config/`** — `env.config.ts` (Zod over `process.env` via `@t3-oss/env-core`, exports `envConfig`), `server.config.ts` (cors/timeout/rate-limit/logger), `swagger.config.ts` (OpenAPI), one file per concern, all re-exported from `index.ts`. Add further `<purpose>.config.ts` files only when a project actually needs them.

**`pkg/`** — external-system clients and framework-level utilities. Each subfolder is self-contained with its own `index.ts` and stays liftable as one folder. Each integration earns its own slot when it has a distinct concern; `pkg/middleware/` is the catch-all for generic Hono middleware that does not justify a dedicated folder. The skill ships two reference slots: `pkg/auth/` and `pkg/validator/` (the `zValidator` wrapper that standardises the `{ error: 'Bad Request', message }` 400 shape — kept separate from middleware because it is a validation utility, not a middleware). All other slots (cache, queue producer, retry helper, observability transport, third-party API client, …) are added per project as the worker needs them.

> Detailed decision trees and isolation rules at the Layer/Slice/Segment levels (which layer, new slice vs extend, which segment, what each may import) live in `references/structure.md`.

## Patterns

Optional building blocks any worker may pick up. Each pattern is generic; details live in the cross-linked reference doc or on the relevant layer description above.

### Multi-protocol entry exports

A Worker entry may export more than `fetch` — `queue`, `scheduled`, `email`, `tail` are all first-class on `ExportedHandler`. Each non-`fetch` handler is a thin dispatcher into the matching widget/feature; the entry stays a router. The exact shape lives in `app/<entry>.ts` responsibilities above. None of these handlers are required — pick the ones a given worker needs.

### Durable Object placement

DO classes **always** live in `app/entities/models/<entity>.object.ts` — a DO is a persistence shape, owned by the entities layer. When per-key coordination across multiple features is needed, the **widget service** picks the right DO instance via the entity accessor and composes feature calls around it; the DO itself stays in `entities/models/`. Lifecycle, env mirroring and `cf-typegen` rules live in `references/cloudflare.md`.

## File naming (suffix = role)

| Suffix | Role | Layer |
|---|---|---|
| `*.module.ts` | HTTP entry of a domain module | `modules/` |
| `*.service.ts` | Business logic | modules, widgets, features, shared/services |
| `*.object.ts` | Cloudflare Durable Object class | `entities/models/` |
| `*.table.ts` | Drizzle table schema | `entities/models/` |
| `*.collection.ts` | Payload CMS collection | `entities/models/` |
| `*.model.ts` | ORM model fragment | `entities/models/` |
| `*.dto.ts` | Zod schemas + inferred types | `entities/dto/` |
| `*.interface.ts` | TypeScript types | widgets, features, shared/interfaces |
| `*.constant.ts` | Static values, enums | widgets, features, shared/constants |
| `*.middleware.ts` | Hono middleware | shared/middlewares, pkg/middleware |
| `*.util.ts` | Pure utility functions | shared/utils |
| `*.config.ts` | Configuration | `config/` |
| `*.pkg.ts` | Public surface of a `pkg/` folder | `pkg/<name>/` |
| `*.routes.ts` | Aggregated route registration | `app/routes/` |

## Symbol naming

- **Zod schemas** in `*.dto.ts`: prefix `S<Name>` (`SCreate<X>Req`, `SUpdate<X>Req`, `S<X>Res`, `S<Xs>Res` for list).
- **Inferred types**: `I<Name> = z.infer<typeof S<Name>>`, exported next to the schema.
- **Enums**: `E<Name>`.
- **Plain constants** in `*.constant.ts`: `UPPER_SNAKE_CASE` for static values and dictionaries (`<NAME_SET>`, `<DEFAULT_LIMITS>`); helper functions in the same file stay `camelCase`.
- **List response**: `{ data: T[], meta: { total: number } }`.
- **Module export**: `<module>/index.ts` re-exports `export { default as <module>Module } from './<module>.module'`.
- **Service export**: `export const <name>Service = { ... }` — plain object literal of async methods, each `(ctx: Context) => ctx.json(...)`.

## Mode A — Bootstrap a new worker

Follow `references/bootstrap.md` step-by-step. It covers `package.json`, `wrangler.<entry>.jsonc` (four env blocks with no inheritance), `tsconfig.json`, ESLint flat config, Prettier, `.gitignore`, `src/config/`, `src/pkg/`, the first `src/app/<entry>.ts`, the matching `src/app/routes/<entry>.routes.ts`, the first module, `yarn cf-typegen`, and verification.

## Mode B — Add a Slice to an existing project

Pick the Layer the new code belongs to (top-down: routes → modules → widgets → features → entities → shared). Pull complexity *down* the stack: when a module's logic is reused by another module, lift the shared part into a feature; when types appear in 3+ layers, lift them into `shared/interfaces/`.

### B1. New module
1. Create `src/app/modules/<module>/{<module>.module.ts, <module>.service.ts, index.ts}`. Re-export `<module>Module` from `index.ts`.
2. Add Zod schemas in `src/app/entities/dto/<module>.dto.ts` using `S*` / `I*` naming. Re-export from the dto barrel.
3. If persistence is needed, add the corresponding file to `src/app/entities/models/` (suffix per engine; see `references/cloudflare.md` for DO-specific lifecycle).
4. Mount in the matching `src/app/routes/<entry>.routes.ts` (the aggregator that belongs to the worker entry serving this module) via `app.route('/v1', <module>Module)`.
5. Caching: pick a `cacheName` scheme; add `waitUntil(...)` invalidation on every mutation. Detail in `references/cloudflare.md`.
6. Run `yarn format`.

### B2. New widget / feature
1. Create `src/app/widgets/<widget>/` or `src/app/features/<feature>/` with `<name>.service.ts`, optional `*.interface.ts`, `*.constant.ts`, and `index.ts`.
2. Compose from layers below (entities, shared). Do not call modules. Do not import another widget from a feature.

### B3. New entity (DTO and/or model)
1. DTO only: `src/app/entities/dto/<entity>.dto.ts`, re-export.
2. With persistence: pair with `<entity>.<engine>.ts` under `entities/models/`. For DO, follow `references/cloudflare.md` (re-export from the relevant `src/app/<entry>.ts`, mirror across env blocks, regenerate types).

### B4. New shared segment file
1. Pick the right segment (`constants/`, `interfaces/`, `middlewares/`, `services/`, `utils/`, `components/`).
2. Use the matching suffix (`*.constant.ts`, `*.interface.ts`, `*.middleware.ts`, `*.service.ts`, `*.util.ts`).
3. Re-export from the segment's `index.ts`.

### B5. New `pkg/` integration
1. New folder `src/pkg/<name>/` with `index.ts` and `<name>.pkg.ts`. For larger integrations split into `service`, `plugin`, `constants` files (e.g. `pkg/auth/`).
2. Read configuration from `envConfig`. Do not touch `process.env` directly.
3. **Pkg self-containment**: never import from `app/*` or from another `pkg/*`. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.


## Comments

Short label-style `//` comments sit above named symbols and expand on the identifier in 1–5 words. Routes use `// VERB /path` shorthand. Methods inside a service/class get a single-verb label. Full convention, examples, and anti-patterns live in `references/comments.md`.

## Examples

Canonical file shapes for every layer live in `examples/`. The tree mirrors the canonical `src/` layout, so `cp -r examples/* <project>/src/` (with placeholder substitution) yields a working skeleton for a new project. Use the relevant subtree for incremental refactors of an existing project.

**Placeholder conventions:**
- **Identifiers** inside files use angle-bracket notation: `<entry>`, `<module>`, `<entity>`, `<Module>`, `<Entity>`, `S<Module>Req`, `I<Module>Res`, `E<Entity>Table`, `<DOClass>`, `<BINDING>`, `Cloudflare<Entry>Bindings`. Replace every `<…>` before saving in a real project.
- **Per-entry bindings interface.** Each `<entry>.ts` ships its own `Cloudflare<Entry>Bindings` type generated by `wrangler types --env-interface Cloudflare<Entry>Bindings` (one invocation per entry; multiple worker entries get distinct interfaces — `CloudflareServerBindings`, `CloudflareCronBindings`, etc.). Sub-apps that mount onto an entry parameterise their `Hono<{ Bindings: Cloudflare<Entry>Bindings }>` with the matching name.
- **File and folder names** with placeholders use double-underscore notation: `__entry__.ts`, `__entry__.routes.ts`, `__module__/`, `__entity__/`. Rename to the real entry/slice name when copying.
- Files are **shape references, not runnable code** — angle-bracket identifiers are invalid TypeScript. The contract is structural: imports, layer dependencies, function signatures, return shapes, comment style.

**Multiplicity:**
The example tree shows **one** of each placeholder file. Real projects will have many: a project may ship multiple worker entries (`server.ts`, `cron.ts`, `inbound.ts`), each with its own `<entry>.routes.ts` aggregator under `app/routes/`; many `<module>/` folders under `app/modules/`; many `<widget>/` and `<feature>/` slices; many entities under `app/entities/dto/` and `app/entities/models/`. Treat each example as the *template for one*, then duplicate per concrete name.

## Self-verification

After adding or changing a slice, self-verify against `spec/`:
1. **`spec/invariants.spec.md`** — global structural invariants (barrels, import direction, routing boundary, DO placement, `pkg` self-containment, service shapes + `waitUntil`, Wrangler env mirroring, generated types, env, naming, layer purity).
2. **`spec/per-action.spec.md`** — the block matching what you did (`+module`, `+widget/feature`, `+entity`, `+shared`, `+pkg`, `+entry/route`, `bootstrap`).

Each spec item is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue). Confirm each before declaring work done.

## Common Mistakes

| Mistake | Reality |
|---|---|
| Adding `index.ts` at layer level (`modules/index.ts`) | Forbidden — barrels live at slice/segment level only. |
| Importing upward (feature → widget, entity → feature) | Imports flow only downward: `routes → modules → widgets → features → entities → shared`. |
| Module importing another module | Modules don't import each other. Lift shared logic down into a feature. |
| `pkg/<name>` importing from `app/*` or another `pkg/<name>` | `pkg/*` must stay self-contained and liftable. Duplicate helpers if needed. |
| Hand-editing `types-<entry>.d.ts` | Generated by `wrangler types` — overwritten on next regeneration. |
| Adding a binding to one Wrangler env block only | Mirror across **all** env blocks (no inheritance in Wrangler). |
| DO class living outside `entities/models/` | DO is persistence shape — always under `entities/models/<entity>.object.ts`. |
| Reading `process.env` directly inside `pkg/*` | Read from `envConfig` only. |
| Folder naming with camelCase or `_` | All folders are `kebab-case`; slice folder name matches file prefix. |
| Skipping `waitUntil(...)` cache invalidation on mutations | Every mutation must schedule cache invalidation, otherwise reads serve stale data. |

Full explanations of the *why* behind each rule live in `references/pitfalls.md`.

## Resources

This SKILL is the router: it decides which resource to open for the situation. The three resource sets are independent — they do **not** reference one another.

| Situation | Open |
|---|---|
| Deciding **where new code goes** (which layer / new slice vs extend / which segment / what it may import / when to lift up or down) | `references/structure.md` |
| Need a **file or slice template** to copy and rename | `examples/` |
| **Verifying** after a change — what file type belongs where, what each layer must/must not do | `spec/invariants.spec.md` + the matching block in `spec/per-action.spec.md` |
| Understanding **why** a rule exists / diagnosing a smell | `references/pitfalls.md` |
| **Cloudflare contract** specifics (DO lifecycle, env-block mirroring, caching + `waitUntil`, validator wrapper) | `references/cloudflare.md` |
| **Bootstrapping** a new project from zero | `references/bootstrap.md` |
| **Comment style** for any file | `references/comments.md` |

- **`references/structure.md`** — Layer/Slice/Segment decision trees + isolation rules.
- **`references/bootstrap.md`** — Mode A new-project scaffold (package.json, per-entry `wrangler.<entry>.jsonc`, tsconfig, tooling, configs, server entry).
- **`references/cloudflare.md`** — Cloudflare-specific contract: Durable Object lifecycle, env-block mirroring, per-route caching with `waitUntil` invalidation, validator wrapper requirements.
- **`references/comments.md`** — comment-style convention.
- **`references/pitfalls.md`** — common mistakes with explanations.
- **`spec/`** — declarative self-verification: `invariants.spec.md` (global invariants) + `per-action.spec.md` (checks per action).
- **`examples/`** — canonical file shapes per layer with `<…>` / `__…__` placeholders.
