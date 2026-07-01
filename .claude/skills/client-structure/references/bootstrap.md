# Bootstrap a new Next.js client (Mode A)

Step-by-step scaffold for a fresh Next.js client that conforms to the `client-structure` pattern. The end state is an empty App Router project with the Layer/Slice/Segment skeleton in place, ready for the first module.

## 1. `create-next-app`

```bash
npx create-next-app@latest <project> \
  --typescript \
  --eslint \
  --app \
  --src-dir \
  --tailwind \
  --import-alias '@/*' \
  --no-turbopack-build
```

The flags lock in: TypeScript, ESLint, App Router, `src/` directory, Tailwind, `@/*` path alias pointing at `src/*`. Turbopack stays on for dev (the default); only the build flag is opted out unless the project specifically needs it on.

After it runs, delete the boilerplate `src/app/page.tsx` and `src/app/layout.tsx` — the FSD tree will replace them.

## 2. `package.json`

Set:
- `"type": "module"`, `"private": true`
- `"engines": { "node": ">=20" }`
- Optional Volta pin: `{ "node": "<version>", "yarn": "<version>" }`

Scripts:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "type-check": "tsc --noEmit",
  "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --fix",
  "prettier": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss}\"",
  "format": "yarn type-check && yarn lint && yarn prettier"
}
```

Dependencies: `next`, `react`, `react-dom`, `zod`, `@t3-oss/env-nextjs`, `@tanstack/react-query`, `zustand`. Add `next-intl` if i18n is in scope.

Dev dependencies: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-prettier`, `eslint-plugin-simple-import-sort`, `prettier`, `tailwindcss`, `@tailwindcss/postcss`.

## 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "incremental": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Path alias `@/*` → `src/*` is what every example file in this skill assumes.

## 4. Tooling configs

**`eslint.config.mjs`** — flat config extending `next/core-web-vitals`, `next/typescript`, and `prettier`. Plugins: `@typescript-eslint`, `simple-import-sort`, `prettier`. Import groups (matches the worker/server skills so the project stays consistent):
```
[['^node:'], ['^\\w'], ['^@(?!/)\\w'], ['^@/'], ['^\\./'], ['^.+\\.?(css)$']]
```

**`.prettierrc`**:
```json
{
  "bracketSpacing": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "printWidth": 120,
  "jsxSingleQuote": true,
  "endOfLine": "auto"
}
```

**`.prettierignore`** — `node_modules`, `.next`, `dist`, `out`.

**`.gitignore`** — keep what `create-next-app` ships, then add `.env*` (keep `.env.example`), and explicitly **do not** ignore `.claude/` — the skill travels with the repo.

**Tailwind v4** — `postcss.config.mjs` configured by `create-next-app` already includes `@tailwindcss/postcss`. The CSS-first config lives in `src/config/styles/global.css` (`@import 'tailwindcss';` plus any project-level `@theme` blocks). No JS-side `tailwind.config.ts` is needed for v4 unless you use plugins that require it.

## 5. `src/config/`

- `env/env.client.ts` — `@t3-oss/env-nextjs` `createEnv({ client: { … }, runtimeEnv: { … } })`. Every `NEXT_PUBLIC_*` var declared in the Zod schema and re-stated in `runtimeEnv` (Next.js inlining only catches direct `process.env.NEXT_PUBLIC_*` references, so the explicit mapping is required).
- `env/env.server.ts` — same shape with `server: { … }` for secrets and server-only vars.
- `env/index.ts` — `export { envClient } from './env.client'`, `export { envServer } from './env.server'`.
- `fonts/font.ts` — `next/font` declarations exported as named consts.
- `fonts/index.ts` — barrel.
- `styles/global.css` — Tailwind v4 entry + global tokens.

Document every env var in `.env.example`.

## 6. `src/pkg/`

Start with the integrations the first module actually needs. Typical first slots (keep `pkg/` flat as `pkg/<name>/`, or group under a parent like `pkg/lib/<name>/` — pick one and stay consistent):
- `pkg/<rest-api>/` — REST client (ky/axios/fetch wrapper) returning typed responses; exposes an SSR-safe fetcher used by every `<api>.api.ts`.
- `pkg/<locale>/` — i18n routing config (if i18n is in scope; e.g. a `next-intl` setup exporting `routing`, `usePathname`, `useRouter`).
- `pkg/<theme>/` — shadcn/Tailwind primitives, theme provider, `cn` helper.

Each pkg folder owns its `index.ts` and stays liftable. Read configuration from `envClient` / `envServer`, never `process.env` directly.

## 7. `src/app/(web)/` (and `[locale]` for i18n)

- `src/app/(web)/[locale]/layout.tsx` — root layout. Server Component. Sets `<html lang>`, applies the font variable from `config/fonts`, mounts global providers from `pkg/*` (theme, query, i18n), imports `@/config/styles/global.css`.
- `src/app/(web)/[locale]/page.tsx` — root page. RSC. May `prefetchQuery` from `entities/api/<api>` and pass the dehydrated client into `<HydrationBoundary>` around a module.
- `src/app/(web)/[locale]/error.tsx` — error boundary (`'use client'` is required by Next.js for error files).
- `src/app/(web)/[locale]/not-found.tsx` — 404 fallback.
- Route groups `(public)` / `(private)` are added later as the route map grows.

Without i18n, drop `[locale]` and place `layout.tsx`/`page.tsx` directly under `src/app/(web)/`.

## 8. `src/app/(api)/api/` (optional)

Add `src/app/(api)/api/<route>/route.ts` only when the client needs a route handler (BFF proxy, secret-gated revalidation, dynamic asset). Skip the folder entirely if the project has no server routes — `(web)` alone is fine.

## 9. First entity api slice

Scaffold `src/app/entities/api/<api>/{<api>.api.ts, <api>.query.ts, <api>.mutation.ts, index.ts}` and the matching model `src/app/entities/models/<api>.model.ts`. Add the queryKey value to `EEntityKey` in `src/app/shared/interfaces/entities.interface.ts`. Confirm `<api>.api.ts` and `<api>.query.ts` do **not** carry `'use client'`; only `<api>.mutation.ts` does.

## 10. First module

Scaffold `src/app/modules/<module>/{<module>.module.tsx, index.ts}` and the optional `<module>.service.ts` / `<module>.store.ts` / `<module>.interface.ts` / `<module>.constant.ts` as needed. The `<module>.module.tsx` carries `'use client'` when the module needs client state/effects; otherwise leave it RSC.

Mount the module from `src/app/(web)/[locale]/page.tsx` (or the relevant nested page).

## 11. `src/middleware.ts`

Single file at `src/` root. Composes: locale routing (e.g. `next-intl/middleware`), session-cookie issuance, header rewrites, private route gates. Reads from `config/env/` and the relevant `pkg/<auth>/` slot. Do not import from modules/widgets/features. Set `config.matcher` to skip Next.js internals and static assets.

## 12. Verify

```bash
yarn format
yarn build
yarn dev
```

- `yarn format` chains `type-check → lint → prettier`. All three must pass.
- `yarn build` must complete without environment-variable errors (the Zod schema in `env.client.ts` runs at build time and will throw if a required var is missing).
- `yarn dev` (or `bun dev` if Bun is the dev runtime) must boot. Open the root URL, confirm the first module renders, navigate one private route and confirm the middleware redirect fires when unauthenticated.

## 13. `.claude/` directory

Keep `.claude/skills/client-structure/` checked in so the skill travels with the repo. Add a thin `CLAUDE.md` at the repo root that points at the skill rather than restating the architecture.
