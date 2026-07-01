# Comments style

Short label-style comments above named symbols. Comments orient the reader by **expanding on the identifier name** in 1–5 words; they do not explain the implementation.

## Hard rules

- Use `//` line comments only. No JSDoc, no `/* */` blocks.
- Place the comment **above** the symbol, never inline at end of line, never below.
- **Default length: 1–5 words.** Longer is allowed only when complexity demands it (see below).
- Lowercase. No trailing punctuation on short labels; full sentences may use punctuation when the comment is genuinely sentence-length.
- One blank line between the previous block and the comment; the comment immediately precedes the symbol.

## When a longer comment is justified

The 1–5 word rule applies to ~95% of comments. Stretch beyond it only when **the symbol's behaviour is non-obvious from its name and signature** and a future reader would otherwise need to trace the code to understand intent. Concretely:

- Multi-step or branching logic where a one-line summary saves the reader from reconstructing the flow.
- A non-default config choice that affects callers (e.g. cache TTL, retry count, partition key strategy).
- Side effects that are not visible from the function signature (cache header mutation, metric emission, downstream notifications).
- A workaround for a platform quirk, race condition, or upstream bug — name the cause.
- Ordering constraints (`// must run before <X> — <reason>`).

Even then, prefer **two short lines or one sentence under 15 words** over a paragraph.

## What earns a comment

- Top-level exports (`// <name>` above `export const <name> = ...`).
- Sections inside a setup file (`// plugins`, `// auth`, `// routes`).
- Route handlers — use HTTP shorthand: `// VERB /path` (e.g. `// GET /<resource>/:id`, `// POST /<resource>`).
- Methods inside a service object — single-verb label of the operation (`// get one`, `// create`, `// update`).
- Empty stub barrels — single line declaring purpose (`// entity DTOs`).

## What does not earn a comment

- Local variables.
- Trivial expressions.
- Self-evident names (do not write `// add two numbers` above `add(a, b)`).
- Restating types (the type system already says it).

## Examples (canonical)

```ts
// server
const server = Fastify(serverConfig).withTypeProvider<ZodTypeProvider>()

// plugins
server.register(fastifyCors, corsConfig)
server.register(cookie, cookieConfig)

// auth
server.register(authPlugin)

// routes
serverRoutes(server)
```

```ts
// auth plugin — decorates server.authenticate and server.authenticateAdmin
// must be wrapped with fp() so decorators are visible across the entire server scope
const authPlugin: FastifyPluginAsync = async (fastify) => { ... }
```

```ts
// <module> module
export const <module>Module = (server: FastifyInstance) => {
  // GET /<module>/:id
  server.route({ method: 'GET', url: '/<module>/:id', ... })

  // POST /<module>
  server.route({ method: 'POST', url: '/<module>', ... })
}
```

```ts
// <module> service
export const <module>Service = {
  // get one
  getOne: async (server, req, reply) => { ... },

  // create
  create: async (server, req, reply) => { ... },
}
```

```ts
// <entity> data schema
export const S<Entity>Data = z.object({ ... })
```

### Stretched comments — when complexity earns more words

```ts
// <symbol>
// triggers a side effect not visible from the signature
const <symbol> = (...) => { ... }
```

```ts
// must run before <other symbol> — <one-clause reason>
const <symbol> = (...) => { ... }
```

## Anti-patterns

```ts
// This function gets all the records from the database, parses them with Zod
// and returns them as a JSON response.   ← prose, too long
getAll: async (server, req, reply) => { ... }

const x = 1 // assign one to x   ← inline, restates the code

/**
 * @param req FastifyRequest
 * @returns FastifyReply                  ← JSDoc, redundant with types
 */
async function handler(req, reply) { ... }
```

## Stub barrels

Empty placeholder folders carry exactly one line that names the segment:

```ts
// entity DTOs
```

The line acts as both documentation and a marker that the folder is intentional, not abandoned.
