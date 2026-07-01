# Structure: Layer / Slice / Segment decision guide

Three levels of granularity, top → bottom. Decide in order:

1. **Layer** — which top-level concern owns this code?
2. **Slice** — a new business unit inside that layer, or an existing one?
3. **Segment** — which named segment inside the slice (or `shared/` / `entities/`)?

Each level below gives a **decision tree** (where does it go?) and **isolation rules** (what it may/may not import, when to lift up or down). Placeholders only — `<entry>`, `<module>`, `<widget>`, `<feature>`, `<entity>`, `S<Name>`, `I<Name>`, `E<Name>`.

---

## Part A — Layer (which layer?)

Walk top → bottom; stop at the first match.

```
Is it a Worker target (Hono app, global middleware, error handlers,
DO re-exports, multi-protocol handlers fetch/queue/scheduled)?──────► app/<entry>.ts

Does it mount modules for one entry (app.route('/v1', <module>Module))?► app/routes/<entry>.routes.ts

Does it expose an HTTP surface for one business domain
(validate + delegate, owns the domain end-to-end)?─────────────────► app/modules

Is it pure logic composing several features/entities behind one
coordinator (no Hono routing, no DO class)?───────────────────────► app/widgets

Is it one single reusable capability (pure logic)?─────────────────► app/features

Is it a business entity?
├─ persistence definition (DO / table / collection / model)?───────► app/entities/models
└─ Zod request/response schema + inferred types?───────────────────► app/entities/dto

Is it cross-cutting code used by many slices?──────────────────────► app/shared/<segment>

Is it application configuration (env, server, swagger)?────────────► config/<purpose>.config.ts

Is it an external client / framework utility liftable as one folder
(auth, validator, cache, …)?───────────────────────────────────────► pkg/<name>
```

### `module` vs `widget` vs `feature` (the most common mix-up)

- Has an **HTTP surface** (Hono routes, validation, delegates to a service) → **module**.
- **Composes** several features/entities into reusable logic, no routing → **widget**.
- One narrow reusable capability (pure logic) → **feature**.

### Isolation rules per layer

Imports flow **only downward**: `routes → modules → widgets → features → entities → shared`. `config/` and `pkg/` are infra — any layer may import them.

