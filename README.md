# BookShelf — mini full-stack catalog

A tiny full-stack catalog app built for the homework assignment. Theme: **programming books**.

Browse a public list of books, open a details page for any book, sign up / log in,
and save books to your personal **favorites** (auth-only, stored per user).

## Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Framework        | Next.js 16 (App Router, Server Components)   |
| Client data/cache| TanStack Query (`@tanstack/react-query`)     |
| Forms            | react-hook-form                              |
| Auth             | Better Auth (email + password)               |
| Database         | Supabase (Postgres)                          |
| ORM              | Drizzle ORM + Drizzle Kit                    |
| Language         | TypeScript                                   |

All queries to `items` and `favorites` go **through Drizzle only** — no raw SQL
and no `supabase-js` client for these tables. Supabase is used purely as the
Postgres host.

## Routes

| Route                 | Purpose                          | Access        |
| --------------------- | -------------------------------- | ------------- |
| `/`                   | Book list                        | public        |
| `/items/[id]`         | Book details                     | public        |
| `/favorites`          | Current user's favorites         | authenticated |
| `/login`              | Login form                       | public        |
| `/register`           | Registration form                | public        |
| `/api/auth/[...all]`  | Better Auth route handler        | —             |
| `/api/items`          | List items (search + pagination) | public        |
| `/api/items/[id]`     | Single item (+ favorite count)   | public        |
| `/api/favorites`      | GET / POST / DELETE favorites    | authenticated |
| `/api/favorites/ids`  | Favorited item ids (toggle state)| authenticated |

`/favorites` is protected two ways: a lightweight cookie check in
[`src/proxy.ts`](src/proxy.ts) (Next.js 16 renamed `middleware.ts` → `proxy.ts`)
that redirects to `/login`, **and** a server-side session check inside the page
itself.

## Architecture

The code follows the team's layered client architecture (see `.claude/client.md`):
**layers → slices → segments**, where a layer may only import from layers below it.

```
src/
├── app/
│   ├── (web)/         # routing: thin pages + root layout
│   ├── (api)/api/     # route handlers (Better Auth, items, favorites)
│   ├── modules/       # business logic per page: catalog, item-details, favorites, login, register
│   ├── widgets/       # self-sufficient UI: navbar, item-card
│   ├── features/      # small reusable pieces: favorite-button
│   ├── entities/      # api/ (fetch + React Query hooks) + models/ (domain types)
│   └── shared/        # ui/ (query-provider) and other reusable code
├── config/            # env (client/server), styles/global.css
├── pkg/               # external integrations: db (Drizzle client + services), auth (Better Auth)
└── proxy.ts           # route protection (Next.js 16 middleware)
```

Naming: `*.module.tsx`, `*.component.tsx`, `*.api.ts`, `*.query.ts`, `*.mutation.ts`,
`*.model.ts`, `*.service.ts`; kebab-case directories; each slice exposes an `index.ts` barrel.
Pages stay thin — server-side Drizzle fetch happens in the page, all rendering/logic lives in modules.

> Note: server-side data access (Drizzle client + query repositories) lives in `pkg/db`
> since the client guide is UI-oriented and doesn't define a server data-access slot;
> `pkg` is the lowest layer, importable by both route handlers and server pages.

## Data model (Drizzle)

Besides the Better Auth tables (`user`, `session`, `account`, `verification`):

- **`items`** — `id` (uuid PK), `title` (not null), `description`, `image_url` (nullable), `created_at`
- **`favorites`** — `id` (uuid PK), `user_id` (FK → `user.id`), `item_id` (FK → `items.id`), `created_at`,
  with a **unique index on `(user_id, item_id)`** so an item can't be favorited twice.

Schema lives in [`src/pkg/db/schema.ts`](src/pkg/db/schema.ts) and
[`src/pkg/db/auth-schema.ts`](src/pkg/db/auth-schema.ts).

## Environment variables

Copy `.env.example` → `.env.local` and fill in the values:

| Variable              | What it is                                                             |
| --------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`        | Supabase **transaction pooler** string (port `6543`, `pgbouncer=true`) — runtime |
| `DIRECT_URL`          | Supabase **session pooler / direct** string (port `5432`) — migrations |
| `BETTER_AUTH_SECRET`  | Random secret, **≥ 32 chars** (see command below)                     |
| `BETTER_AUTH_URL`     | App base URL (server side), e.g. `http://localhost:3000`              |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | App base URL exposed to the browser (Better Auth client)      |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | **Optional** — GitHub OAuth client id (public; shows the GitHub button) |
| `GITHUB_CLIENT_SECRET`| **Optional** — GitHub OAuth app client secret                      |

Get both connection strings from Supabase → **Connect** → ORMs / Connection string.
Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### GitHub OAuth (optional bonus)

Create an OAuth App at **GitHub → Settings → Developer settings → OAuth Apps**:

- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`

Put the client id into `NEXT_PUBLIC_GITHUB_CLIENT_ID` and the secret into
`GITHUB_CLIENT_SECRET` in `.env.local`, then **restart the dev server** (env is
read at startup). When both are set, a **Continue with GitHub** button appears on
`/login` and `/register`; leave them blank and the button is hidden and the app
runs with email + password only.

> `.env.local` is git-ignored — secrets are never committed. Only `.env.example`
> (without values) is in the repo.

## Getting started

```bash
# 1. install deps
npm install

# 2. create your env file and fill it in
cp .env.example .env.local

# 3. apply the database schema to Supabase
npm run db:generate   # generate SQL migration from the Drizzle schema
npm run db:migrate    # apply migrations (non-interactive)
# (alternatively: npm run db:push to push the schema directly)

# 4. seed the items table (12 books)
npm run db:seed

# 5. run the dev server
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start Next.js dev server                     |
| `npm run build`     | Production build                             |
| `npm run start`     | Start production server                      |
| `npm run db:generate` | Generate Drizzle migration SQL             |
| `npm run db:migrate`  | Apply migrations                           |
| `npm run db:push`     | Push schema directly (interactive)         |
| `npm run db:studio`   | Open Drizzle Studio                        |
| `npm run db:seed`     | Seed the `items` table                     |

## How the requirements are met

- **Server Components** render the initial book list (`/`) and details
  (`/items/[id]`) via Drizzle; the data hydrates into TanStack Query on the client.
- **TanStack Query** `useQuery` reads lists/details/favorites; `useMutation`
  adds/removes favorites with **cache invalidation** and **optimistic updates
  with rollback** (see [`favorites.mutation.ts`](src/app/entities/api/favorites/favorites.mutation.ts)
  and [`favorite-button.component.tsx`](src/app/features/favorite-button/favorite-button.component.tsx)).
- **react-hook-form** powers `/login` and `/register` with validation (email
  format, min password length, confirm-password) and surfaces Better Auth errors.
- **Better Auth** uses `drizzleAdapter(db, { provider: "pg", schema })`, email +
  password, and the `toNextJsHandler(auth)` route handler.

## Bonus features implemented

- 🔍 Search / filter by title (react-hook-form form + query params)
- 📄 Pagination via TanStack Query
- ⚡ Optimistic favorite toggle with rollback on error
- 🔢 "Favorited N times" counter on the details page
- 🔐 GitHub OAuth via Better Auth (optional — see setup above)
