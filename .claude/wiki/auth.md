# Auth

better-auth wired end-to-end: a server instance backed by Drizzle/Postgres, a
`'use client'` browser client, a catch-all route handler, and an edge guard. Email
+ password is always on; GitHub OAuth is optional and self-disables when its env
vars are absent.

## Key files (`src/pkg/auth/`)

- `auth.ts` — the server `auth` instance (`betterAuth({...})`). Exports `auth` and
  the `Session` type. Configuration:
  - **Adapter:** `drizzleAdapter` over Postgres, using the shared `db` + `schema`
    from [[database-and-migrations]].
  - **Email/password:** enabled, min length 8.
  - **GitHub OAuth:** conditional — `githubId && githubSecret ? { github: {...} } : {}`.
    `githubId = envClient.NEXT_PUBLIC_GITHUB_CLIENT_ID` (public),
    `githubSecret = envServer.GITHUB_CLIENT_SECRET` (server-only). If either is
    missing, no social provider is registered.
  - **Session:** 7-day expiry, 1-day refresh.
  - **secret / baseURL:** `envServer.BETTER_AUTH_SECRET` / `envServer.BETTER_AUTH_URL`.
- `auth-client.ts` — `'use client'`. `createAuthClient` from `better-auth/react`,
  `baseURL = envClient.NEXT_PUBLIC_BETTER_AUTH_URL`. Exports `signIn`, `signUp`,
  `signOut`, `useSession`.
- `session.ts` — `getSession()` = `auth.api.getSession({ headers: await headers() })`.
  Server-side session verification against the DB.
- `index.ts` — **server-safe barrel**: re-exports `auth`, `Session`, `getSession`
  only. Client components import `./auth-client` directly so the server `auth`
  instance (which pulls the DB driver) never lands in the client bundle. This
  client/server import discipline is the same pattern the env config uses
  (see [[conventions-and-skills]]).

## The route handler

`app/(api)/api/auth/[...all]/route.ts` exports `GET` / `POST` from
`toNextJsHandler(auth)` — the entire better-auth HTTP surface under `/api/auth/*`
([[routing]]).

## Backing tables

Four better-auth tables live in `src/pkg/db/auth-schema.ts` — `user`, `session`,
`account`, `verification` — with **text ids and camelCase fields mapped to
snake_case columns** (matching `@better-auth/cli generate`). Detailed columns in
[[database-and-migrations]].

## Flows

**Sign in / sign up** (client Modules `login` / `register`, see [[ui-layer]]):
1. Form submits → `signIn.email({...})` / `signUp.email({...})` from `auth-client`.
2. The client hits `/api/auth/*`; `toNextJsHandler(auth)` validates/creates the
   user and sets the session cookie via the Drizzle adapter.
3. On success the Module clears/invalidates the TanStack Query cache, navigates to
   `redirectTo`, and calls `router.refresh()` so session-aware UI updates.
4. On error the better-auth error message is surfaced inline.

**GitHub OAuth** (`features/oauth-sign-in`, reused by both auth Modules): renders
`null` when `NEXT_PUBLIC_GITHUB_CLIENT_ID` is unset; otherwise a button calling
`signIn.social({ provider: 'github', callbackURL: redirectTo })`.

**Protected route (`/favorites`)** — two layers:
- `proxy.ts` edge middleware (`matcher: ['/favorites']`) checks only for the
  session cookie's presence and redirects to `/login?redirect=/favorites` if
  missing — no DB call.
- The page itself calls `getSession()` for the real DB-backed check before
  rendering `FavoritesModule`.

**Session read on the client:** `useSession()` (e.g. in the `navbar` widget and
`favorite-button` feature — see [[ui-layer]] and [[data-layer]]).
