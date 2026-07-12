# Data Flow

Concrete end-to-end lifecycles. For the two-paths overview see [[architecture]];
for the query/mutation building blocks see [[data-layer]]; for the DB functions
see [[database-and-migrations]].

## Catalog (`/`) — SSR seed + client search/pagination

1. **Server render.** `app/(web)/page.tsx` (`revalidate = 300`) calls
   `listItems()` directly (Drizzle, no HTTP), JSON-serializes it, and renders
   `<CatalogModule initialData={...} />`.
2. **Hydration.** `CatalogModule` (`'use client'`) runs
   `useQuery(itemsQueryOptions(search, page))` with `placeholderData:
   keepPreviousData`. For the unsearched first page (`search === '' && page === 1`)
   it uses the server `initialData`, so no client fetch happens on load.
3. **Search / paginate.** Changing `search` (react-hook-form submit) or `page`
   changes the query key `[EEntityKey.QUERY_ITEMS, { search, page }]`. TanStack
   Query refetches via `fetchItems` → `fetcher('/api/items?...')` →
   `GET /api/items` → `listItems({ search, page })` → Drizzle. `keepPreviousData`
   keeps the old grid on screen while the next page loads.
4. **Empty state.** Zero results render “No books found.”

## Item detail (`/items/[id]`) — SSR seed + favorite count

1. `app/(web)/items/[id]/page.tsx` (`revalidate = 60`) calls `getItemById(id)` and
   `getFavoriteCount(id)`, combines them into an `IItemDetail` `initialData`, and
   renders `<ItemDetailsModule initialData={...} />`.
2. `ItemDetailsModule` seeds `useQuery(itemQueryOptions(id))` from `initialData`.
   The `favoriteCount` shown here is the same cache entry the favorite toggle
   optimistically bumps (below).

## Favorites — optimistic mutations

Backing queries: `favoriteIdsQueryOptions()` (`[QUERY_FAVORITE_IDS]`, drives
toggle state) and `favoritesQueryOptions()` (`[QUERY_FAVORITES]`, the list). Both
in [[data-layer]].

**Toggle (`useToggleFavoriteMutation(itemId, isFavorite)`)** — used by the
`favorite-button` feature on cards and the detail page:
- `mutationFn` calls `addFavoriteRequest` or `removeFavoriteRequest`
  (`POST` / `DELETE /api/favorites`).
- **onMutate (optimistic):** cancels the ids + item-detail queries; adds/removes
  `itemId` in the cached `QUERY_FAVORITE_IDS` list; if the item detail is cached,
  bumps its `favoriteCount` by `delta = isFavorite ? -1 : +1`. Returns the prior
  values for rollback.
- **onError:** restores `previousIds` and `previousItem`.
- **onSettled:** invalidates `QUERY_FAVORITE_IDS`, `QUERY_FAVORITES`, and the
  item-detail key so the server truth reconciles.

**Remove from the list (`useRemoveFavoriteMutation`)** — used in `FavoritesModule`:
optimistically filters the removed item out of the cached `QUERY_FAVORITES` list,
rolls back on error, and invalidates `QUERY_FAVORITES` + `QUERY_FAVORITE_IDS` on
settle.

**The favorites page** verifies the session server-side then renders
`FavoritesModule`, which client-fetches the list via
`useQuery(favoritesQueryOptions())` (no server prefetch). See [[routing]].

## Auth

Sign-in/up mutate the session cookie and then invalidate the query cache +
`router.refresh()`; `useSession()` reads the current user in the navbar and the
favorite button. Full flow in [[auth]].
