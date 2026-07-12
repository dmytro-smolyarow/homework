# Conventions & Skills

The rules that keep the codebase consistent, plus the day-to-day commands.

## Feature-Sliced Design

The whole app follows FSD: **Layer → Slice → Segment**, imports flowing downward
only (`(web)/(api) → modules → widgets → features → entities → shared`; `config/`
+ `pkg/` are infra). The layout and dependency rule are described in
[[architecture]]; the concrete layers in [[routing]], [[data-layer]], [[ui-layer]].

## Governing skills (`.claude/skills/`)

- **`client-structure`** — the canonical Next.js/FSD layout: where each file goes,
  slice/segment barrels (`index.ts` at slice/segment level only, never at layer
  level), the RSC-by-default / `'use client'`-at-the-boundary rule, and the
  `pkg/*` self-containment rule.
- **`naming-conventions`** — file suffixes (`*.module.tsx`, `*.component.tsx`,
  `*.service.ts`, `*.api.ts`, `*.query.ts`, `*.mutation.ts`, `*.model.ts`,
  `*.interface.ts`, `*.provider.tsx`, …) and symbol prefixes (`I*` interfaces,
  `E*` enums like `EEntityKey`, `use*Mutation` / `*QueryOptions`, PascalCase
  `*Module`/`*Component`).
- **`git-workflow`** — commits, branches, PRs.

`server-structure` and `worker-structure` skills are also present but **do not
apply** here — this repo has no Fastify server or Cloudflare Worker; it's a single
Next.js client app. They're carried over from the shared skill set.

## Client / server import discipline

A recurring, deliberate pattern: server-only code must never enter the client
bundle. Two instances:

- **env** (`src/config/env/`) — `env.client.ts` exports `envClient` (only
  `NEXT_PUBLIC_*`); `env.server.ts` exports `envServer` (secrets). There is **no
  barrel** — client code imports `@/config/env/env.client`, server code imports
  `@/config/env/env.server`, so the secret-bearing schema can't be pulled into a
  client bundle. Access env only through these, never `process.env` directly.
- **auth** (`src/pkg/auth/`) — `index.ts` is a server-safe barrel; client
  components import `./auth-client` directly. See [[auth]].

## Tooling

- **ESLint** — flat config (`eslint.config.mjs`) on `eslint-config-next` (core-web-
  vitals + typescript) plus `simple-import-sort` and `eslint-plugin-prettier`.
  Ignores `.next`, build output, and `.claude/**`. Run `npm run lint`.
- **Prettier** — `.prettierrc`: **single quotes, no semicolons**, width 120,
  trailing commas, `prettier-plugin-tailwindcss`. Run `npm run format`.
- **TypeScript** — `@/*` path alias → `src/*`; `npx tsc --noEmit` to typecheck.

## Commands

| Script | Does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run db:generate` | Generate a Drizzle migration from `schema.ts` |
| `npm run db:migrate` / `db:push` | Apply migrations / push schema |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Seed 12 books (`scripts/seed.ts`) |

Migrations and the seed use the **direct** DB connection, not the pooler — see
[[database-and-migrations]]. Env vars are documented by `.env.example`.
