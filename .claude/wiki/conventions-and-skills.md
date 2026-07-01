# Conventions And Skills

**What it is.** The governance layer of this repo. The committed source of truth for *how code is structured* is not `src/` — it is the set of Claude skills under `.claude/skills/` plus the `agent-skill-architect` agent (with the root `README.md` describing the three apps at a high level). These skills encode one shared architecture pattern — **Feature-Sliced Design (FSD)**: **Layer → Slice → Segment** — across three stacks, plus naming rules, a git workflow, and the meta-rules for authoring skills. They are invoked as slash-commands (`/worker-structure`, etc.) when placing or auditing code. (The root `CLAUDE.md` is a separate, stack-agnostic file — see "Where it lives" below.)

These skills are a governing/aspirational spec for the repo as a template — whether real code in `src/` matches them at any moment is not guaranteed here. (See [[architecture]] for how the layout maps onto a running app.)

## Where it lives

- `.claude/CLAUDE.md` — project root instructions. **Stack-agnostic generic engineering guidelines only** (Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution, Verify Before Claiming Done, plus a "Red Flags" table). It carries **no** project-specific architecture, command list, or hard rules — those live in the structure skills below.
- `.claude/skills/worker-structure/` — FSD for **Cloudflare Workers + Hono**.
- `.claude/skills/server-structure/` — FSD for **Fastify 5 + Zod**.
- `.claude/skills/client-structure/` — FSD for **Next.js App Router + React**.
- `.claude/skills/git-workflow/` — commit format, branch model, PR/review rules.
- `.claude/agents/agent-skill-architect.md` — agent that authors/audits skills.

## The shared FSD pattern (all three stacks)

Code is organised into **Layers** (top-level concerns) → **Slices** (one folder per business unit) → **Segments** (named subfolders by purpose). Imports flow **only downward**; `config/` and `pkg/` are infra importable from any layer. The layer order differs slightly per stack:

| Stack | Skill | Dependency direction | Note |
|---|---|---|---|
| Workers + Hono | `worker-structure` | `routes → modules → widgets → features → entities → shared` | DO classes live in `entities/models/<entity>.object.ts` |
| Fastify + Zod | `server-structure` | `routes → modules → widget → features → entities → shared` | **singular `widget/`** layer folder |
| Next.js + React | `client-structure` | `(web)|(api) → modules → widgets → features → entities → shared` | two route-group layers |

Each skill states exactly **five hard rules**. The first three are identical across all three stacks; rules 4 and 5 are stack-specific:

