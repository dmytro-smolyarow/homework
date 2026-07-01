# Server Pkg

**Purpose.** The `pkg/` (integration) layer of the Fastify + Payload server: reusable, framework-facing adapters that wrap third-party concerns so domain code never imports vendor SDKs directly. It holds a Payload toolkit (field factories, the Local-API db client, and the composed plugin list), a cache wrapper (Redis/memory + CDN headers), and the [[auth]] integration.

## Key files

- `apps/server/src/pkg/payload/fields/action/action.field.ts` — `actionFields(value?: 'link' | 'button'): Field[]` factory. A 6-option `select` (button / link variants), conditional `text`/`url`/`icon`/`iconPosition` fields, color/variant selects, and `asLink`/`openInNewTab` checkboxes. Visibility driven by `admin.condition`; `filterOptions` narrows the option set when a variant is passed.
- `apps/server/src/pkg/payload/fields/input/input.field.ts` — `inputFields(value?): Field[]` factory. Form-input group (`textInput`/`emailInput`/`password`/`phone`/`textarea`/`select`/`checkbox`/`radio`) with label/placeholder/required/info/error fields and a conditional `fieldOptions` array (shown only for select/radio/checkbox).
- `apps/server/src/pkg/payload/fields/seo/seo.field.ts` — `seoFields: Field[]`, composing `@payloadcms/plugin-seo/fields` (`OverviewField`, `MetaTitleField` with `hasGenerateFn`, `MetaDescriptionField`, `MetaImageField` → `relationTo: 'images'`).
- `apps/server/src/pkg/payload/fields/version/version.field.ts` — `versionField`, a plain object literal spread into a collection's `versions` option: `drafts.autosave.interval = 30000` (ms), `maxPerDoc = 11`.
- `apps/server/src/pkg/payload/fields/slug/slug.field.ts` — `slugField(fieldToUse = 'name', overrides) → [TextField, CheckboxField]`. The text field wires `formatSlugHook` on `beforeValidate` and points its admin `Field` component at an import-map path string; the checkbox is `slugLock` (`defaultValue: true`, hidden, sidebar).
- `apps/server/src/pkg/payload/fields/slug/slug.service.ts` — `formatSlug` (kebab-case sanitizer) + `formatSlugHook(fallback): FieldHook`.
- `apps/server/src/pkg/payload/fields/slug/slug.component.tsx` — `'use client'` `SlugComponent`. Auto-syncs the slug from the source field when locked, toggles lock via `dispatchFields`, renders read-only when locked.
- `apps/server/src/pkg/payload/fields/slug/index.scss` — styles for `.slug-field-component` (label + lock-button layout).
- `apps/server/src/pkg/payload/fields/index.ts` — fields barrel; re-exports action/input/seo/slug/version. Consumed as `@/pkg/payload/fields`.
- `apps/server/src/pkg/payload/db/db.service.ts` — `dbService = getPayload({ config })`. A **Promise** of the Payload Local-API instance; callers `await` it. Imports config via the `@payload-config` alias (same config the admin route uses).
- `apps/server/src/pkg/payload/plugins/plugin.service.ts` — `plugins: Plugin[]` composed into `payload.config.ts`: `seoPlugin` + `s3Storage` (the `images` collection → S3). A `translator` block is commented out.
- `apps/server/src/pkg/cache/cache.service.ts` — `redisCache: FastifyCachemanOptions` (`engine: 'redis'` when `REDIS_URL` set, else `'memory'`) and `cdnCache(reply, opt?)` header helper.
- `apps/server/src/pkg/cache/cache.interface.ts` — `ECacheTTL` enum (`MINUTE` 60 … `MONTHLY` 2592000, in seconds).
- `apps/server/src/pkg/cache/index.ts` — cache barrel (`export * from cache.interface / cache.service`).
- `apps/server/src/pkg/auth/auth.service.ts` — `betterAuth` instance over a `pg` Pool (cookie/session/user/account config). Full detail in [[auth]].

## Responsibilities / exports

### Payload field factories (consumed across the app layer)

These keep collection/block schema DRY. Real consumers (verified):

| Export | Consumed in |
| --- | --- |
| `slugField()` | `app/entities/collections/content/page.collection.ts:30` (spread) |
| `seoFields` | `page.collection.ts:60`, `layout-global.collection.ts:143` |
| `versionField` | `page.collection.ts:89`, `layout-global.collection.ts:148` (as `versions`) |
| `actionFields('button')` | `features/blocks/page/hero-main-block.ts:44`, `layout/header-block.ts:22` |
| `actionFields('link')` | `features/blocks/layout/footer-block.ts:34` |

