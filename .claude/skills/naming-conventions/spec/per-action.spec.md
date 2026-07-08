# Spec: per-action naming verification

After a specific naming action, run the matching block. Declarative `MUST` checks — read and confirm, no script.

## After `+interface` / `+type`

- **MUST** prefix an `interface` with `I` (`I<Name>`); component props are `IProps`.
- **MUST NOT** prefix a `type` alias — it is bare PascalCase (`ListItemsParams`, not `IListItemsParams`).
- **MUST** place a domain shape in a `*.model.ts` (entities) or `*.interface.ts` (shared) file, PascalCase after the `I`.

## After `+enum`

- **MUST** prefix the enum with `E` (`E<Name>`).
- **MUST** name members `UPPER_SNAKE_CASE`; string values may be kebab-case.
- **MUST** (for query-key enums) add the member to the single `EEntityKey` enum so keys stay centralised — do not create a parallel key source.

## After `+component` / `+module`

- **MUST** declare `const <Name>: FC<Readonly<IProps>> = (props) => {}` (or `NextPage`/`async` for a page) with `const { … } = props;` on the first body line.
- **MUST** name the local props interface `IProps`.
- **MUST** suffix the identifier with `Module` for a module (`<Name>Module`); use a bare PascalCase noun for any other component (no `Component` suffix).
- **MUST** `export default <Name>` and re-export from `index.ts` as `export { default as <Name> } from './<name>.…'`.
- **MUST** name the file `<kebab-name>.module.tsx` or `<kebab-name>.component.tsx`, folder kebab-case matching the prefix.

## After `+entity api` (fetcher / query / mutation)

- **MUST** name fetchers camelCase, verb-first (`fetchItems`, `getItemById`); write-fetchers may carry a `Request` suffix.
- **MUST** name query-options factories `<name>QueryOptions` (in `*.query.ts`) and mutation hooks `use<Action>Mutation` (in `*.mutation.ts`).
- **MUST** source `queryKey` from `EEntityKey.QUERY_*`, not an inline literal.
- **MUST** put each in the correctly suffixed file: `*.api.ts` / `*.query.ts` / `*.mutation.ts`.

## After `+file` (any new file or rename)

- **MUST** use `<kebab-name>.<role>.<ext>`; reuse an existing role suffix, never a new one.
- **MUST** keep the folder kebab-case and equal to the file prefix.
- **MUST** name a barrel `index.ts`; keep Next.js files as `page.tsx` / `layout.tsx` / `not-found.tsx` / `route.ts`.
- **MUST** name a module-level constant `UPPER_SNAKE_CASE`; a `config` export camelCase.
