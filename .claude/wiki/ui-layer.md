# UI Layer — modules, widgets, features, shared, config

The rendered surface. Per FSD the layers compose downward: `modules` (page
domains) → `widgets` (composite UI) → `features` (single capabilities) →
`shared/components` (primitives). Data comes from [[data-layer]]; see
[[conventions-and-skills]] for naming.

## `modules/` — page-level domains (the page's client entry)

Each is the `'use client'` component a `(web)` page renders ([[routing]]).

- `catalog/` — `CatalogModule` (search form + paginated grid). Seeds from
  `initialData`, then drives `itemsQueryOptions`; renders `ItemCard`s. Empty state
  “No books found.” (See the fixed empty/short-page background note in the CSS.)
- `item-details/` — `ItemDetailsModule` (cover, metadata, favorite count, favorite
  toggle). Seeds `itemQueryOptions(id)` from `initialData`.
- `favorites/` — `FavoritesModule` (client-fetches `favoritesQueryOptions()`),
  with a module-private sub-component `elements/favorite-card/` (`FavoriteCard`)
  and `useRemoveFavoriteMutation`.
- `login/` · `register/` — `LoginModule` / `RegisterModule`: react-hook-form forms
  calling better-auth via `auth-client`, embedding `OAuthSignIn`, honoring
  `redirectTo`. Full flow in [[auth]].
- `not-found/` — `NotFoundModule` rendered by `app/(web)/not-found.tsx`.

Data flows in [[data-flow]].

## `widgets/` — reusable composite UI

- `navbar/` — `Navbar` (`'use client'`): brand + links, `useSession()`-driven
  auth actions (email + Sign out / Log in + Sign up), sign-out clears the query
  cache. Mounted in the root layout.
- `item-card/` — `ItemCard`: a catalog grid card (cover, title, description,
  link to detail) built on `CoverImage`.

## `features/` — single-purpose capabilities

- `favorite-button/` — `FavoriteButton({ itemId })` (`'use client'`): reads
  `useSession()`; when signed in, queries `favoriteIdsQueryOptions()`
  (`enabled: !!session`) to know `isFavorite` and fires
  `useToggleFavoriteMutation`; when signed out, shows “☆ Log in to favorite” →
  `/login?redirect=/favorites`.
- `oauth-sign-in/` — `OAuthSignIn({ redirectTo })`: GitHub button, renders `null`
  unless `NEXT_PUBLIC_GITHUB_CLIENT_ID` is set. Reused by both auth Modules.

## `shared/components/`

- `cover-image/` — `CoverImage({ src, alt })`: lazy `<img>` with a blur-in
  (`is-loading` → `is-loaded`) and an emoji fallback (`📚`, `cover--empty`) when
  `src` is null or the image errors.

(`shared/services/` and `shared/interfaces/` are the data side — see
[[database-and-migrations]] and [[data-layer]].)

## `config/`

- `env/` — client/server env split ([[conventions-and-skills]]).
- `fonts/font.ts` — `fontSans` = Google **Inter** (`--font-sans`, `display:
  swap`), applied on `<html>` in the layout.
- `styles/global.css` — the single global stylesheet (plain CSS, dark theme via
  CSS variables; no Tailwind). Holds all component classes (`.navbar`, `.card`,
  `.grid`, `.btn`, `.input`, …) and the ambient background.