See [[server-collections]] and [[server-features-blocks]] for the consuming slices.

The slug pieces work together: `slug.field.ts` references the admin component by **import-path string** — `'@/pkg/payload/fields/slug/slug.component#SlugComponent'` with `clientProps: { fieldToUse, checkboxFieldPath }` — a Payload importMap pattern (see [[payload-cms]]). Two layers of slug logic exist:

```
formatSlugHook (server, beforeValidate)  ── derives slug on create or when data.slug empty
SlugComponent  (admin client)            ── live-syncs slug from source field while slugLock is on
```

`formatSlugHook` only auto-derives on `operation === 'create'` or when `data.slug` is falsy, so a manually edited slug survives later saves. The `slugLock` checkbox (`defaultValue: true`) drives the component's auto-sync and read-only behavior.

### Payload db client

`dbService` is the Local API singleton (a Promise). Used by the CMS module: `app/modules/cms/cms.service.ts:25,62` do `const db = await dbService` then `db.findGlobal({ slug: 'layout', locale })` and `db.find({ collection: 'pages', ... })`. See [[server-modules]].

### Payload plugins

`plugins` is imported into `apps/server/src/payload.config.ts` (`import` at line 21, used at line 87). `s3Storage` maps the `images` collection to S3 using `envConfig.S3_*` values. See [[payload-cms]].

### Cache

`redisCache` is registered on the Fastify server: `server.ts:29` imports it and `server.ts:42` does `server.register(fastifyCaching, redisCache)`. The CMS module then uses `server.cacheman.get/set` with `ECacheTTL.FOUR_HOURLY` (`cms.service.ts:15,51`). See [[server-app]].

## Conventions honored

- **No `process.env`.** All env access goes through `envConfig` from `src/config` — `redisCache` reads `envConfig.REDIS_URL`; `plugins` read `envConfig.S3_*`. See [[server-config-shared]].
- **Postgres-adapter accommodation.** Every `select` field in action/input sets an explicit `dbName` and `custom: { postgres: { type: 'text' } }` (the slug field has no `select` fields — only `text` + `checkbox`). See [[database-and-migrations]].

## Depends on / talks to

- [[payload-cms]] — fields, db client, and plugins all feed `payload.config.ts`; the slug component relies on the importMap.
- [[server-collections]] / [[server-features-blocks]] — the actual consumers of the field factories.
- [[server-modules]] / [[server-app]] — consume `dbService` and the cache.
- [[auth]] — the `pkg/auth` sibling (better-auth + Fastify `authenticate` decorator).
- [[database-and-migrations]] — Postgres `dbName`/`custom.postgres.type` overrides and versions config.
- [[server-config-shared]] — `envConfig` source for all env reads.
- See also [[architecture]] and [[index]].

## Notes / discrepancies (verified)

- **`cdnCache` is unused.** Exported from `cache.service.ts` but has **zero consumers** under `apps/server/src` (grep confirms only `redisCache`/`cacheman`/`ECacheTTL` are wired). It appears to be scaffold.
- **Translator plugin is dead code.** The `translator` block in `plugin.service.ts` (lines 27–36) is fully commented out and references `@payload-enchants/translator` plus `envServer.OPENAI_API_KEY` — note `envServer`, not the repo's `envConfig`. Aspirational only.
- **Slug-hook copy/paste bug.** `slug.service.ts:19` reads `const fallbackData = data?.[fallback] || data?.[fallback]` — the same expression twice. Harmless (the `||` is a no-op) but almost certainly unintended.
- **`@ts-expect-error` typing workaround.** `slug.field.ts:26` suppresses a `Partial<TextField>` → `TextField` mismatch so `slugOverrides` can be spread in.
- **`versionField` is untyped.** Exported as a bare object literal with no Payload type annotation; `maxPerDoc: 11` is an intentional-but-unusual value (not 10).
- **`pkg/payload/index.ts` and `pkg/index.ts` are empty/absent** — there is no top-level pkg barrel; sub-areas are imported by their own paths (`@/pkg/payload/fields`, `@/pkg/payload/db`, `@/pkg/payload/plugins`, `@/pkg/cache`).
