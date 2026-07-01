# Structure: Layer / Slice / Segment decision guide

Three levels of granularity, top → bottom. Decide in order:

1. **Layer** — which top-level concern owns this code?
2. **Slice** — a new business unit inside that layer, or an existing one?
3. **Segment** — which named bucket inside the slice (or `shared/` / `entities/`)?

Each level below gives a **decision tree** (where does it go?) and **isolation rules** (what it may/may not import, when to lift up or down). Placeholders only — `<module>`, `<widget>`, `<feature>`, `<entity>`, `S<Name>`, `I<Name>`, `E<Name>`.

---

## Part A — Layer (which layer?)

Walk top → bottom; stop at the first match.

```
Does it register routes onto the Fastify server?
└─ one aggregator calling server.register(<module>Module)?► app/routes

Does it expose an HTTP surface for one business domain
(routes + handlers, owns the domain end-to-end)?─────────► app/modules

Is it pure logic that composes several features/entities
behind one coordinator (no Fastify routing)?────────────► app/widget

Is it one single reusable capability (pure logic),
or a CMS block definition?───────────────────────────────► app/features

Is it a business entity?
├─ persistence definition (collection/table/model)?─────► app/entities/models
└─ Zod schema + inferred types (request/response DTO)?──► app/entities/dto

Is it cross-cutting code used by many slices?────────────► app/shared/<segment>

Is it application configuration (env, server opts, swagger)?► config/<purpose>.config.ts

Is it an external-system client / Fastify plugin that must
stay liftable as one folder (auth, cache, storage, …)?───► pkg/<name>
```

### `module` vs `widget` vs `feature` (the most common mix-up)

- Has an **HTTP surface** (routes, schema, auth guard, delegates to a service) → **module**.
- **Composes** several features/entities into reusable logic, no routing → **widget**.
- One narrow reusable capability (pure logic), or a CMS `*.block.ts` → **feature**.

### Isolation rules per layer

Imports flow **only downward**: `routes → modules → widget → features → entities → shared`. `config/` and `pkg/` are infra — any layer may import them.

