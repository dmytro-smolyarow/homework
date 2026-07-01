---
name: client-structure
description: Use when scaffolding a new Next.js client project, bootstrapping from zero, adding a module/widget/feature/entity/api/model slice to an existing client codebase, adding a shared util/hook/store/service, registering a route or route handler, deciding where a new file should live, or auditing an existing client against a Feature-Sliced Design (Layer/Slice/Segment) layout. Even if the user doesn't say "FSD" or "structure" explicitly — if they're placing new code in a Next.js client repo, use this skill. Skip for one-line edits, bug fixes, and refactors inside an existing slice.
---

# client-structure

Provide the canonical architectural pattern for **Next.js (App Router) + React** clients. The pattern follows **Feature-Sliced Design (FSD)**: code is organised into **Layers** (top-level concerns), each Layer contains **Slices** (one folder per business unit), and Slices may contain **Segments** (named subfolders by purpose).

Names in this document are placeholders. `<module>`, `<widget>`, `<feature>`, `<api>`, `<entity>`, `<segment>` stand in for the resource being built — the skill describes the pattern, not specific names.

## When to use

Apply this skill to:
- Bootstrap a new Next.js client from zero (see `references/bootstrap.md`).
- Add a Slice to any Layer of an existing project (module, widget, feature, entity api or model, shared segment file, `pkg/` integration, route or route handler).
- Audit an existing project against the pattern (file layout, naming, layer dependency direction).

Skip this skill for one-line edits, bug fixes, and refactors *inside* an existing slice.

## Architecture

```
src/
├── app/
│   ├── (web)/                                      # LAYER — Next.js routing (route group)
│   │   ├── layout.tsx                              # root layout (RSC)
│   │   ├── page.tsx                                # root page (RSC)
│   │   ├── error.tsx                               # error boundary (optional)
│   │   ├── not-found.tsx                           # 404 page (optional)
│   │   ├── loading.tsx                             # loading UI (optional)
│   │   └── <route>/                                # nested route
│   │       ├── layout.tsx                          # optional
│   │       └── page.tsx
│   ├── (api)/                                      # LAYER — Next.js route handlers (route group)
│   │   └── api/
│   │       ├── <route>/
│   │       │   └── route.ts
│   │       └── <route>/[...path]/
│   │           └── route.ts                        # catch-all (e.g. BFF proxy)
│   ├── modules/                                    # LAYER — top-level business domains
│   │   └── <module>/                               # Slice
│   │       ├── <module>.module.tsx                 # module component (entry)
│   │       ├── <module>.service.ts                 # optional — module logic
│   │       ├── <module>.store.ts                   # optional — module-scoped store
│   │       ├── <module>.interface.ts               # optional — module-only types
│   │       ├── <module>.constant.ts                # optional — module-only constants
│   │       ├── elements/                           # optional — module-private sub-components
│   │       │   └── <element>/
│   │       │       ├── <element>.component.tsx
│   │       │       └── index.ts
│   │       └── index.ts                            # barrel
│   ├── widgets/                                    # LAYER — self-sufficient reusable UI
│   │   └── <widget>/                               # Slice
│   │       ├── <widget>.component.tsx
│   │       ├── <widget>.service.ts                 # optional
│   │       ├── <widget>.store.ts                   # optional
│   │       ├── <widget>.interface.ts               # optional
│   │       ├── <widget>.constant.ts                # optional
│   │       ├── <widget>.css                        # optional — co-located styles
│   │       ├── elements/                           # optional
│   │       └── index.ts
│   ├── features/                                   # LAYER — single-purpose reusable capabilities
│   │   └── <feature>/                              # Slice
│   │       ├── <feature>.component.tsx
│   │       ├── <feature>.service.ts                # optional
│   │       ├── <feature>.interface.ts              # optional
│   │       ├── <feature>.constant.ts               # optional
│   │       └── index.ts
│   ├── entities/                                   # LAYER — business entities (no layer-level barrel)
│   │   ├── api/                                    # Segment — TanStack Query layer
│   │   │   └── <api>/
│   │   │       ├── <api>.api.ts                    # raw fetchers
│   │   │       ├── <api>.query.ts                  # queryOptions
│   │   │       ├── <api>.mutation.ts               # useMutation hooks ('use client')
│   │   │       └── index.ts
│   │   └── models/                                 # Segment — flat types/interfaces
│   │       ├── <entity>.model.ts
│   │       └── index.ts
│   └── shared/                                     # LAYER — cross-layer reusable code
│       ├── components/                             # Segment — shared UI
│       │   └── <component>/
│       │       ├── <component>.component.tsx
│       │       └── index.ts
│       ├── hooks/                                  # Segment
│       │   ├── <hook>.hook.tsx
│       │   └── index.ts
│       ├── store/                                  # Segment — global Zustand stores
│       │   ├── <store>.store.ts
│       │   └── index.ts
│       ├── services/                               # Segment — shared services
│       │   ├── <name>.service.ts
│       │   └── index.ts
│       ├── utils/                                  # Segment — pure utilities
│       │   ├── <name>.util.ts
│       │   └── index.ts
│       ├── constants/                              # Segment — static values
│       │   ├── <name>.constant.ts
│       │   └── index.ts
│       ├── interfaces/                             # Segment — global types
│       │   ├── <name>.interface.ts
│       │   └── index.ts
│       ├── validation/                             # Segment — Zod schemas (flat files, plain *.ts)
│       │   ├── validation.ts
│       │   └── index.ts
│       └── assets/                                 # Segment — icons, images
│           └── <category>/
│               └── index.ts
├── config/                                         # application configuration
│   ├── env/                                        # Segment — @t3-oss/env-nextjs validated
│   │   ├── env.client.ts
│   │   ├── env.server.ts
│   │   └── index.ts
│   ├── fonts/                                      # Segment
│   │   ├── font.ts
│   │   └── index.ts
│   └── styles/                                     # Segment — global CSS
│       └── global.css
├── pkg/                                            # external integrations / framework-level utilities
│   └── <integration>/
│       ├── <integration>.<suffix>.ts               # public surface
│       └── index.ts
└── middleware.ts                                   # Next.js edge middleware (one file at src root)
```

