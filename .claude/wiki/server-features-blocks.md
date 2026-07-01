# Server Features Blocks

## Purpose

The **Feature** layer of the [[payload-cms]] server: reusable Payload `Block` definitions (plain typed `Block` objects, no runtime logic) that content editors compose inside `blocks`-type fields to build page bodies and the site layout. Blocks are split into two slices by usage context — `page/` (page body content) and `layout/` (site chrome).

## Key files

- `apps/server/src/app/features/blocks/index.ts` — feature barrel; `export * from './layout'` + `export * from './page'`.
- `apps/server/src/app/features/blocks/layout/index.ts` — layout slice barrel; exports `HeaderBlock`, `FooterBlock`.
- `apps/server/src/app/features/blocks/layout/header-block.ts` — `HeaderBlock` (slug `headerBlock`). One field: an `actions` array (`minRows 1`, `maxRows 4`) whose rows are `actionFields('button')`.
- `apps/server/src/app/features/blocks/layout/footer-block.ts` — `FooterBlock` (slug `footerBlock`). A `columns` array (each row = required `title` text + a `links` array via `actionFields('link')`, links `minRows 1` / `maxRows 10`), a required `text` field with hardcoded `defaultValue: '© 2025 All rights reserved.'`, and a `showPersonalDataConsent` checkbox (`defaultValue: false`).
- `apps/server/src/app/features/blocks/page/index.ts` — page slice barrel; exports `HeroMainBlock`, `ImageScrollerBlock`, `StaticBlock`.
- `apps/server/src/app/features/blocks/page/hero-main-block.ts` — `HeroMainBlock` (slug `heroMainBlock`): required `title`, optional `highlightedTitle`, `subtitle` (textarea), an `action` **group** built from `actionFields('button')` (admin `className: 'group-last-container'`), and an `image` upload (`relationTo: 'images'`, `required: false`).
- `apps/server/src/app/features/blocks/page/image-scroller-block.ts` — `ImageScrollerBlock` (slug `imageScrollerBlock`): a required `list` array (`minRows 1`, `maxRows 10`) of required `image` upload fields (`relationTo: 'images'`). Does **not** import `actionFields`.
- `apps/server/src/app/features/blocks/page/static-block.ts` — `StaticBlock` (slug `staticBlock`): required `title` text and a required `content` `richText` field (label `'Legal Info'`, admin `className: 'rich-text-container'`).

### Talks to (outside this feature)

- `apps/server/src/pkg/payload/fields/action/action.field.ts` — shared `actionFields(value?: 'link' | 'button')` factory (re-exported from `@/pkg/payload/fields`), consumed by `HeaderBlock`, `FooterBlock`, `HeroMainBlock`. See [[server-pkg]].
- `apps/server/src/app/entities/collections/content/page.collection.ts:51` — consumer: `PageCollection` ('pages') wires `blocks: [StaticBlock, HeroMainBlock, ImageScrollerBlock]` into a `blocks`-type field (`minRows 1`, `maxRows 10`) under the Content tab. See [[server-collections]].
- `apps/server/src/app/entities/collections/content/layout-global.collection.ts:36` — consumer: `LayoutGlobalCollection` (global 'layout') wires `blocks: [HeaderBlock, FooterBlock]` (`maxRows 2`) under the Content tab.
- `apps/server/src/app/entities/dto/blocks.dto.ts` — hand-maintained Zod runtime mirror of each block (`SHeaderBlock`/`SFooterBlock`/`SHeroMainBlock`/`SImageScrollerBlock`/`SStaticBlock`, plus `SAction`/`SMedia`), combined into a `discriminatedUnion('blockType', ...)` `SBlock`.

## Responsibilities / exports

- Define five reusable Payload `Block` configs as typed objects, each with a unique camelCase `slug`, admin `labels`, and a `fields` array. All five import the `Block` type from `'payload'`.
- Organize blocks into two slices: `layout/` (HeaderBlock, FooterBlock) and `page/` (HeroMainBlock, ImageScrollerBlock, StaticBlock).
- Re-export everything through nested barrels so collections import via the feature path `@/app/features/blocks`.
- Compose the shared `actionFields()` factory (button/link configuration) in HeaderBlock, FooterBlock columns' links, and HeroMainBlock.action.
- Reference the `images` upload collection for media (HeroMainBlock.image, ImageScrollerBlock.list[].image).
- Provide the editing schema that, with Payload's `blocks`-type field, lets editors freely compose ordered block instances.

