# Spec: global invariants

Declarative structural rules that hold for **every** Next.js client built with this skill. After any change, self-verify against this list. Each rule is a `MUST` / `MUST NOT` with a **Check** hint (a grep pattern or a visual cue) — no script to run, the model reads and confirms.

## Barrels

- **MUST** ship an `index.ts` at every slice and segment folder (the deepest folder containing implementation files).
  Check: each new `<slice>/` or `<segment>/` folder has `index.ts`.
- **MUST NOT** place a barrel at layer level (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`).
  Check: `ls src/app/modules/index.ts` (and siblings) → file does not exist.

## Import direction

- **MUST** import only downward: `(web)/(api) → modules → widgets → features → entities → shared`.
- **MUST NOT** import upward or sideways within a layer (module→module, feature→feature, widget→widget).
  Check: `grep -R "from '@/app/modules/'" src/app/modules/` returns only `<module>/elements/*` self-imports.

## `pkg/` self-containment

- **MUST NOT** let a `pkg/*` slot import from `app/*` or from another `pkg/*`.
  Check: `grep -R "from '@/app/" src/pkg/` and `grep -R "from '@/pkg/<other>" src/pkg/<name>/` return nothing.

## Server / client boundary

- **MUST** keep pages and layouts as RSC unless they call client-only APIs.
- **MUST** place `'use client'` at the **outermost** component that needs the client runtime; children inherit it.
- **MUST NOT** add `'use client'` to `*.api.ts` or `*.query.ts` (they stay server-composable for `prefetchQuery`). Only `*.mutation.ts` carries it.
  Check: `grep -RL "use client" src/app/entities/api/**/*.mutation.ts` is empty; `grep -Rl "use client" src/app/entities/api/**/*.{api,query}.ts` is empty.

## Environment access

- **MUST** read env only through `envClient` / `envServer` from `config/env/`.
- **MUST NOT** read `process.env` outside `config/env/` — sole exception: `src/middleware.ts` reading `process.env.NODE_ENV` for cookie flags.
  Check: `grep -R "process.env" src --include=*.ts | grep -v "config/env" | grep -v "middleware.ts"` returns nothing.
- **MUST** place `NEXT_PUBLIC_*` vars on `envClient`; secrets on `envServer`.

## File naming

- **MUST** carry the role suffix on every implementation file (`.module.tsx`, `.component.tsx`, `.service.ts`, `.store.ts`, `.hook.ts(x)`, `.api.ts`, `.query.ts`, `.mutation.ts`, `.model.ts`, `.interface.ts`, `.constant.ts`, `.util.ts`, `.pkg.ts`).
  Sole exception: `shared/validation/validation.ts` (plain `*.ts`).
- **MUST** use kebab-case folder names; the slice folder name equals the file prefix.
  Check: `modules/<name>/<name>.module.tsx` — folder and prefix match, no camelCase, no `_`.

## Layer purity

- **MUST** keep `shared/utils/*.util.ts` pure (no React, no I/O, no service calls).
- **MUST** keep `entities/models/*.model.ts` runtime-free (types/interfaces/enums only).
- **MUST NOT** put TanStack Query files (`*.api.ts` / `*.query.ts` / `*.mutation.ts`) anywhere except `entities/api/<api>/`.
  Check: `grep -Rl "queryOptions\|useMutation\|useQuery" src/app/{modules,widgets,features}` returns nothing.