### Layer dependency rule

Imports may flow **only downward**:
```
(web) | (api) → modules → widgets → features → entities → shared
```
`config/` and `pkg/` are infra; any layer may import from them. Never import upward (an entity must not import a feature; a feature must not import a widget; a module must not import another module).

### Folder discipline

Barrels (`index.ts`) live at **slice and segment level only** — the deepest folder that directly contains implementation files (`modules/<module>/`, `widgets/<widget>/`, `features/<feature>/`, `entities/api/<api>/`, `entities/models/`, `shared/components/<component>/`, `shared/hooks/`, `shared/store/`, etc., `pkg/<name>/`, `config/env/`, `config/fonts/`). Layer-level folders (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`) do **not** ship a barrel — they only group slices/segments and never re-export across them. Consumers import from the slice/segment folder, not from the layer. Folder names are **kebab-case**; the slice folder name matches the file prefix (`<module>/<module>.module.tsx`).

## Hard rules

Five rules that hold across every Next.js client built with this skill. Each rule has a one-line statement here; the reference docs own the detail.

1. **Slice/segment barrels** — every slice and every segment ships an `index.ts`; consumers import from that folder. Layer-level folders (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`, `pkg/`) do **not** carry a barrel.
2. **Layer dependency direction** — imports flow only downward (`(web)/(api) → modules → widgets → features → entities → shared`). `config/` and `pkg/` are infra and may be imported from any layer.
3. **`pkg/*` self-containment** — a `pkg/*` slot never imports from `app/*` or from another `pkg/*`. Each `pkg/*` folder must be liftable into another project as one folder. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.
4. **RSC by default, `'use client'` at the highest necessary boundary** — pages and layouts stay Server Components unless they call client-only APIs. When a tree needs the client runtime (hooks, browser APIs, event handlers, Zustand subscription, TanStack mutations), add `'use client'` at the **outermost** component that requires it; do not sprinkle it on every leaf.
5. **Env access through `config/env/` only** — never read `process.env` directly outside `config/env/env.client.ts` and `config/env/env.server.ts` (the `middleware.ts` boundary edge cases are noted in `references/pitfalls.md`).

## Layer responsibilities

**`src/app/(web)/`** — Next.js App Router pages. Files (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) follow Next.js conventions. Route groups (`(public)`, `(private)`) and dynamic segments (`[locale]`, `[id]`) live here. Pages stay thin: a page reads `params`/`searchParams`, may `prefetchQuery` against `entities/api/<api>` for SSR hydration, and renders a `<…>Module` from `modules/`. Business logic does not live in `page.tsx`.