### Block → slug → consumer map

| Block | Slug | Slice | Used in |
|---|---|---|---|
| `HeaderBlock` | `headerBlock` | layout | `layout` global (`maxRows 2`) |
| `FooterBlock` | `footerBlock` | layout | `layout` global (`maxRows 2`) |
| `HeroMainBlock` | `heroMainBlock` | page | `pages` collection (`minRows 1`/`maxRows 10`) |
| `ImageScrollerBlock` | `imageScrollerBlock` | page | `pages` collection |
| `StaticBlock` | `staticBlock` | page | `pages` collection |

## How it fits together

```
blocks/                          page.collection.ts ─┐
├── layout/                                          ├─ blocks: [...] field
│   ├── header-block.ts ─┐       layout-global ──────┘
│   └── footer-block.ts ─┤
├── page/                ├─ uses actionFields() ── pkg/payload/fields/action
│   ├── hero-main-block.ts ─┘
│   ├── image-scroller-block.ts ── upload relationTo 'images'
│   └── static-block.ts (richText)
└── index.ts (barrel)

editor saves block instances ──► entities/dto/blocks.dto.ts (Zod SBlock) validates by blockType
```

- **page vs layout is convention, not enforcement.** Nothing in a block file marks it page-only or layout-only; the split is enforced solely by *which collection imports it*. Layout blocks land in the `layout` global; page blocks land in `pages`.
- **`actionFields()` carries Postgres specifics.** The factory injects `dbName` + `custom.postgres.type: 'text'` overrides on its select fields (`action_type`, `icon_position`, `btn_color`, `btn_variant`) — a persistence concern that lives in the shared factory, not the blocks. Relevant to [[database-and-migrations]]. The factory also drives conditional admin visibility (e.g. `url` only shows for link types / `asLink`, icon fields only for `*Icon`/`*IconOnly` variants).
- **DTO discriminates on `blockType`, not `slug`.** `blocks.dto.ts` keys its `discriminatedUnion` on the `blockType` literal (Payload's stored field name); the literal values happen to equal the slugs (e.g. `SHeaderBlock` → `blockType: 'headerBlock'`). This is the validated counterpart consumed by [[data-flow]] / [[server-modules]] read paths.

## Depends on / talks to

- [[payload-cms]] — these are Payload `Block` configs; the `blocks`-type field that hosts them is a Payload primitive.
- [[server-collections]] — `PageCollection` and `LayoutGlobalCollection` are the only consumers; they decide page vs layout placement.
- [[server-pkg]] — provides the shared `actionFields()` field factory (`@/pkg/payload/fields`).
- [[server-app]] — these blocks sit in the app `features/` layer; `entities/dto/blocks.dto.ts` (the Zod mirror) lives in the app `entities/` layer.
- [[database-and-migrations]] — Postgres `dbName`/`custom.postgres.type` overrides come in via `actionFields()`.
- [[data-flow]] — block instances saved by editors are read back and validated against `SBlock`.
- [[architecture]] and [[conventions-and-skills]] — Layer/Slice/Segment layout and the camelCase-slug / nested-barrel conventions these files follow.

## Uncertainties / notes

- **Admin thumbnails effectively unset.** The three page blocks set `imageURL: ''` (empty) and a non-empty `imageAltText` (e.g. `'Hero Main Block'`); with an empty `imageURL`, block thumbnails in the admin UI are effectively unset. Layout blocks omit `imageURL`/`imageAltText` entirely. (Verified in source; admin-UI rendering behavior not exercised.)
- **No tests for these blocks.** Field shapes are only indirectly cross-checked by the hand-maintained Zod DTOs in `entities/dto/blocks.dto.ts`, which can drift from the `Block` configs. Example drift surface: `SStaticBlock.content` is typed `z.any()` (`blocks.dto.ts:82`), discarding the `richText` shape; `SAction.text`/`SAction.url` are `nullable().optional()` even though the Payload fields are `required: true` (they are conditionally hidden in admin).
- This repo is a starter template (per the root `README.md`), so this specific block set is example/template content that a real product would replace, and may not represent a real product's blocks.
