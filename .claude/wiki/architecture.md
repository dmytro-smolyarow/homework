# Architecture

## What this is

A single Next.js 16 App-Router project that is *both* the web frontend and its
API. No monorepo, no separate backend, no CMS. All application code lives under
`src/` in a **Feature-Sliced Design (FSD)** layout governed by the
`client-structure` skill (see [[conventions-and-skills]]).

## Layout (`src/`)

```
src/
├── app/
│   ├── (web)/            # LAYER — App Router pages (RSC). See [[routing]]
│   ├── (api)/api/        # LAYER — route handlers, the BFF. See [[routing]]
│   ├── modules/          # LAYER — page-level business domains ('use client'). See [[ui-layer]]
│   ├── widgets/          # LAYER — reusable composite UI (navbar, item-card)
│   ├── features/         # LAYER — single-purpose capabilities (favorite-button, oauth-sign-in)
│   ├── entities/         # LAYER — api (TanStack Query) + models. See [[data-layer]]
│   └── shared/           # LAYER — components, services (Drizzle), interfaces
├── config/               # env (client/server split), fonts, global.css
├── pkg/                  # integrations: auth, db, fetcher, tanstack
└── proxy.ts              # Next.js edge middleware (renamed from middleware.ts)
```

### Layer dependency rule

Imports flow **downward only**:

```
(web) | (api) → modules → widgets → features → entities → shared
```

`config/` and `pkg/` are infrastructure and may be imported from any layer. A key
consequence, enforced deliberately in this repo: **client code never imports the
server-only pieces**. `shared/services` (Drizzle) and `pkg/auth`'s server instance
are only reached from RSC pages and `(api)` route handlers, never from
`'use client'` components. See the client/server split notes in [[auth]] and the
env split in [[conventions-and-skills]].

## The two request paths

The single most important thing to understand about this app is that data reaches
the screen two different ways (full detail in [[data-flow]]):

1. **RSC-direct (server render / SSR seed).** A `(web)` page is an `async` Server
   Component that calls `shared/services` **directly** (a plain function call into
   Drizzle — no HTTP), then passes the result to a client Module as `initialData`.
   Used for the first catalog page and the item-detail page. Pages set
   `revalidate` for ISR (`app/(web)/page.tsx` = 300s, `items/[id]/page.tsx` = 60s).

2. **Client → BFF.** Interactive state (search, pagination, favorites) runs in
   `'use client'` Modules through TanStack Query. Query/mutation functions in
   `entities/api` call `pkg/fetcher`, which does `fetch('/api/...')` against the
   `(api)` route handlers. Those handlers authenticate (where needed) and call the
   same `shared/services` functions. So the client path is
   `component → entities/api → fetcher → /api route → shared/services → Drizzle`.

Both paths converge on `shared/services` — the only place that talks to the
database. See [[database-and-migrations]].

## Auth boundary

better-auth issues a session cookie. The `proxy.ts` edge middleware does a cheap
cookie presence check to gate `/favorites` (redirecting to `/login` when absent);
the real session is verified server-side inside the page via `getSession()`. Full
flow in [[auth]].

## Entry points

- `src/app/(web)/layout.tsx` — root layout: `<html>`/`<body>`, imports
  `global.css`, mounts the `QueryProvider` ([[data-layer]]) and the `Navbar`
  widget around every page.
- `src/proxy.ts` — edge middleware, `matcher: ['/favorites']`.
- `src/app/(api)/api/**/route.ts` — the BFF surface ([[routing]]).