**`src/app/(api)/api/`** — Next.js route handlers (`route.ts` / `route.tsx`). Treat as a sibling routing layer to `(web)/`: same dependency rule (may import from anything below), separate folder so server routes do not mix with page routes. Common shapes: BFF proxies forwarding to an upstream API, secret-gated revalidation endpoints, dynamic asset generators (`route.tsx` returning `ImageResponse`). Catch-all dynamic routes use `[...path]/route.ts`.

**`src/app/modules/<module>/`** — a **module** is a self-contained business-logic domain (the slice as a whole). The slice owns the page's primary client-side behaviour end-to-end: top-level component (`<module>.module.tsx`), domain logic, module-scoped store/constants/interfaces, and any module-private sub-components under `elements/`. `<module>.module.tsx` is the **entry component** of that domain — typically a `'use client'` component that composes widgets/features, reads from stores, calls TanStack mutations from `entities/api/<api>/`. Modules don't import each other — shared logic lifts down into a feature/widget, shared types into `shared/interfaces/`.

**`src/app/widgets/<widget>/`** — self-sufficient complex UI reused across modules. Composes features/entities behind one component. May be RSC or `'use client'` depending on what it does; default RSC when possible. No routing; no page-level concerns.

**`src/app/features/<feature>/`** — single-purpose reusable capability (a countdown timer, a pagination control, a sign-in button). Small surface. If composition of multiple features starts to appear inside a feature, lift the composition up into a widget.

**`src/app/entities/api/<api>/`** — TanStack Query layer for one resource. Three files:
- `<api>.api.ts` — raw async fetchers calling the project's REST client (a `pkg/<rest-api>` integration wrapping `ky` / `axios` / `fetch`). Returns the typed response.
- `<api>.query.ts` — `queryOptions(...)` factories with stable `queryKey`s sourced from `EEntityKey`. No `'use client'` (these compose into `prefetchQuery` on the server too).
- `<api>.mutation.ts` — `'use client'` `useMutation` hooks. Owns optimistic updates and toast/error surface.
The barrel re-exports the hooks/options consumers need; not every internal helper is exported.

**`src/app/entities/models/`** — flat `<entity>.model.ts` files holding **types/interfaces only**, no runtime code. One file per entity. Consumed by both the api slice (`<api>.api.ts`) and any layer that needs to type a domain shape.

**`src/app/shared/`** — cross-cutting code organised by **Segment**. Each segment is flat at the top (no sub-slices). Segments in use:
- `components/<component>/` — shared UI components (one folder per component, `<component>.component.tsx` + `index.ts`).
- `hooks/` — `<name>.hook.ts` / `<name>.hook.tsx`.
- `store/` — global Zustand stores (`<name>.store.ts`).
- `services/` — shared services not tied to one slice (`<name>.service.ts`).
- `utils/` — pure utilities (`<name>.util.ts`), no React, no I/O.
- `constants/` — static values (`<name>.constant.ts`).
- `interfaces/` — global TypeScript types/enums (`<name>.interface.ts`).
- `validation/` — Zod schemas as flat files (`validation.ts`). **Exception to suffix rule** — files are plain `*.ts`, not `*.validation.ts`. See `references/pitfalls.md`.
- `assets/` — icons/images organised by category.

**`src/config/`** — application configuration.
- `env/env.client.ts` and `env/env.server.ts` — `@t3-oss/env-nextjs` `createEnv(...)` with Zod over `process.env`. Export `envClient` / `envServer`. Every public env var must be in the `client.*` schema; every server-only var in `server.*`.
- `fonts/font.ts` — `next/font` declarations exported as named consts (`fontPrimary`, …).
- `styles/global.css` — global CSS, imported once from the root layout.

**`src/pkg/`** — external-system clients and framework-level utilities. Each subfolder is self-contained with its own `index.ts` and stays liftable as one folder. A project may keep `pkg/` flat (`pkg/<name>/`) or group related integrations under a parent (`pkg/<group>/<name>/` — e.g. `pkg/lib/`, `pkg/integrations/`, `pkg/theme/`). Typical slots a Next.js client tends to need: auth client/middleware, REST API client (ky/axios/fetch wrapper), i18n routing config (if i18n is in scope), shadcn/Tailwind theme primitives, analytics adapter, payment SDK adapter. Read configuration from `envClient` / `envServer` — never `process.env` directly.

