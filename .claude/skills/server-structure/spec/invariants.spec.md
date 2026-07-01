# Spec: global invariants

Declarative structural rules that hold for **every** Fastify server built with this skill. After any change, self-verify against this list. Each rule is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue) — no script to run, the model reads and confirms.

## Barrels

- **MUST** ship an `index.ts` at every slice and segment folder.
  Check: each new `<slice>/` or `<segment>/` folder has `index.ts`.
- **MUST NOT** place a barrel at layer level (`modules/`, `widget/`, `features/`, `entities/`, `shared/`, `pkg/`).
  Check: `ls src/app/modules/index.ts` (and siblings) → does not exist.

## Import direction

- **MUST** import only downward: `routes → modules → widget → features → entities → shared`.
- **MUST NOT** import upward or sideways within a layer (module→module, feature→feature, widget→widget).
  Check: `grep -R "from '@/app/modules/'" src/app/modules/` returns nothing.

## Routing boundary

- **MUST** keep Fastify routing in `modules` (and the `routes` aggregator) only.
- **MUST NOT** call `server.route(...)` / `server.register(...)` inside `widget`, `features`, `entities`, or `shared`.
  Check: `grep -R "server.route\|server.register" src/app/{widget,features,entities,shared}` returns nothing.

## `pkg/` self-containment

- **MUST NOT** let a `pkg/*` slot import from `app/*` or from another `pkg/*`.
  Check: `grep -R "from '@/app/" src/pkg/` and `grep -R "from '@/pkg/<other>" src/pkg/<name>/` return nothing.
- **MUST** wrap a `pkg` plugin that decorates the server with `fp` from `fastify-plugin`.
  Check: every `*.plugin.ts` that calls `fastify.decorate(...)` is exported via `fp(...)`.

## Route schema (ZodTypeProvider)

- **MUST** declare `schema` on every route — `body`/`params`/`querystring` as Zod schemas and `response` as a status-code map.
- **MUST NOT** write the response schema as `z.object(...)`; it is a plain `{ [statusCode]: ZodSchema }` map.
  Check: each `server.route` has a `schema:`; `response:` is `{ 200: S…, 400: S… }`, not `z.object`.

## Service return shapes

- **MUST** return `reply.code(n).send(...)` on every path of a **module** service, including `reply.code(500).send({ error })` in `catch`.
- **MUST** return `{ data?, error? }` (no `reply`) from a **`shared/service`** method.
  Check: module `*.service.ts` methods take `(server, req, reply)`; `shared/service/*.service.ts` methods take plain inputs.

## Generated types

- **MUST NOT** hand-edit generated type files (`payload-types.ts`, Drizzle introspection output).
  Check: no manual diffs in generated files; regenerate via `yarn generate:types`.

## Environment access

- **MUST** read env only through `envConfig` from `config/env.config.ts`.
- **MUST NOT** read `process.env` outside `config/env.config.ts`.
  Check: `grep -R "process.env" src --include=*.ts | grep -v "config/env.config.ts"` returns nothing.

## File & folder naming

- **MUST** carry the role suffix on every implementation file (`.module.ts`, `.service.ts`, `.plugin.ts`, `.collection.ts`, `.table.ts`, `.model.ts`, `.block.ts`, `.dto.ts`, `.interface.ts`, `.constant.ts`, `.middleware.ts`, `.hook.ts`, `.util.ts`, `.config.ts`, `.routes.ts`).
- **MUST** use kebab-case folders; the slice folder name equals the file prefix.
- **MUST** name the widget layer folder `app/widget/` (singular).
  Check: `ls src/app/widgets` → does not exist.

## Layer purity

- **MUST** keep `shared/util/*.util.ts` pure (no Fastify, no I/O, no service calls).
- **MUST** keep `entities/models` and `entities/dto` from importing each other.