1. **Barrels at slice/segment level ONLY.** Every slice and segment ships an `index.ts`; layer-level folders (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`) ship **no** barrel. Consumers import through the slice/segment barrel and never reach into a sibling's internals.
2. **One-way import direction** (table above). No upward imports, no same-layer sibling imports (no module→module).
3. **`pkg/*` self-containment.** A `pkg/*` slot never imports `app/*` or another `pkg/*`; it must be liftable as one folder. Duplicate shared helpers privately rather than cross-importing.

Rules 4 and 5 differ per skill:
- **worker** — (4) env-block mirroring: a binding / DO / migration / queue / var must be mirrored across **all** Wrangler env blocks (no inheritance); (5) generated types are read-only (`types-<entry>.d.ts` from `wrangler types`).
- **server** — (4) route schema is mandatory: every `server.route(...)` declares `schema.body/params/response`, validated by the `fastify-type-provider-zod` `ZodTypeProvider` (never validate manually); (5) generated types are read-only (Payload `payload-types.ts` from `yarn generate:types`, or Drizzle-introspection output).
- **client** — (4) RSC by default, `'use client'` at the highest necessary boundary; (5) env access only through `config/env/` (`@t3-oss/env-nextjs`) — never `process.env` directly.

So "generated types are read-only" is shared by worker + server (their rule 5), but the **client has no generated-types rule** — its rules 4 and 5 are the RSC boundary and the env gate.

### Folder/Slice tree (worker example, one level deeper than [[architecture]])

```
src/
├── app/
│   ├── <entry>.ts            # Hono app per worker target; re-exports DO classes
│   ├── routes/               # LAYER — one <entry>.routes.ts aggregator per entry
│   ├── modules/<module>/     # SLICE — *.module.ts (HTTP entry) + *.service.ts
│   ├── widgets/<widget>/     # SLICE — composing service, no Hono routing
│   ├── features/<feature>/   # SLICE — single capability
│   ├── entities/
│   │   ├── models/           # SEGMENT — *.object.ts | *.table.ts | *.collection.ts | *.model.ts
│   │   └── dto/              # SEGMENT — *.dto.ts (Zod schemas + inferred types)
│   └── shared/{components,constants,interfaces,middlewares,services,utils}/
├── config/                   # envConfig + server/swagger config
└── pkg/{auth,validator,...}/ # self-contained integrations
```

## File naming (suffix = role)

The suffix declares the file's role and constrains which layer it may live in. Common suffixes across stacks: `*.module.ts(x)`, `*.service.ts`, `*.component.tsx`, `*.collection.ts`, `*.table.ts`, `*.object.ts`, `*.model.ts`, `*.dto.ts`, `*.interface.ts`, `*.constant.ts`, `*.middleware.ts`, `*.util.ts`, `*.config.ts`, `*.pkg.ts`, `*.routes.ts`, `*.plugin.ts` (server), `*.block.ts` (server CMS), `*.api.ts` / `*.query.ts` / `*.mutation.ts` / `*.store.ts` / `*.hook.ts` (client). All folders are **kebab-case**; the slice folder name matches the file prefix (`modules/<module>/<module>.module.ts`).

**Persistence files are engine-agnostic by suffix** in `entities/models/`: `*.object.ts` = Cloudflare Durable Object, `*.table.ts` = Drizzle, `*.collection.ts` = Payload CMS, `*.model.ts` = generic ORM fragment. See [[database-and-migrations]], [[payload-cms]], [[server-collections]].

**Documented exception** (client only): `shared/validation/validation.ts` is plain `*.ts`, *not* `*.validation.ts` (client SKILL.md lines 176, 211, 301).

## Symbol naming (prefixes)

- `S<Name>` — Zod schemas in `*.dto.ts` (`SCreate<X>Req`, `S<X>Res`).
- `I<Name>` — inferred / TS types (`I<Name> = z.infer<typeof S<Name>>`).
- `E<Name>` — enums.
- `UPPER_SNAKE_CASE` — plain static constants; helper functions in the same file stay `camelCase`.
- Client hooks: `use<Name>Store` (Zustand), `use<Name>Mutation` (TanStack mutation), `<name>QueryOptions` (query factory).

## Stack specifics worth noting

- **Client TanStack split** (`entities/api/<api>/`): `*.api.ts` = raw fetchers, `*.query.ts` = `queryOptions` (server-composable, no `'use client'`), `*.mutation.ts` = the **only** file carrying `'use client'`. Keeping query files server-composable is what enables `prefetchQuery` SSR hydration. See [[client-app]], [[client-routing]], [[client-modules-widgets]], [[client-shared]], [[client-config]], [[client-pkg]], [[data-flow]].
- **Worker `pkg/`** ships two reference slots: `pkg/auth/` and `pkg/validator/` — the latter wraps `zValidator` to standardise the `{ error: 'Bad Request', message }` 400 shape (file: `worker-structure/examples/pkg/validator/validator.pkg.ts`). See [[auth]], [[server-pkg]].
- **Server `pkg/auth/`** is a Fastify **plugin** wrapped with `fastify-plugin` `fp()` so its `authenticate` / `authenticateAdmin` decorators are visible server-wide; the route schema rule is enforced by `ZodTypeProvider`. See [[server-app]], [[server-modules]], [[server-features-blocks]], [[server-config-shared]].
- Each structure skill also defers env to a single config gate — worker/server `envConfig` from `config/`, client `envClient`/`envServer`. See [[build-and-deploy]] for the Wrangler env blocks the worker mirrors against.

## Skill anatomy (router + three independent resource sets)

Every structure skill ships the **same** anatomy (verified on disk for all three):

```
<skill>/
├── SKILL.md                      # THE ROUTER — the only file that points at resources
├── references/{structure.md, bootstrap.md, comments.md, pitfalls.md, <domain contract>}
├── examples/                     # mirrors src/ with __double_underscore__ folders & <angle-bracket> ids
└── spec/{invariants.spec.md, per-action.spec.md}
```

Confirmed domain-contract files: worker `references/cloudflare.md`, server `references/fastify.md` (client has none). `references/structure.md` is a three-part decision guide — Part A **Layer** (decision tree + isolation table: *May import / Must NOT import / When to lift*), Part B **Slice** (new-vs-extend, no same-layer sibling imports), Part C **Segment** (purity rules — e.g. a util that calls a service becomes a service).

**Iron rule (from `agent-skill-architect.md`):** `references/`, `examples/`, and `spec/` MUST NOT reference one another — only `SKILL.md` decides which resource to open. The agent authors/audits skills to this anatomy, prescribes the SKILL.md section order, and defers generic mechanics (scaffolding, frontmatter, packaging) to the `skill-creator` skill (lines 13–25, 99–101).

Self-verification: after a change, a skill user checks `spec/invariants.spec.md` (global MUST/MUST NOT) plus the matching block in `spec/per-action.spec.md` (`+module`, `+widget/feature`, `+entity`, `+shared`, `+pkg`, `+entry/route`, `bootstrap`). Each item carries a grep/visual **Check** hint.

## Worker hard rules (from `worker-structure` SKILL.md)

The `worker-structure` SKILL.md owns the worker-specific Cloudflare rules (its "Hard rules" §, Common Mistakes table, and `references/cloudflare.md`):

- Never hand-edit any `types-<entry>.d.ts` — generated by `wrangler types` (alias `yarn cf-typegen`); hand edits are overwritten on regeneration.
- Never put secrets in any `wrangler.<entry>.jsonc` — use `wrangler secret put --env <name> -c wrangler.<entry>.jsonc`.
- Read process env only through `envConfig` from `config/`, never `process.env` directly.
- Mirror any binding / DO / migration / queue / var across **all** Wrangler env blocks (`local`, `develop`, `staging`, `production`) of **every** `wrangler.<entry>.jsonc` — no inheritance. See [[build-and-deploy]], [[database-and-migrations]].

## git-workflow

Commit format is `[action]:[short description]` followed by per-file change lines. Action types are conventional-commit style: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`. Branch model: permanent `main ← staging ← develop`; `feature/*` and `fix/*` branch off `develop`; `hotfix/*` branches off `main` and merges back to **both** `main` and `develop`. PRs require ≥1 approval and passing status checks; no direct pushes to the three permanent branches.

> The skill's Environment Mapping table uses placeholder URLs (`https://domain.com`, `staging.domain.com`, `develop.domain.com`) — these are templates, not this project's real deploy targets, and do not necessarily align with the Wrangler `develop`/`staging`/`production` env blocks (see [[build-and-deploy]]). (template / unverified mapping)

## Depends on / talks to

This page governs every other area. Architecture overview: [[architecture]]. Stacks it defines: [[client-app]], [[client-routing]], [[client-modules-widgets]], [[client-shared]], [[client-pkg]], [[client-config]], [[server-app]], [[server-modules]], [[server-features-blocks]], [[server-collections]], [[server-pkg]], [[server-config-shared]], [[payload-cms]]. Cross-cutting concerns it constrains: [[build-and-deploy]], [[database-and-migrations]], [[auth]], [[data-flow]]. Index: [[index]].

## Uncertainties

- The skills are governing/aspirational docs for the repo as a template; the live `src/` may diverge. Real code was not cross-checked against the skills for this page.
- Slash-command invocation (`/worker-structure`) is by skill name via Claude Code convention; there is no separate slash-command definition file under `.claude/` to cite. (unverified mechanism)
- The git-workflow Environment Mapping URLs are placeholders (noted above).
- Domain-contract files (`cloudflare.md`, `fastify.md`) were confirmed to exist but not read in full; finer Fastify/Cloudflare contract details beyond the SKILL.md summaries are not independently verified here.
