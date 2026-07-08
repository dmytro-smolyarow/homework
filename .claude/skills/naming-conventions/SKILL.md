---
name: naming-conventions
description: Use when creating or renaming any file, React component, interface, type, enum, or constant; deciding what to call an identifier or a file; choosing a file-name suffix (.component.tsx, .module.tsx, .service.ts, .query.ts, .mutation.ts, .api.ts, .model.ts, .interface.ts); naming component props, a query-options factory, a mutation hook, a fetcher, or a query-key enum; or auditing existing names for consistency across the client/server/worker apps that share this vocabulary. Even if the user doesn't say "naming" or "convention" explicitly — if they're introducing or reviewing an identifier or file name in this Next.js/React FSD codebase, use this skill. Skip for pure logic edits that add no new names, dependency bumps, and non-code files.
---

# naming-conventions

The cross-cutting **naming** vocabulary for this Next.js/React FSD codebase: how to name identifiers (interfaces, enums, types, components, functions, constants) and how to name files (role suffixes + casing). The three apps share one vocabulary, so these rules travel unchanged.

Names in this document are placeholders. `<Name>`, `<name>`, `<api>`, `<entity>`, `I<Name>`, `E<Name>` stand in for the thing being named — the skill describes the pattern, not specific names.

This skill governs **naming only**. For *where* a file lives (Layer/Slice/Segment placement, import direction) see the `*-structure` skills' `references/structure.md`. For comment-label style see `.claude/skills/client-structure/references/comments.md` — not restated here.

## Hard rules

Six invariants that hold for every name in the codebase. One line each; detail lives in `references/`.

1. **Interfaces are `I`-prefixed** — every `interface` is `I<Name>` (`IProps`, `IItem`, `ILoginForm`). Anchor: `src/app/entities/models/item.model.ts` (`IItem`), `src/app/modules/login/login.module.tsx` (`ILoginForm`, `IProps`).
2. **Enums are `E`-prefixed** — every `enum` is `E<Name>`; members are `UPPER_SNAKE_CASE`. Anchor: `src/app/shared/interfaces/entities.interface.ts` (`EEntityKey.QUERY_ITEMS`).
3. **`type` aliases take no prefix** — a `type` alias is PascalCase with **no** `I`/`E` (`ListItemsParams`, `Session`). The `I` prefix is for `interface` only. Anchor: `src/app/shared/services/items.service.ts` (`type ListItemsParams`).
4. **Component signature is fixed** — `const <Name>: FC<Readonly<IProps>> = (props) => {}` (pages: `NextPage`, `async`), first line `const { … } = props;`. Anchor: `src/app/widgets/item-card/item-card.component.tsx`.
5. **File name = kebab base + dotted role suffix** — `<kebab-name>.<role>.tsx?` (`item-card.component.tsx`, `favorites.query.ts`); folders are kebab-case and match the file prefix. Barrels are always `index.ts`. Anchor: any slice folder under `src/app/`.
6. **Casing by kind** — PascalCase for components/types/enums, camelCase for functions/variables/`config` exports, `UPPER_SNAKE_CASE` for module-level constants and enum members, kebab-case for folders + file basenames.

## Identifier naming (quick reference)

| Kind | Rule | Real example | Anchor |
|---|---|---|---|
| `interface` | `I<Name>`, PascalCase | `IProps`, `IItemDetail`, `IFavoriteRow` | `entities/models/item.model.ts` |
| `enum` | `E<Name>`, members `UPPER_SNAKE` | `EEntityKey.QUERY_ITEM` | `shared/interfaces/entities.interface.ts` |
| `type` alias | PascalCase, **no** prefix | `ListItemsParams`, `Session` | `shared/services/items.service.ts` |
| React component | PascalCase identifier | `ItemCard`, `Navbar`, `CoverImage` | `widgets/item-card/item-card.component.tsx` |
| Module component | PascalCase + `Module` suffix | `CatalogModule`, `LoginModule` | `modules/catalog/catalog.module.tsx` |
| Component props | always `IProps` (local) | `IProps` | every `*.component.tsx` / `*.module.tsx` |
| Function / fetcher | camelCase, verb-first | `listItems`, `getItemById`, `fetchItems` | `entities/api/items/items.api.ts` |
| Query-options factory | `<name>QueryOptions` (camelCase) | `itemsQueryOptions`, `favoriteIdsQueryOptions` | `entities/api/items/items.query.ts` |
| Mutation hook | `use<Action>Mutation` | `useToggleFavoriteMutation` | `entities/api/favorites/favorites.mutation.ts` |
| Module-level constant | `UPPER_SNAKE_CASE` | `DEFAULT_PAGE_SIZE`, `UUID_RE` | `shared/services/items.service.ts` |
| `config` export | camelCase | `envClient`, `envServer`, `fontSans` | `config/env/*`, `config/fonts/font.ts` |
| Barrel re-export | `export { default as <Name> } from …` | `export { default as ItemCard }` | any slice `index.ts` |

