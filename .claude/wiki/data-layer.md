# Data Layer — entities, query & fetch integrations

The client-side data layer: TanStack Query options/mutations per resource, the
domain models they return, the central query-key enum, and the two `pkg/`
integrations they lean on. How these compose into screens is in [[data-flow]].

## `entities/api/` — one folder per resource

Per the `client-structure` skill: `*.api.ts` raw fetchers · `*.query.ts`
`queryOptions` factories · `*.mutation.ts` `useMutation` hooks (`'use client'`) ·
`index.ts` barrel. See [[conventions-and-skills]].

**`items/`** (read-only)
- `items.api.ts` — `fetchItems(search, page)` → `GET /api/items`,
  `fetchItem(id)` → `GET /api/items/[id]`. Both call `fetcher<T>()`.
- `items.query.ts` — `itemsQueryOptions(search, page)`
  (`queryKey: [QUERY_ITEMS, { search, page }]`) and `itemQueryOptions(id)`
  (`queryKey: [QUERY_ITEM, id]`).
- No mutation file — items are not edited from the client.

**`favorites/`** (read + write)
- `favorites.api.ts` — `fetchFavorites`, `fetchFavoriteIds`,
  `addFavoriteRequest(itemId)` (`POST`), `removeFavoriteRequest(itemId)`
  (`DELETE`). All via `fetcher`.
- `favorites.query.ts` — `favoritesQueryOptions()` (`[QUERY_FAVORITES]`) and
  `favoriteIdsQueryOptions()` (`[QUERY_FAVORITE_IDS]`).
- `favorites.mutation.ts` (`'use client'`) — `useToggleFavoriteMutation(itemId,
  isFavorite)` and `useRemoveFavoriteMutation()`, both with optimistic
  cache updates + rollback (mechanics in [[data-flow]]).

Query/api files carry no `'use client'` so they stay composable on the server;
only the mutation file is client-tagged.

## `entities/models/` — domain types (no runtime code)

- `item.model.ts` — `IItem { id, title, description|null, imageUrl|null,
  createdAt }`; `IItemsResponse` (the paginated list shape returned by
  `listItems`); `IItemDetail extends IItem { favoriteCount }`.
- `favorite.model.ts` — `IFavoriteRow { favoriteId, createdAt, item: IItem }`.

These type both the client fetchers here and, structurally, the
`shared/services` return shapes in [[database-and-migrations]].

## Query keys — `EEntityKey`

`src/app/shared/interfaces/entities.interface.ts` centralizes every key:

```
QUERY_ITEMS = 'query-items'
QUERY_ITEM = 'query-item'
QUERY_FAVORITES = 'query-favorites'
QUERY_FAVORITE_IDS = 'query-favorite-ids'
```

All `queryOptions` factories and mutation cache operations source their keys from
this enum, so invalidations stay consistent.

## `pkg/fetcher` — the HTTP client

`fetcher.service.ts` exports `fetcher<T>(url, options?)`: a thin wrapper over
native `fetch` that throws on non-2xx (`Request failed: <status>`) and parses the
body as JSON only when `content-type` is `application/json` (so `void` POST/DELETE
calls are safe). Every `*.api.ts` fetcher goes through it — there is no other HTTP
client in the app.

## `pkg/tanstack` — the provider

`tanstack.provider.tsx` (`'use client'`) exports `QueryProvider`: a `QueryClient`
created in `useState` with defaults `staleTime: 30s`, `refetchOnWindowFocus:
false`. Mounted once in the root `layout.tsx` ([[architecture]]) so every page
shares one client.
