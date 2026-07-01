# Bootstrap a new server (Mode A)

Step-by-step scaffold for a fresh Fastify 5 + Zod service that conforms to the `server-structure` pattern.

## 1. `package.json`

Set:
- `"type": "module"`, `"private": true`
- `"engines": { "node": ">=22" }`
- `"packageManager": "yarn@1.22.22"` (or your preferred manager)

Core scripts:
```json
{
  "dev": "nodemon src/server.ts",
  "build": "tsup src/server.ts --out-dir dist",
  "start": "node dist/server.js",
  "type-check": "tsc --noEmit",
  "lint": "eslint \"src/**/*.{ts,tsx}\" --fix",
  "prettier": "prettier --write \"src/**/*.{ts,tsx}\"",
  "format": "yarn type-check && yarn lint && yarn prettier"
}
```

Core dependencies:
```
fastify fastify-plugin fastify-type-provider-zod
@fastify/cors @fastify/cookie @fastify/compress @fastify/multipart @fastify/rate-limit
@fastify/swagger @fastify/swagger-ui
zod @t3-oss/env-core dotenv
```

Dev dependencies:
```
typescript @types/node ts-node tsup nodemon
eslint @eslint/js @typescript-eslint/parser @typescript-eslint/eslint-plugin
eslint-config-prettier eslint-plugin-prettier eslint-plugin-simple-import-sort prettier
```

Optional (add as needed):
```
fastify-cacheman       # Redis/memory caching
@fastify/multipart     # file upload
pino-pretty            # dev logger
```

## 2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

## 3. Tooling configs

**`.prettierrc`**:
```json
{
  "bracketSpacing": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": false,
  "printWidth": 120,
  "endOfLine": "auto"
}
```

**`eslint.config.mjs`** — flat config extending `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `prettier`. Import groups:
```
[['^node:'], ['^\\w'], ['^@(?!/)\\w'], ['^@/'], ['^\\./'], ['^.+\\.?(css)$']]
```

**`.gitignore`** — ignore `node_modules/`, `dist/`, `.env`. Keep `.env.example`. **Do not** ignore `.claude/` — the skill must travel with the repo.

## 4. `src/config/`

- `env.config.ts` — `@t3-oss/env-core` + Zod over `process.env`. Export `envConfig`. At minimum declare `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `JWT_SECRET`. Always pull env values through this object.
- `server.config.ts` — `FastifyServerOptions` (`serverConfig`), cors (`corsConfig`), cookie (`cookieConfig`), compress (`compressConfig`), rate-limit (`rateLimitConfig`). All consume `envConfig`.
- `swagger.config.ts` — optional, only when documenting the API.
- `index.ts` — barrel.

Document every env var in `.env.example`.

## 5. `src/pkg/`

- `pkg/auth/` — Fastify plugin that decorates `server.authenticate` and `server.authenticateAdmin`. Wrap with `fp` from `fastify-plugin` so decorators are visible across the entire server scope.
  - `auth.plugin.ts` — `fp(async (fastify) => { fastify.decorate('authenticate', ...) })`
  - `auth.service.ts` — pure session validation logic
  - `auth.interface.ts` — `declare module 'fastify' { interface FastifyInstance { authenticate: ... } interface FastifyRequest { user?: ... } }`
  - `index.ts` — barrel
- `pkg/middleware/` — catch-all for generic Fastify hooks that don't deserve their own pkg folder.

## 6. `src/server.ts`

```ts
const server = Fastify(serverConfig).withTypeProvider<ZodTypeProvider>()

// plugins
server.register(fastifyCors, corsConfig)
server.register(cookie, cookieConfig)
server.register(compress, compressConfig)
server.register(multipart)
server.register(rateLimit, rateLimitConfig)

// auth
server.register(authPlugin)

// swagger — dev only
if (envConfig.NODE_ENV !== 'production') {
  server.register(fastifySwagger, swaggerConfig)
  server.register(fastifySwaggerUi, swaggerUiConfig)
}

// zod type provider
server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

// routes
serverRoutes(server)

const start = async () => {
  try {
    await server.listen({ port: envConfig.PORT, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
```

## 7. `src/app/routes/server.routes.ts`

```ts
export const serverRoutes = (server: FastifyInstance) => {
  server.get(`${routePrefixV1}/health`, { schema: { hide: true } }, () => 'OK')
  server.register(<module>Module, { prefix: routePrefixV1 })
  server.all(`${routePrefixV1}/*`, async (request, reply) => {
    return reply.status(404).send({ error: 'Not Found', message: `Route ${request.method}:${request.url} not found` })
  })
}
```

## 8. First module

Scaffold `src/app/modules/<module>/{<module>.module.ts, <module>.service.ts, index.ts}` and `src/app/entities/dto/<module>.dto.ts`. Add the matching `entities/models/` file only if the module needs persistence.

## 9. Verify

```bash
yarn dev
```

- `GET http://localhost:4000/api/v1/health` must return `OK`.
- Unauthenticated requests to a protected route must return `401`.
- `POST` with an invalid body must return `400` with `{ error: 'Bad Request', message: '...' }`.
- `yarn format` must pass with no errors.

## 10. `.claude/` directory

Keep `.claude/skills/server-structure/` checked in so the skill travels with the repo.
