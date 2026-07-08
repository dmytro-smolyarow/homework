# Spec: global naming invariants

Declarative naming rules that hold for **every** name in the codebase. After any change that adds or renames a symbol or file, self-verify against this list. Each rule is a `MUST` / `MUST NOT` with a **Check** hint (grep pattern or visual cue) — no script to run, the model reads and confirms.

## Interfaces & enums

- **MUST** prefix every `interface` with `I` (`I<Name>`, PascalCase).
  Check: `grep -rn "interface " src` — every hit reads `interface I…`.
- **MUST** prefix every `enum` with `E`, with `UPPER_SNAKE_CASE` members.
  Check: `grep -rn "enum " src` — every hit reads `enum E…`; members are `UPPER_SNAKE`.
- **MUST NOT** prefix a `type` alias with `I` or `E` — `type` aliases are bare PascalCase.
  Check: `grep -rn "type [A-Z]" src` shows no `type I…` / `type E…` (e.g. `ListItemsParams`, `Session`).

## Components

- **MUST** name component props `IProps` (local interface in the component file).
  Check: each `*.component.tsx` / `*.module.tsx` declares `interface IProps`.
- **MUST** use the signature `const <Name>: FC<Readonly<IProps>> = (props) => {}` (pages: `NextPage`, `async`), destructuring on the first body line `const { … } = props;`.
  Check: `grep -rn "FC<Readonly<IProps>>\|NextPage<Readonly<IProps>>" src`; no destructuring in the parameter list.
- **MUST** suffix a **module** component identifier with `Module` (`<Name>Module`); **MUST NOT** add a `Component` suffix to other component identifiers.
  Check: `modules/*` identifiers end in `Module`; `widgets|features|shared/components|elements` identifiers are bare PascalCase (`ItemCard`, not `ItemCardComponent`).
- **MUST** re-export a component from its slice `index.ts` as a named export: `export { default as <Name> } from './<name>.…'`.
  Check: each slice `index.ts` uses `export { default as … }`.

## Functions, queries, constants

- **MUST** name functions/fetchers camelCase, verb-first (`listItems`, `fetchItem`).
- **MUST** name query-options factories `<name>QueryOptions` and mutation hooks `use<Action>Mutation`.
  Check: `grep -rn "QueryOptions\|Mutation" src/app/entities/api` — factories end `QueryOptions`, hooks start `use…Mutation`.
- **MUST** source TanStack query keys from the `EEntityKey` enum, not inline string literals.
  Check: `grep -rn "queryKey" src/app/entities/api` references `EEntityKey.*`.
- **MUST** name module-level constants and enum members `UPPER_SNAKE_CASE`; local variables stay camelCase.
  Check: exported top-level `const` values that are static are `UPPER_SNAKE` (`DEFAULT_PAGE_SIZE`).

## Casing

- **MUST** use PascalCase for components/types/enums, camelCase for functions/variables and `config` exports (`envClient`, `fontSans`), `UPPER_SNAKE_CASE` for module-level constants & enum members, kebab-case for folders + file basenames.

## Files & folders

- **MUST** name implementation files `<kebab-name>.<role>.<ext>` with a role suffix (`.module.tsx`, `.component.tsx`, `.service.ts`, `.api.ts`, `.query.ts`, `.mutation.ts`, `.model.ts`, `.interface.ts`); barrels are `index.ts`; Next.js files keep framework names (`page.tsx`, `layout.tsx`, `not-found.tsx`, `route.ts`).
  Check: `find src -type f` — no suffix-less implementation file outside Next.js conventions / barrels.
- **MUST** use kebab-case folder names, with the slice folder name equal to the file prefix.
  Check: `item-card/item-card.component.tsx` — folder and prefix match, no camelCase, no `_`.
- **MUST NOT** coin a new role suffix; reuse an existing one or the suffix defined by the relevant `*-structure` skill.
