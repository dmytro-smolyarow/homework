# Pitfalls & verification

## Common mistakes

**Layer dependency direction.** A feature importing a widget, an entity importing a feature, or a module importing another module's `*.module.tsx` are all upward imports. Lift the shared symbol down: shared types into `entities/models/<entity>.model.ts` or `shared/interfaces/`, shared logic into a feature/widget, shared persistence shape into `entities/`.

**Module imports another module.** Modules don't import each other. If two modules need the same logic, lift it down into a widget/feature; if they need the same shape, lift it down into `shared/interfaces/` or `entities/models/`. A grep that finds `from '@/app/modules/'` inside `src/app/modules/` (except for `<module>/elements/*` self-imports) is the quick check.

**`'use client'` on every leaf.** The directive belongs at the **highest** component that requires the client runtime. Pushing it down into every leaf bloats the client bundle and surfaces hydration mismatches; pushing it onto a layout/page that doesn't need it forces every descendant client-side. The default is RSC; opt in to client only when the component itself uses hooks, browser APIs, event handlers, Zustand subscription, or TanStack mutations.

**`'use client'` on `<api>.api.ts` or `<api>.query.ts`.** Only `<api>.mutation.ts` declares `'use client'`. The api and query files must remain server-composable so a `page.tsx` can call `clientQuery.prefetchQuery(<api>QueryOptions(...))` during SSR. Adding `'use client'` to a query file forces every page that prefetches it into the client bundle.

**TanStack Query files outside `entities/api/`.** All `*.api.ts` / `*.query.ts` / `*.mutation.ts` files live under `src/app/entities/api/<api>/`. Putting a `useFooQuery` inside a module or widget couples that slice to the resource and prevents reuse from other slices.

**Free-floating domain types in modules.** Types describing API shapes belong in `entities/models/<entity>.model.ts`. Cross-cutting enums (route names, cookie keys, query-param keys, query-key enum) live in `shared/interfaces/`. Defining `IFoo` inside `modules/<module>/<module>.interface.ts` is correct *only* when the type is genuinely module-private.

**Direct `process.env` access.** Read env variables only through `envClient` / `envServer` exported from `config/env/`. Adding a var means updating the Zod schema in `env.client.ts` or `env.server.ts` *and* `.env.example`. The one structural exception is `src/middleware.ts`, which may read `process.env.NODE_ENV` for branching `secure: process.env.NODE_ENV === 'production'` cookie flags — any other env var goes through `envClient`/`envServer` even in middleware.

**`NEXT_PUBLIC_*` vars declared on the server-only schema (or vice versa).** Vars prefixed `NEXT_PUBLIC_` go in `envClient` (`client: { … }`); everything else (secrets, upstream URLs not safe to ship) goes in `envServer` (`server: { … }`). Swapping them either crashes the build (`envClient` rejecting a non-public name) or leaks a secret into the client bundle.

**Skipped barrels (or stray layer-level barrels).** Slice and segment folders ship an `index.ts`; consumers import from the slice/segment folder. Conversely, **layer-level folders** (`modules/`, `widgets/`, `features/`, `entities/`, `shared/`) do **not** carry a barrel — they only group slices/segments. Adding `modules/index.ts` or `shared/index.ts` re-exports across slices and quietly bypasses the layer dependency rule; remove it.

**`pkg/*` reaches into `app/*` (or another `pkg/*`).** A `pkg/*` slot must be liftable as one folder into another project; once it imports from `app/*` or a sibling `pkg/*`, that property is gone and the import graph also risks cycles. If a pkg needs a project-specific shape, accept it as a parameter at call time. If two pkg slots need the same helper, duplicate it as a private file inside each pkg.

**Mixed concerns in `shared/`.** A util that calls a service is no longer a util — move it to `shared/services/`. A util that touches React (hook, `useEffect`, JSX) is not a util — move it to `shared/hooks/` or `shared/components/`. A constant file that imports runtime code is not a constant — split it. `shared/utils/*.util.ts` files are pure: input → output, no side effects.

**File suffix omitted.** Every implementation file carries its role suffix (`.module.tsx`, `.component.tsx`, `.service.ts`, `.store.ts`, `.hook.ts(x)`, `.api.ts`, `.query.ts`, `.mutation.ts`, `.model.ts`, `.interface.ts`, `.constant.ts`, `.util.ts`). The single documented exception is **`shared/validation/validation.ts`** — flat `*.ts`, not `*.validation.ts`. Don't extend this exception to other segments.

**Business logic in `page.tsx`.** Pages read params, optionally prefetch a query for hydration, and render a module. Authentication checks, data orchestration, side effects, analytics — all belong inside the module (or in `middleware.ts` for route gates). If a page has more than ~20 lines of logic, the logic belongs in a module.

**Component prop pattern drift.** Components use `FC<Readonly<IProps>>` with `IProps` declared just above the component, and props are **destructured inside the body** (`const { x, y } = props`), not in the parameter list. The convention is repo-wide; deviating creates churn when other files mirror neighbours.

**Module folder name doesn't match file prefix.** A slice at `modules/<module-name>/` must contain `<module-name>.module.tsx`, not `<moduleName>.module.tsx` or a different prefix. The folder and the suffix files share one kebab-case prefix.

**Component element class lookup pulled into a util that depends on React.** When something needs React, it belongs in `shared/components/` or `shared/hooks/`, not `shared/utils/`. Test: can the file run under `vitest` with no DOM? If not, it's not a util.

**Notion KB drift from reality.** The project's Notion KB lists `shared/` segments as `ui/, hooks/, store/, interfaces/, assets/`. The repo actually uses `components/, hooks/, store/, interfaces/, constants/, utils/, services/, validation/, assets/`. The skill anchors on **reality** (the segments in active use). If both the Notion KB and the code change in the future, update this skill in lockstep — do not let one drift away from the other again.