Full detail, edge cases, and the query-key convention: `references/identifiers.md`.

## File naming (suffix = role)

Only the suffixes **actually present** in this repo are listed. Each is `<kebab-name>.<suffix>`.

| Suffix | Role | Where | Anchor |
|---|---|---|---|
| `*.module.tsx` | Module entry component | `modules/<module>/` | `modules/catalog/catalog.module.tsx` |
| `*.component.tsx` | React component | features, widgets, shared UI, module `elements/` | `features/favorite-button/favorite-button.component.tsx` |
| `*.service.ts` | Logic helpers (no React) | `shared/services/` | `shared/services/items.service.ts` |
| `*.api.ts` | Raw fetchers | `entities/api/<api>/` | `entities/api/items/items.api.ts` |
| `*.query.ts` | `queryOptions` factories | `entities/api/<api>/` | `entities/api/items/items.query.ts` |
| `*.mutation.ts` | `useMutation` hooks (`'use client'`) | `entities/api/<api>/` | `entities/api/favorites/favorites.mutation.ts` |
| `*.model.ts` | Domain types/interfaces | `entities/models/` | `entities/models/item.model.ts` |
| `*.interface.ts` | Shared types/enums | `shared/interfaces/` | `shared/interfaces/entities.interface.ts` |
| `page.tsx` / `layout.tsx` / `not-found.tsx` | Next.js conventions | `app/(web)/` | `app/(web)/page.tsx` |
| `route.ts` | Next.js route handler | `app/(api)/api/` | `app/(api)/api/items/route.ts` |
| `env.client.ts` / `env.server.ts` | t3-env split | `config/env/` | `config/env/env.client.ts` |
| `index.ts` | Barrel | every slice/segment | any slice folder |

Suffixes defined by the `*-structure` skills but **not yet instantiated** here (`*.store.ts`, `*.hook.ts(x)`, `*.util.ts`, `*.constant.ts`, `*.pkg.ts`): if you introduce one, follow that skill's suffix — do not invent a variant. `pkg/*` in this repo uses plain kebab `*.ts` files (`auth-client.ts`, `session.ts`), not `*.pkg.ts` — see the drift note in `references/file-naming.md`.

Full detail and drift notes: `references/file-naming.md`.

## Self-verification

After adding or renaming a name, self-verify against `spec/`:
1. **`spec/invariants.spec.md`** — global naming invariants (prefixes, casing, suffixes, component signature, barrels).
2. **`spec/per-action.spec.md`** — the block matching what you did (`+interface/type`, `+enum`, `+component/module`, `+entity api`, `+file`).

Each spec item is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue). Confirm each before declaring done.

## Common mistakes

| Mistake | Reality |
|---|---|
| `type Foo` written as `IFoo` | `I` prefix is for `interface` only; `type` aliases take no prefix. |
| `interface Foo` with no `I` | Every interface is `I<Name>`. |
| Enum without `E` / lowercase members | Enums are `E<Name>`; members are `UPPER_SNAKE_CASE`. |
| Naming component props anything but `IProps` | Local component props are always `IProps`. |
| `const X = (props: IProps) => {}` destructuring in the arg | Signature is `FC<Readonly<IProps>>`; destructure on the first body line: `const { … } = props;`. |
| Adding a `Component` suffix to a component identifier | Only **modules** carry the `Module` suffix; other components are plain PascalCase (`ItemCard`, not `ItemCardComponent`). |
| camelCase or `snake_case` folder names | Folders are kebab-case and equal the file prefix. |
| Suffix-less implementation file | Every implementation file carries its role suffix; barrels are `index.ts`. |
| Query factory named `useItemsQuery` | Query-options factories are `<name>QueryOptions`; the `use…Query`/`use…Mutation` prefix is for hooks (mutations use `use<Action>Mutation`). |
| Module-level constant in camelCase | Module-level constants and enum members are `UPPER_SNAKE_CASE`. |

The *why* behind each rule lives in `references/identifiers.md` and `references/file-naming.md`.

## Resources

This SKILL is the router. The two reference files and the two spec files are independent — they do **not** reference one another.

| Situation | Open |
|---|---|
| Naming an **identifier** (interface / enum / type / component / function / constant / query / mutation) | `references/identifiers.md` |
| Naming or renaming a **file or folder** (which suffix, casing, barrels) | `references/file-naming.md` |
| **Verifying** names after a change | `spec/invariants.spec.md` + the matching block in `spec/per-action.spec.md` |
| **Where** a file lives (placement, import direction) | the `*-structure` skills' `references/structure.md` |
| **Comment-label** style | `.claude/skills/client-structure/references/comments.md` |