| Layer | May import | Must NOT import | When to lift |
|---|---|---|---|
| `<entry>.ts` | routes, config, pkg, entities (DO re-export) | feature/module logic directly | logic in the entry → push into a route/module/widget |
| `routes` | modules (to mount), config/pkg | feature/widget/entity logic directly | business logic in the aggregator → push into a module |
| `modules` | widgets, features, entities, shared, config, pkg | another **module** | logic shared by 2 modules → down into a feature/widget; shared type → `shared/interfaces` |
| `widgets` | features, entities, shared, config, pkg | modules; routes | over-composed widget → split features out |
| `features` | entities, shared, config, pkg | widgets, modules; another feature | composition appearing inside → lift up to a widget |
| `entities/models` | shared, config, pkg | dto; features and above | — (persistence only) |
| `entities/dto` | shared, config | models; features and above | — (schemas only) |
| `shared` | config, pkg | entities and above | a `shared` symbol that needs a domain shape takes it as a param |
| `config` | pkg | app/* | — |
| `pkg/<name>` | itself only | `app/*`; another `pkg/*` | shared helper between two pkg slots → duplicate privately in each |

**Lift-down test:** a symbol needed by 3+ layers belongs in `shared/interfaces/` (cross-cutting) or `entities/` (domain/persistence shape). Logic reused by two siblings drops one layer down.

**Routing boundary:** only `modules` (and the `routes` aggregator + `<entry>.ts`) touch Hono routing. `widgets`/`features` are pure logic — they receive a `Context` or plain inputs, never `app.route(...)`.

**Durable Object boundary:** a DO class is a persistence shape → always `entities/models/<entity>.object.ts`, never in `widgets/`/`features/`. Cross-feature coordination lives in a **widget service** that picks the DO instance via the entity accessor.

---

## Part B — Slice (new slice, or extend an existing one?)

A **slice** is one folder per business unit inside a layer: `modules/<module>/`, `widgets/<widget>/`, `features/<feature>/`. (`entities/` and `shared/` are organised by segment; `routes/` is one aggregator per entry; `<entry>.ts` is a single file per worker target.)

```
Does a slice for this unit already exist?
├─ yes, same domain concern?──────────────────────────► add a file to it
├─ yes, but a distinct capability?────────────────────► new slice (and compose)
└─ no?────────────────────────────────────────────────► new slice

Is the code only used inside one slice?
└─ slice-private logic/types/constants?───────────────► <slice>/<slice>.{service,interface,constant}.ts

Is the module growing past thin validate+delegate?
└─ logic creeping into <module>.module.ts?────────────► move it to <module>.service.ts (module stays thin)

Need a new Worker target (cron, inbound receiver, …)?
└─ distinct fetch/queue/scheduled lifecycle?──────────► new app/<entry>.ts + matching app/routes/<entry>.routes.ts
```

### Isolation rules per slice

- **Barrel boundary** — consumers import a slice only through its `index.ts`. Never reach into a sibling slice's internal file.
- **Name match** — the slice folder name (kebab-case) equals the file prefix: `modules/<module>/<module>.module.ts`. The `widgets` layer folder is **plural**.
- **Module = thin shell** — `<module>.module.ts` only validates (project `zValidator`) and delegates; domain work lives in `<module>.service.ts`; mutations schedule cache invalidation via `ctx.executionCtx.waitUntil(...)`. Self-contained business logic stays inside the module; it does not leak into another module.
- **One export per slice** — `<slice>/index.ts` re-exports the slice's public symbol (`export { default as <module>Module }`; `export const <name>Service` for widget/feature).
- **No sibling imports** — a slice never imports another slice in the **same** layer (no module → module, feature → feature, widget → widget).
- **Entry/route pairing** — each `<entry>.ts` has exactly one matching `<entry>.routes.ts` aggregator.

---

## Part C — Segment (which segment inside `entities/` / `shared/` / `pkg/` / `config/`?)

A **segment** is a named subfolder grouping files by purpose.

### `entities/` segment

```
Persistence definition for one entity?
├─ Cloudflare Durable Object class?─────► entities/models/<entity>.object.ts
├─ Drizzle table schema?────────────────► entities/models/<entity>.table.ts
├─ Payload CMS collection?──────────────► entities/models/<entity>.collection.ts
└─ generic ORM fragment?────────────────► entities/models/<entity>.model.ts
Zod request/response schema + inferred type?► entities/dto/<entity>.dto.ts
```

### `shared/` segment

```
Is it a JSX/UI component?────────────────────────────► shared/components/
Does it call other services / hold reusable logic?───► shared/services/
Is it a project-specific Hono middleware?────────────► shared/middlewares/
Is it a pure utility (no Hono, input → output)?──────► shared/utils/
Is it a static value / enum / dictionary?────────────► shared/constants/
Is it a TypeScript type / interface?─────────────────► shared/interfaces/
```

### `pkg/` & `config/` segment

```
Public surface of an external integration (auth, validator, …)?► pkg/<name>/<name>.pkg.ts
Generic Hono middleware not worth its own slot?───────────────► pkg/middleware/
Env / server / swagger configuration?─────────────────────────► config/<purpose>.config.ts
```

### Isolation rules per segment

- **`util` is pure** — no Hono, no I/O, no service calls. Input → output only.
- **A util that calls a service** → `shared/services/`. **A constant that imports runtime code** is not a constant → split it.
- **`entities/models` hold persistence only**; `entities/dto` hold schemas/types only — they do not import each other.
- **Validation goes through `pkg/validator/`** (the `zValidator` wrapper standardising the `{ error: 'Bad Request', message }` 400 shape), never `@hono/zod-validator` directly.
- **Generated types are read-only** — `types-<entry>.d.ts` comes from `wrangler types` (`yarn cf-typegen`); never hand-edit.
- **Env-block mirroring** — any binding / DO / migration / var added to one `wrangler.<entry>.jsonc` env block is mirrored across **all** blocks (no inheritance).
- **Suffix == role** — every file carries its role suffix (`.module.ts`, `.service.ts`, `.object.ts`, `.table.ts`, `.collection.ts`, `.model.ts`, `.dto.ts`, `.interface.ts`, `.constant.ts`, `.middleware.ts`, `.util.ts`, `.config.ts`, `.pkg.ts`, `.routes.ts`).
- **Every segment ships `index.ts`** — but the layer folder above it never does.