**`src/middleware.ts`** — Next.js edge middleware lives at the **root of `src/`**, not under `app/`. One file. Composes locale routing, auth gates, session cookies, request-header rewrites. May read from `config/env/` and the relevant `pkg/<auth>/` (and other `pkg/` slots), but should not pull from modules/widgets/features.

> Detailed decision trees and isolation rules at the Layer/Slice/Segment levels (which layer, new slice vs extend, which segment, what each may import) live in `references/structure.md`.

## File naming (suffix = role)

| Suffix | Role | Layer |
|---|---|---|
| `*.module.tsx` | Module entry component | `modules/` |
| `*.component.tsx` | React component | widgets, features, shared/components, modules/elements |
| `*.service.ts` | Logic helpers (no React) | modules, widgets, features, shared/services, pkg |
| `*.store.ts` | Zustand store | modules, widgets, shared/store |
| `*.hook.ts` / `*.hook.tsx` | Custom hook | shared/hooks |
| `*.api.ts` | Raw fetcher | `entities/api/<api>/` |
| `*.query.ts` | TanStack `queryOptions` | `entities/api/<api>/` |
| `*.mutation.ts` | TanStack `useMutation` hook | `entities/api/<api>/` |
| `*.model.ts` | Domain types/interfaces | `entities/models/` |
| `*.interface.ts` | TypeScript types/enums | modules, widgets, features, shared/interfaces |
| `*.constant.ts` | Static values | modules, widgets, features, shared/constants |
| `*.util.ts` | Pure utility | shared/utils, pkg/util |
| `*.pkg.ts` | Public surface of a `pkg/` slot | `pkg/<name>/` |
| `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `not-found.tsx` | Next.js conventions | `app/(web)/` |
| `route.ts` / `route.tsx` | Next.js route handler | `app/(api)/api/` |
| `middleware.ts` | Next.js edge middleware | `src/` root |

**`shared/validation/validation.ts`** is the documented exception: flat `*.ts`, not `*.validation.ts`.

## Symbol naming

- **TypeScript interfaces**: prefix `I<Name>` (`IProps`, `I<Api>Body`, `I<Api>Res`).
- **Enums**: prefix `E<Name>` (`E<Domain>Step`, `E<Domain>Route`, `EEntityKey`).
- **Plain constants** in `*.constant.ts`: `UPPER_SNAKE_CASE` for static values and dictionaries; helper functions in the same file stay `camelCase`.
- **React components**: PascalCase identifier, suffix `Component` / `Module` matching the file (`<Module>Module`, `<Widget>Component`, `<Feature>Component`). Props pattern is `FC<Readonly<IProps>>`, destructure inside the body.
- **Zustand stores**: `use<Name>Store` exported from `<name>.store.ts`.
- **TanStack hooks**: `use<Name>Mutation` for mutations exported from `<api>.mutation.ts`; `<name>QueryOptions` for query option factories exported from `<api>.query.ts`.
- **Module/component default export**: file ends with `export default <Name>Module` (or `Component`); the barrel re-exports as a named export — `export { default as <Name>Module } from './<name>.module'`.
- **Query keys**: source from a single `EEntityKey` enum in `shared/interfaces/<entities>.interface.ts` so all keys live in one place.

## Mode A — Bootstrap a new Next.js client

Follow `references/bootstrap.md` step-by-step. It covers `create-next-app`, `package.json` scripts, `tsconfig.json` (`@/*` path alias to `src/*`), `eslint.config.mjs`, Prettier (single quotes, no semis, 120 cols, trailing commas), Tailwind v4 setup, `next-intl` `[locale]` routing, `@t3-oss/env-nextjs` env validation, the first `(web)` route, the first module, the first `entities/api/` slice, and `middleware.ts`.

## Mode B — Add a Slice to an existing project

Pick the Layer the new code belongs to (top-down: `(web)`/`(api)` → modules → widgets → features → entities → shared). Pull complexity *down* the stack: when a module's logic is reused by another module, lift the shared part into a feature or widget; when types appear in 3+ layers, lift them into `shared/interfaces/`.

### B1. New module
1. Create `src/app/modules/<module>/{<module>.module.tsx, index.ts}`. Add optional `<module>.service.ts`, `<module>.store.ts`, `<module>.interface.ts`, `<module>.constant.ts` as needed.
2. Place module-private sub-components under `src/app/modules/<module>/elements/<element>/<element>.component.tsx` with their own `index.ts`.
3. Re-export `<Module>Module` from the slice barrel: `export { default as <Module>Module } from './<module>.module'`.
4. Mount from a `src/app/(web)/.../page.tsx` (typically inside `<HydrationBoundary>` if SSR-prefetching from `entities/api/<api>/`).
5. `'use client'` only on the `<module>.module.tsx` file itself when client-side state/effects are needed; keep the page that hosts it as RSC.

### B2. New widget / feature
1. Create `src/app/widgets/<widget>/` or `src/app/features/<feature>/` with `<name>.component.tsx`, optional `*.service.ts` / `*.interface.ts` / `*.constant.ts`, and `index.ts`.
2. Compose from layers below (entities, shared). Do not call modules. Do not import another widget from a feature.
3. Add `'use client'` only when the component itself uses client-only APIs.

### B3. New entity (api and/or model)
1. Model: `src/app/entities/models/<entity>.model.ts` exporting `I*` interfaces and `E*` enums. Re-export from `entities/models/index.ts`.
2. Api slice: `src/app/entities/api/<api>/` with `<api>.api.ts`, `<api>.query.ts`, `<api>.mutation.ts`, `index.ts`. Add a `queryKey` enum value in `shared/interfaces/entities.interface.ts` (`EEntityKey.QUERY_<NAME>`) so keys stay centralised.
3. The mutation file declares `'use client'` at the top; the api and query files do not (they must remain composable on the server for `prefetchQuery`).

### B4. New shared segment file
1. Pick the segment: `components/`, `hooks/`, `store/`, `services/`, `utils/`, `constants/`, `interfaces/`, `validation/`, or `assets/`.
2. Use the matching suffix (`*.component.tsx`, `*.hook.ts(x)`, `*.store.ts`, `*.service.ts`, `*.util.ts`, `*.constant.ts`, `*.interface.ts`). `validation/` is the exception — files are plain `*.ts`.
3. Re-export from the segment's `index.ts`. For `components/`, the inner folder also ships its own barrel.

### B5. New `pkg/` integration
1. New folder `src/pkg/<name>/` with `index.ts` and at least one `<name>.<suffix>.ts` file (`.service.ts`, `.provider.tsx`, `.pkg.ts`, etc.). For larger integrations split into `service`, `provider`, `constants` files.
2. Read configuration from `envClient` / `envServer`. Do not touch `process.env` directly.
3. **Pkg self-containment**: never import from `app/*` or from another `pkg/*`. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.

### B6. New `(web)` route or `(api)` route handler
1. **`(web)` route**: add `src/app/(web)/[locale]/<…group>/<route>/page.tsx` (and optional `layout.tsx`/`loading.tsx`/`error.tsx`). Keep the page thin: read params, optionally `prefetchQuery` from `entities/api/<api>`, render a `<…>Module`. Use `(public)` / `(private)` route groups to scope shared layout/middleware behaviour without affecting URL.
2. **`(api)` route handler**: add `src/app/(api)/api/<route>/route.ts` exporting `GET` / `POST` / etc. Pull env from `config/env/`. Validate input. For multi-method passthroughs, factor a `handler` function and assign it to each verb.
3. If middleware behaviour changes (new private path, new redirect rule), update `src/middleware.ts` accordingly — keep all gating in that one file.

## Comments

Short label-style `//` comments sit above named symbols and expand on the identifier in 1–5 words. Pages use `// page`, layouts use `// layout`, route handlers use `// VERB /path` shorthand, mutations use `// <action>` (e.g. `// create payment session hook`). Full convention, examples, and anti-patterns live in `references/comments.md`.

## Examples

Canonical file shapes for every layer live in `examples/`. The tree mirrors the canonical `src/` layout, so `cp -r examples/* <project>/src/` (with placeholder substitution) yields a working skeleton for a new project. Use the relevant subtree for incremental refactors of an existing project.

**Placeholder conventions:**
- **Identifiers** inside files use angle-bracket notation: `<module>`, `<widget>`, `<feature>`, `<api>`, `<entity>`, `<Module>`, `<Component>`, `I<Name>`, `E<Name>`, `use<Name>Store`. Replace every `<…>` before saving in a real project.
- **File and folder names** with placeholders use double-underscore notation: `__module__/`, `__widget__.component.tsx`, `__api__.query.ts`. Rename to the real slice name when copying.
- Files are **shape references, not runnable code** — angle-bracket identifiers are invalid TypeScript. The contract is structural: imports, layer dependencies, function signatures, return shapes, comment style.

**Multiplicity:**
The example tree shows **one** of each placeholder file. Real projects will have many: many `<module>/` folders under `app/modules/`, many `<widget>/` and `<feature>/` slices, many `<api>/` slices under `app/entities/api/`, many `<entity>.model.ts` files. Treat each example as the *template for one*, then duplicate per concrete name.

## Self-verification

After adding or changing a slice, self-verify against `spec/`:
1. **`spec/invariants.spec.md`** — global structural invariants (barrels, import direction, `pkg` self-containment, server/client boundary, env, naming, layer purity).
2. **`spec/per-action.spec.md`** — the block matching what you did (`+module`, `+widget/feature`, `+entity`, `+shared`, `+pkg`, `+route`, `bootstrap`).

Each spec item is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue). Confirm each before declaring work done.

## Common Mistakes

| Mistake | Reality |
|---|---|
| Adding `index.ts` at layer level (`modules/index.ts`, `shared/index.ts`) | Forbidden — barrels live at slice/segment level only. |
| Importing upward (feature → widget, entity → feature, module → module) | Imports flow only downward: `(web)/(api) → modules → widgets → features → entities → shared`. |
| Module importing another module | Modules don't import each other. Lift shared logic down into a feature/widget. |
| `pkg/<name>` importing from `app/*` or another `pkg/<name>` | `pkg/*` must stay self-contained and liftable. Duplicate helpers if needed. |
| Reading `process.env` directly outside `config/env/` | Add the var to the Zod schema in `env.client.ts` / `env.server.ts`, import `envClient` / `envServer`. |
| `'use client'` on every leaf component | Add it at the **highest** boundary that needs the client runtime. Pages/layouts stay RSC by default. |
| `'use client'` on `<api>.api.ts` or `<api>.query.ts` | Only `<api>.mutation.ts` declares `'use client'`. Api/query files must stay server-composable for `prefetchQuery`. |
| TanStack Query files living in modules/widgets/features | All `*.api.ts` / `*.query.ts` / `*.mutation.ts` files live under `entities/api/<api>/`. |
| Free-floating types in modules that other layers need | Lift into `entities/models/<entity>.model.ts` (domain shape) or `shared/interfaces/<name>.interface.ts` (cross-cutting). |
| Suffix-less files outside the documented exception | Every file uses its suffix (`.component.tsx`, `.service.ts`, etc.). Only `shared/validation/validation.ts` is plain `*.ts`. |
| Folder naming with camelCase or `_` | All folders are `kebab-case`; slice folder name matches file prefix. |
| Mixing concerns in `shared/` | A util that calls a service is not a util — move it to `shared/services/`. A constant file that imports runtime code is not a constant — split it. |

Full explanations of the *why* behind each rule live in `references/pitfalls.md`.

## Resources

This SKILL is the router: it decides which resource to open for the situation. The three resource sets are independent — they do **not** reference one another.

| Situation | Open |
|---|---|
| Deciding **where new code goes** (which layer / new slice vs extend / which segment / what it may import / when to lift up or down) | `references/structure.md` |
| Need a **file or slice template** to copy and rename | `examples/` |
| **Verifying** after a change — what file type belongs where, what each layer must/must not do | `spec/invariants.spec.md` + the matching block in `spec/per-action.spec.md` |
| Understanding **why** a rule exists / diagnosing a smell | `references/pitfalls.md` |
| **Bootstrapping** a new project from zero | `references/bootstrap.md` |
| **Comment style** for any file | `references/comments.md` |

- **`references/structure.md`** — Layer/Slice/Segment decision trees + isolation rules.
- **`references/bootstrap.md`** — Mode A new-project scaffold (`create-next-app`, `tsconfig`, ESLint, Prettier, Tailwind v4, `next-intl`, env validation, first route/module/api slice, `middleware.ts`).
- **`references/comments.md`** — comment-style convention.
- **`references/pitfalls.md`** — common mistakes with explanations.
- **`spec/`** — declarative self-verification: `invariants.spec.md` (global invariants) + `per-action.spec.md` (checks per action).
- **`examples/`** — canonical file shapes per layer with `<…>` / `__…__` placeholders.
