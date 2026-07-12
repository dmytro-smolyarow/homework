# Database & Migrations

Postgres (Supabase) accessed through **Drizzle ORM** (`postgres-js`). The database
is reached from exactly one place in the app — `shared/services` — which both the
`(api)` route handlers and the RSC pages call ([[architecture]], [[routing]]).

## Client (`src/pkg/db/`)

- `client.ts` — `postgres(envServer.DATABASE_URL, { prepare: false })` then
  `drizzle(client, { schema })`. **`prepare: false`** because the Supabase
  transaction pooler (pgbouncer) does not support prepared statements.
- `schema.ts` — application tables + Drizzle relations (below).
- `auth-schema.ts` — the better-auth tables (below); see [[auth]].
- `index.ts` — exports `db` and `schema`.

## Schema (`schema.ts`)

**`items`** (catalog books)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `title` | text | not null |
| `description` | text | nullable |
| `image_url` (`imageUrl`) | text | nullable |
| `created_at` (`createdAt`) | timestamp | not null, default `now()` |

**`favorites`** (user ↔ item)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `user_id` (`userId`) | text | not null, FK → `user.id` ON DELETE cascade |
| `item_id` (`itemId`) | uuid | not null, FK → `items.id` ON DELETE cascade |
| `created_at` (`createdAt`) | timestamp | not null, default `now()` |

Unique index `favorites_user_item_unique` on `(user_id, item_id)` — a user can
favorite an item at most once. `itemsRelations` / `favoritesRelations` declare the
one-to-many item↔favorites and the favorite→item / favorite→user links.

## Auth tables (`auth-schema.ts`)

`user`, `session`, `account`, `verification` — matching `@better-auth/cli
generate`. better-auth uses **text ids and camelCase fields mapped to snake_case
columns**. Highlights: `user.email` unique; `session.token` unique;
`session.userId` / `account.userId` FK → `user.id` ON DELETE cascade. Consumed by
the Drizzle adapter in [[auth]].

## Services (`src/app/shared/services/`)

The only DB-touching code. Pure async functions over Drizzle, exported via
`index.ts`.

`items.service.ts`:
- `DEFAULT_PAGE_SIZE = 8`.
- `listItems({ search?, page=1, pageSize=8 })` — optional `ilike` title search,
  `ORDER BY created_at DESC`, offset pagination (`offset = (page-1)*pageSize`);
  returns `{ items, total, page, pageSize, totalPages }`.
- `getItemById(id)` — guards `id` against a UUID regex first (a malformed id is
  “not found”, never sent to the uuid column), then selects one row or `null`.
- `getFavoriteCount(itemId)` — `count()` of favorites for an item.

`favorites.service.ts`:
- `listFavorites(userId)` — favorites inner-joined with `items`, newest first.
- `listFavoriteItemIds(userId)` — just the item ids (toggle state).
- `addFavorite(userId, itemId)` — insert with `onConflictDoNothing` on the unique
  target (no-op if already favorited); returns the row or `null`.
- `removeFavorite(userId, itemId)` — delete by `(userId, itemId)`.

## Migrations & seed

- `drizzle.config.ts` — `dialect: 'postgresql'`, `schema: './src/pkg/db/schema.ts'`,
  `out: './drizzle'`, `verbose`+`strict`. Loads `.env.local` and uses
  `DIRECT_URL ?? DATABASE_URL` — the **direct/session connection (port 5432), not
  the pgbouncer pooler**, because DDL needs a real session.
- `drizzle/0000_thick_hardball.sql` — the initial migration (creates the tables +
  the `favorites_user_item_unique` index).
- `scripts/seed.ts` — standalone `tsx` script (loads `.env.local`, builds its own
  `prepare:false` client with `DIRECT_URL ?? DATABASE_URL`). Deletes all `items`
  and inserts 12 programming books.
- npm scripts (`db:generate` / `db:push` / `db:migrate` / `db:studio` / `db:seed`)
  are listed in [[conventions-and-skills]].
