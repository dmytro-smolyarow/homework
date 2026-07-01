# Bootstrap a new worker (Mode A)

Step-by-step scaffold for a fresh Cloudflare Workers + Hono service that conforms to the `worker-structure` pattern.

## 1. `package.json`

Set:
- `"type": "module"`, `"private": true`
- `"engines": { "node": ">=22" }`
- `"packageManager": "yarn@1.22.22"`
- Volta pin: `{ "node": "22.22.2", "yarn": "1.22.22" }`

Scripts use the per-entry config flag `-c wrangler.<entry>.jsonc`. One pair of dev/deploy/cf-typegen scripts per entry; the `<entry>` token in the script names matches the config file:
```json
{
  "type-check": "tsc --noEmit",
  "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\" --fix",
  "prettier": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss}\"",
  "format": "yarn type-check && yarn lint && yarn prettier",
  "dev": "wrangler dev --port 5000 -c wrangler.<entry>.jsonc",
  "deploy": "wrangler deploy --minify --env=$CLOUDFLARE_ENV -c wrangler.<entry>.jsonc",
  "cf-typegen": "wrangler types types-<entry>.d.ts -c wrangler.<entry>.jsonc --env-interface Cloudflare<Entry>Bindings"
}
```
For projects with multiple worker entries, duplicate the `dev`/`deploy`/`cf-typegen` triple per entry (e.g. `dev:server`, `dev:cron`, `cf-typegen:server`, `cf-typegen:cron`). Deploy environments come from `$CLOUDFLARE_ENV` at invocation time, not hard-coded in scripts.

Dependencies: `hono`, `zod`, `@hono/zod-validator`, `@t3-oss/env-core`, `dotenv`.

Dev dependencies: `wrangler`, `typescript`, `@types/node`, `eslint`, `@eslint/js`, `@eslint/eslintrc`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-prettier`, `eslint-plugin-simple-import-sort`, `prettier`.

## 2. `wrangler.<entry>.jsonc` (one per entry)

Each worker entry has its own wrangler config file at the repo root: `wrangler.server.jsonc`, `wrangler.cron.jsonc`, etc. The `<entry>` token matches `app/<entry>.ts`.

Top-level fields per file:
- `"main": "src/app/<entry>.ts"`
- recent `"compatibility_date"`
- `"compatibility_flags": ["nodejs_compat"]`
- `"assets": { "binding": "ASSETS", "directory": "./public" }` (when the entry serves static assets)

Define **four** environments per file — top-level acts as `local`, plus `env.develop`, `env.staging`, `env.production`. Each block must independently include:
- `"name": "<service>-<entry>-<env>"`
- `"services": [{ "binding": "MY_SERVICE", "service": "<service>-<entry>-<env>" }]` (self-binding)
- `"preview_urls": false`, `"workers_dev": false`
- `"observability": { "enabled": false, ... }`
- `"limits": { "cpu_ms": 200000 }`
- `"durable_objects": { "bindings": [] }`
- `"migrations": []`

There is **no inheritance** between top-level and `env.*` within one file, and **no sharing** between sibling `wrangler.<entry>.jsonc` files. Adding a binding/DO/migration/var means adding it in **every** block of **every** wrangler file that needs it.

## 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "types": ["./types-<entry>.d.ts", "node"]
  }
}
```

## 4. Tooling configs

**`eslint.config.mjs`** — flat config extending `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `prettier`. Plugins: `@typescript-eslint`, `simple-import-sort`, `prettier`. Import groups:
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

**`.gitignore`** — ignore `node_modules/`, `.wrangler`, `dist/`, `.env`, `.env.production`, `.dev.vars`, `.dev.vars*`. Keep `.env.example` and `.dev.vars.example`. **Do not** ignore `.claude/` — the skill must travel with the repo.

**`.prettierignore`** — `node_modules`, `dist`, `.wrangler`.

## 5. `src/config/`

- `env.config.ts` — `@t3-oss/env-core` + Zod over `process.env`. Export `envConfig`. Always pull env values through this object.
- `server.config.ts` — cors, timeout, rate-limit, logger options consumed by `src/app/<entry>.ts`.
- `swagger.config.ts` — only when documenting the API.
- `index.ts` — barrel.

Document every env var in `.env.example`.

## 6. `src/pkg/`

- `pkg/validator/validator.pkg.ts` — wrap `@hono/zod-validator`'s `zValidator` so failures return `ctx.json({ error: 'Bad Request', message }, 400)`. Routes must use this wrapper, not `@hono/zod-validator` directly. Validator lives in its own pkg (not under `pkg/middleware/`) — it is a validation utility, not a middleware.
- `pkg/auth/` — auth middleware reading the secret/key from `envConfig`.
- `pkg/middleware/` — generic Hono middleware that does not deserve its own pkg.
- `pkg/cache/` — only if Redis or another external cache client is in use. The Cloudflare Cache API needs no client.

## 7. `src/app/<entry>.ts`

Build the Hono app:
- `const app = new Hono<{ Bindings: CloudflareBindings }>()`
- Apply global middleware sourced from `config/server.config.ts`: `logger()`, `cors({...})`, `timeout(60000)`.
- Public health route: `app.get('/', (c) => c.text('Server is running...'))`.
- Hand off everything else to `src/app/routes/<entry>.routes.ts`.
- `app.notFound(...)` and `app.onError(...)` returning the standard `{ message }` shapes.
- Re-export every Durable Object class at module scope: `export { <DOClass> } from './app/entities/models'`.
- `export default app`.

## 8. `src/app/routes/<entry>.routes.ts`

Import each `<module>Module`, gate `/v1/*` with the auth middleware, then mount:
```ts
app.use('/v1/*', authMiddleware)
app.route('/v1', <module>Module)
```

Re-export from `src/app/routes/index.ts`.

## 9. First module

Scaffold `src/app/modules/<module>/{<module>.module.ts, <module>.service.ts, index.ts}` and `src/app/entities/dto/<module>.dto.ts`. Add the matching `entities/models/` file only if the module needs persistence.

## 10. Generate types and verify

```bash
yarn cf-typegen
yarn format
yarn dev
```

`GET http://localhost:5000/` must return the health text. Authenticated requests to `/v1/*` must return the module's responses; unauthenticated requests must return 401.

## 11. `.claude/` directory

Keep `.claude/skills/worker-structure/` checked in so the skill travels with the repo. Add a thin `CLAUDE.md` at the repo root that points at the skill rather than restating the architecture.
