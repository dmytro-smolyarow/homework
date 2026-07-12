# Routing — `(web)` pages & `(api)` BFF

Two sibling routing layers under `src/app/`. `(web)` is the user-facing page tree
(React Server Components); `(api)` is the HTTP surface the client calls. Both may
import downward (services, pkg); see the dependency rule in [[architecture]].

## `(web)` pages

Pages stay thin: read params, optionally prefetch on the server, render a Module
from [[ui-layer]]. Data-fetching detail is in [[data-flow]].

| Route | File | Renders | Notes |
|---|---|---|---|
| `/` | `app/(web)/page.tsx` | `CatalogModule` | `revalidate = 300`; server-calls `listItems()` and passes it as `initialData`. |
| `/items/[id]` | `app/(web)/items/[id]/page.tsx` | `ItemDetailsModule` | `revalidate = 60`; server-calls `getItemById` + `getFavoriteCount`, combined into `initialData`. |
| `/favorites` | `app/(web)/favorites/page.tsx` | `FavoritesModule` | Server-verifies session via `getSession()`; redirects to `/login?redirect=/favorites` if absent. No prefetch — the Module queries client-side. |
| `/login` | `app/(web)/login/page.tsx` | `LoginModule` | Reads `?redirect` (default `/`), passes as `redirectTo`. |
| `/register` | `app/(web)/register/page.tsx` | `RegisterModule` | Reads `?redirect` (default `/`), passes as `redirectTo`. |
| (404) | `app/(web)/not-found.tsx` | `NotFoundModule` | Next.js not-found convention. |

Server pages serialize prefetched data with `JSON.parse(JSON.stringify(...))`
before handing it to the client Module (dates/nulls → JSON-safe `initialData`).

`layout.tsx` is the shared shell for the whole tree — see [[architecture]].

## `(api)` route handlers (the BFF)

Each `route.ts` exports HTTP verb handlers. All return `NextResponse.json(...)`.
The favorites handlers gate on `getSession()` and read the current user id from
the session; the items handlers are public. All delegate to `shared/services`
([[database-and-migrations]]).

| Endpoint | File | Verbs | Behavior |
|---|---|---|---|
| `/api/items` | `app/(api)/api/items/route.ts` | GET | `listItems({ search, page, pageSize })` from query params. |
| `/api/items/[id]` | `app/(api)/api/items/[id]/route.ts` | GET | `getItemById` + `getFavoriteCount`; 404 if not found. |
| `/api/favorites` | `app/(api)/api/favorites/route.ts` | GET / POST / DELETE | List / add / remove for the session user; 401 if unauthenticated, 400 if `itemId` missing. |
| `/api/favorites/ids` | `app/(api)/api/favorites/ids/route.ts` | GET | The session user's favorited item ids (drives toggle state); returns `[]` when unauthenticated. |
| `/api/auth/[...all]` | `app/(api)/api/auth/[...all]/route.ts` | GET / POST | `toNextJsHandler(auth)` — the entire better-auth surface. See [[auth]]. |

The client never calls these directly — it goes through the fetchers in
`entities/api`, which wrap `pkg/fetcher`. See [[data-layer]].

## Edge middleware

`src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) has
`matcher: ['/favorites']`. It checks only for the presence of the better-auth
session cookie and redirects to `/login?redirect=<path>` when missing — no DB
call. Real verification happens in the page. See [[auth]].
