# File & folder naming

How to name files and folders. Every rule is anchored to real code in `src/`. This is about the *name* of a file, not where it lives — for placement see the `*-structure` skills' `references/structure.md`.

## The pattern

Every implementation file is `<kebab-name>.<role>.<ext>`:

- **base** — kebab-case, matching the slice/folder it lives in (`item-card/item-card.component.tsx`).
- **role suffix** — a dotted token that declares the file's job (`.component`, `.module`, `.service`, `.api`, `.query`, `.mutation`, `.model`, `.interface`).
- **ext** — `.tsx` for anything rendering React, `.ts` otherwise.

Barrels are always the bare name `index.ts`. Next.js convention files keep their framework names (`page.tsx`, `layout.tsx`, `not-found.tsx`, `route.ts`).

## Suffixes present in this repo

Confirmed by `find src -type f`:

| Suffix | Role | Anchor |
|---|---|---|
| `*.module.tsx` | Module entry component | `src/app/modules/catalog/catalog.module.tsx` |
| `*.component.tsx` | React component | `src/app/widgets/item-card/item-card.component.tsx` |
| `*.service.ts` | Logic helpers, no React | `src/app/shared/services/items.service.ts` |
| `*.api.ts` | Raw fetchers | `src/app/entities/api/items/items.api.ts` |
| `*.query.ts` | `queryOptions` factories | `src/app/entities/api/items/items.query.ts` |
| `*.mutation.ts` | `useMutation` hooks | `src/app/entities/api/favorites/favorites.mutation.ts` |
| `*.model.ts` | Domain types/interfaces | `src/app/entities/models/item.model.ts` |
| `*.interface.ts` | Shared types/enums | `src/app/shared/interfaces/entities.interface.ts` |
| `env.client.ts` / `env.server.ts` | t3-env split | `src/config/env/env.client.ts` |
| `font.ts` | Font declarations | `src/config/fonts/font.ts` |
| `index.ts` | Barrel | every slice/segment folder |

## Next.js convention files (framework-named, no role suffix)

`page.tsx`, `layout.tsx`, `not-found.tsx` under `src/app/(web)/`; `route.ts` under `src/app/(api)/api/`. These keep the names Next.js requires — do not add a role suffix.

## Folders

- Folders are **kebab-case**: `favorite-button/`, `oauth-sign-in/`, `item-details/`, `cover-image/`, `query-provider/`.
- A slice folder name **equals** the file prefix inside it: `item-card/` → `item-card.component.tsx`; `catalog/` → `catalog.module.tsx`.
- Dynamic route segments use Next.js bracket syntax: `[id]/`, `[...all]/`.
- Route groups use parentheses: `(web)/`, `(api)/`.

## Suffixes defined elsewhere but not present here

The `*-structure` skills also define `*.store.ts`, `*.hook.ts(x)`, `*.util.ts`, `*.constant.ts`, and `*.pkg.ts`. None of these files exist in the repo today (verified: `find src -type f` shows no `.hook.`, `.store.`, `.util.`, `.constant.` files; constants live inline, e.g. `DEFAULT_PAGE_SIZE` in `items.service.ts`). If you add one, use the structure skill's suffix verbatim — do not coin a new variant.

## Drift notes

- **`pkg/*` uses plain `*.ts`, not `*.pkg.ts`.** The files under `src/pkg/` are bare kebab names: `auth-client.ts`, `auth.ts`, `session.ts` (`src/pkg/auth/`) and `client.ts`, `schema.ts`, `auth-schema.ts` (`src/pkg/db/`). The `client-structure` skill documents a `*.pkg.ts` public-surface suffix; this repo does not use it. Anchor on the code — keep `pkg/*` files as plain kebab `*.ts` to match what's there, unless a task says otherwise.
- **Shared UI folder is `shared/ui/`, not `shared/components/`.** File suffix is still `*.component.tsx` (`src/app/shared/ui/cover-image/cover-image.component.tsx`). Folder location is a placement concern (see the structure skill); the file-naming suffix is unaffected.
- **Root middleware file is `src/proxy.ts`, not `src/middleware.ts`.** It exports `proxy` and `config`. This is a naming/placement drift from the structure skill's `middleware.ts`; note it but don't rename existing files as part of an unrelated task.