| Layer | May import | Must NOT import | When to lift |
|---|---|---|---|
| `routes` | modules (to register), config/pkg | feature/widget/entity logic directly | business logic in the aggregator → push into a module |
| `modules` | widget, features, entities, shared, config, pkg | another **module** | logic shared by 2 modules → down into a feature/widget; shared type → `shared/interface` |
| `widget` | features, entities, shared, config, pkg | modules; routes; `FastifyInstance`/`FastifyRequest` unless for logging | over-composed widget → split features out |
| `features` | entities, shared, config, pkg | widget, modules; another feature | composition appearing inside → lift up to a widget |
| `entities/models` | shared, config, pkg | dto; features and above | — (persistence only) |
| `entities/dto` | shared, config | models; features and above | — (schemas only) |
| `shared` | config, pkg | entities and above | a `shared` symbol that needs a domain shape takes it as a param |
| `config` | pkg | app/* | — |
| `pkg/<name>` | itself only | `app/*`; another `pkg/*` | shared helper between two pkg slots → duplicate privately in each |

**Lift-down test:** a symbol needed by 3+ layers belongs in `shared/interface/` (cross-cutting) or `entities/` (domain/persistence shape). Logic reused by two siblings drops one layer down.

**Routing boundary:** only `modules` (and the `routes` aggregator) touch Fastify routing. `widget`/`features` are pure logic — they receive plain inputs, never `server.route(...)`.

---

## Part B — Slice (new slice, or extend an existing one?)

A **slice** is one folder per business unit inside a layer: `modules/<module>/`, `widget/<widget>/`, `features/<feature>/`. (`entities/` and `shared/` are organised by segment, not per-unit slice folders; `routes/` is a single aggregator.)

```
Does a slice for this unit already exist?
├─ yes, same domain concern?──────────────────────────► add a file to it
├─ yes, but a distinct capability?────────────────────► new slice (and compose)
└─ no?────────────────────────────────────────────────► new slice

Is the code only used inside one slice?
└─ slice-private logic/types/constants?───────────────► <slice>/<slice>.{service,interface,constant}.ts

Is the module growing past thin routing?
└─ logic creeping into <module>.module.ts?────────────► move it to <module>.service.ts (module stays thin)
```

### Isolation rules per slice

- **Barrel boundary** — consumers import a slice only through its `index.ts`. Never reach into a sibling slice's internal file.
- **Name match** — the slice folder name (kebab-case) equals the file prefix: `modules/<module>/<module>.module.ts`, not a different prefix or camelCase. The `widget` layer folder is **singular** (`app/widget/`).
- **Module = thin shell** — `<module>.module.ts` only declares routes (`schema`, `preHandler`) and delegates; all domain work lives in `<module>.service.ts`. Self-contained business logic stays inside the module; it does not leak into another module.
- **One export per slice** — `<slice>/index.ts` re-exports the slice's public symbol (`export { <module>Module } from './<module>.module'`; `export const <name>Service` for widget/feature).
- **No sibling imports** — a slice never imports another slice in the **same** layer (no module → module, feature → feature, widget → widget).

---

## Part C — Segment (which bucket inside `entities/` / `shared/` / a slice?)

A **segment** is a named subfolder grouping files by purpose.

### `entities/` segment

```
Persistence definition for one entity?
├─ Payload CMS CollectionConfig?────────► entities/models/<entity>.collection.ts
├─ Drizzle table schema?────────────────► entities/models/<entity>.table.ts
└─ generic ORM fragment?────────────────► entities/models/<entity>.model.ts
Zod schema + inferred type (request/response)?► entities/dto/<entity>.dto.ts
Shared error/response shapes?───────────► entities/dto/common.dto.ts
```
> `models/` is engine-agnostic; a CMS-only project may name it `collections/`.

### `shared/` segment

```
Does it call other services / hold reusable domain logic?► shared/service/  (returns { data?, error? }, never reply.send)
Is it a Fastify preHandler / hook tied to this project?──► shared/middleware/
Is it a lifecycle / framework hook?──────────────────────► shared/hook/
Is it a pure utility (no Fastify, input → output)?───────► shared/util/
Is it a static value / enum / dictionary?────────────────► shared/constant/
Is it a TypeScript type / interface?─────────────────────► shared/interface/
```

### `pkg/` & `config/` segment

```
Fastify plugin decorating the server (auth, etc.)?──────► pkg/<name>/<name>.plugin.ts  (wrap with fp)
Module augmentation (declare module 'fastify')?─────────► pkg/<name>/<name>.interface.ts
Pure client logic for the integration?──────────────────► pkg/<name>/<name>.service.ts
Env / server / swagger configuration?───────────────────► config/<purpose>.config.ts
```

### Isolation rules per segment

- **`util` is pure** — no Fastify, no I/O, no service calls. Input → output only.
- **A util that calls a service** → `shared/service/`. **A constant that imports runtime code** is not a constant → split it.
- **`shared/service/` returns `{ data?, error? }`** (plain inputs in, value out) — it never receives `reply` or calls `reply.send()`. That `(server, req, reply) => reply.code(n).send(...)` shape is for **module** services only.
- **`entities/models` hold persistence only**; `entities/dto` hold schemas/types only — they do not import each other.
- **DTO response schemas are plain status maps** — `{ 200: S<X>Data, 400: SBadRequestRes }`, never `z.object(...)`. Request body/params are standard Zod schemas.
- **`pkg` plugins that decorate the server wrap with `fp`** (`fastify-plugin`), else decorators are invisible to the rest of the server.
- **Suffix == role** — every file carries its role suffix (`.module.ts`, `.service.ts`, `.plugin.ts`, `.collection.ts`, `.table.ts`, `.model.ts`, `.block.ts`, `.dto.ts`, `.interface.ts`, `.constant.ts`, `.middleware.ts`, `.hook.ts`, `.util.ts`, `.config.ts`, `.routes.ts`).
- **Every segment ships `index.ts`** — but the layer folder above it never does.
