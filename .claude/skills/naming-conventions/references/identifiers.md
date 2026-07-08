# Identifier naming

How to name every kind of symbol in this codebase. Every rule below is anchored to real code in `src/`. Placeholders: `<Name>` (PascalCase), `<name>` (camelCase/kebab), `<api>`, `<entity>`, `<Action>`.

## Interfaces — `I<Name>`

Every `interface` is prefixed `I`, PascalCase after the prefix. No exceptions found in the codebase.

- Component props are **always** the local name `IProps` (`src/app/widgets/item-card/item-card.component.tsx`, `src/app/(web)/layout.tsx`, and every other component/module).
- Form shapes are `I<Domain>Form` (`ILoginForm`, `IRegisterForm`, `ISearchForm` in `src/app/modules/login/login.module.tsx`, `.../register/register.module.tsx`, `.../catalog/catalog.module.tsx`).
- Domain/entity shapes are `I<Entity>` (`IItem`, `IItemsResponse`, `IItemDetail`, `IFavoriteRow` in `src/app/entities/models/`). `IItemDetail extends IItem`.

## Enums — `E<Name>`, members `UPPER_SNAKE_CASE`

Every `enum` is prefixed `E`. Members are `UPPER_SNAKE_CASE`; string values may be kebab-case.

- Only one enum exists today: `EEntityKey` in `src/app/shared/interfaces/entities.interface.ts`, with members `QUERY_ITEMS`, `QUERY_ITEM`, `QUERY_FAVORITES`, `QUERY_FAVORITE_IDS` and string values `"query-items"` etc.

## `type` aliases — PascalCase, no prefix

A `type` alias takes **no** `I`/`E` prefix — the `I` prefix belongs to `interface` only. Distinguishing the two is the single most common naming slip.

- `type ListItemsParams = { … }` — `src/app/shared/services/items.service.ts`.
- `type Session = typeof auth.$Infer.Session` — `src/pkg/auth/auth.ts`.

Rule of thumb: if it's declared with the `interface` keyword it gets `I`; if declared with `type` it does not.

## React components

Identifier is PascalCase and declared with the fixed signature:

```
const <Name>: FC<Readonly<IProps>> = (props) => {
  const { … } = props;
  …
}

export default <Name>;
```

- Props are typed `Readonly<IProps>` inside `FC<…>`; destructuring happens on the **first body line** (`const { children } = props;`), never in the parameter list. Anchors: `src/app/shared/components/cover-image/cover-image.component.tsx`, `src/app/features/favorite-button/favorite-button.component.tsx`.
- The file has a `export default <Name>` at the bottom; the slice `index.ts` re-exports it as a **named** export: `export { default as <Name> } from './<name>.component'`.

### Component identifier suffix — drift note

The `client-structure` skill's symbol table says components carry a `Component`/`Module` suffix. In the actual code only **modules** carry the `Module` suffix; plain components do **not** carry a `Component` suffix:

- Modules: `CatalogModule`, `LoginModule`, `RegisterModule`, `ItemDetailsModule`, `FavoritesModule`, `NotFoundModule` (files `*.module.tsx`).
- Components (features/widgets/shared/elements): `ItemCard`, `Navbar`, `FavoriteButton`, `OAuthSignIn`, `CoverImage`, `QueryProvider`, `FavoriteCard` — plain PascalCase, file `*.component.tsx`, **no** `Component` suffix.

Anchor on the code: name modules `<Name>Module`, name every other component with a bare PascalCase noun.

## Pages & Next.js convention files

- App Router pages: `const Page: NextPage<Readonly<IProps>> = async (props) => {}`, `export default Page`. The identifier is literally `Page` (`src/app/(web)/items/[id]/page.tsx`, `.../login/page.tsx`).
- Layout: `const RootLayout: FC<Readonly<IProps>> = (props) => {}` (`src/app/(web)/layout.tsx`).
- `not-found.tsx` uses the Next.js form `export default function NotFound() {}` (`src/app/(web)/not-found.tsx`).
- Route handlers export the HTTP verb uppercase: `export async function GET(request: NextRequest)` (`src/app/(api)/api/items/route.ts`); combined handlers `export const { GET, POST } = …` (`src/app/(api)/api/auth/[...all]/route.ts`).

## Functions & fetchers — camelCase, verb-first

Service and fetcher functions are camelCase and start with a verb.

- Service functions: `listItems`, `getItemById`, `getFavoriteCount` (`src/app/shared/services/items.service.ts`).
- Read fetchers are `fetch<Thing>`: `fetchItems`, `fetchItem`, `fetchFavorites`, `fetchFavoriteIds` (`src/app/entities/api/*/*.api.ts`).
- Write fetchers observed with a `Request` suffix: `addFavoriteRequest`, `removeFavoriteRequest` (`src/app/entities/api/favorites/favorites.api.ts`).

Drift note: fetcher naming is not perfectly uniform (`fetch<Thing>` for reads vs `<verb><Thing>Request` for writes). The stable part is **camelCase, verb-first**; don't over-formalise the suffix.

## TanStack Query symbols

- Query-options factories: `<name>QueryOptions`, camelCase, exported `const` returning `queryOptions(...)`: `itemsQueryOptions`, `itemQueryOptions`, `favoritesQueryOptions`, `favoriteIdsQueryOptions` (`src/app/entities/api/*/*.query.ts`).
- Mutation hooks: `use<Action>Mutation`: `useToggleFavoriteMutation`, `useRemoveFavoriteMutation` (`src/app/entities/api/favorites/favorites.mutation.ts`).
- Query keys come from the single `EEntityKey` enum, never inline string literals, so all keys live in one place (`src/app/shared/interfaces/entities.interface.ts`; consumed in `favorites.mutation.ts` as `[EEntityKey.QUERY_ITEM, itemId]`).

## Constants — `UPPER_SNAKE_CASE`

Module-level constants (exported or private) are `UPPER_SNAKE_CASE`:

- `DEFAULT_PAGE_SIZE` (exported) and `UUID_RE` (module-private regex) in `src/app/shared/services/items.service.ts`.
- Enum members follow the same casing (`EEntityKey.QUERY_ITEMS`).

Local variables and function-scoped bindings stay camelCase (`const where = …`, `const offset = …`).

## `config/` exports — camelCase

Configuration objects are camelCase named exports:

- `envClient`, `envServer` (`src/config/env/env.client.ts`, `env.server.ts`) — validated via `@t3-oss/env-nextjs`. Env **variable keys** are `NEXT_PUBLIC_*` (client) / plain `UPPER_SNAKE` (server); the exported binding is camelCase.
- `fontSans` (`src/config/fonts/font.ts`).
