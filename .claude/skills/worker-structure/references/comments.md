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
- Side effects that are not visible from the function signature (cache invalidation, metric emission, downstream notifications).
- A workaround for a platform quirk, race condition, or upstream bug — name the cause.
- Ordering constraints (`// must run before <X> — <reason>`).

Even then, prefer **two short lines or one sentence under 15 words** over a paragraph. If a paragraph is needed, the symbol is probably doing too much and should be split.

## What earns a comment

- Top-level exports (`// <name>` above `export const <name> = ...`).
- Sections inside a setup file (`// global middleware`, `// health check`, `// routes`).
- Route handlers — use HTTP shorthand: `// VERB /path` (e.g. `// GET /<resource>`, `// POST /<resource>/:id`).
- Methods inside a service / class — single-verb label of the operation (`// get all`, `// create`, `// update`).
- Empty stub barrels — single line declaring purpose (`// shared utils`).

## What does not earn a comment

- Local variables.
- Trivial expressions.
- Self-evident names (do not write `// add two numbers` above `add(a, b)`).
- Restating types (the type system already says it).

## When to expand beyond the identifier

A comment becomes worth more than its name when it captures **non-obvious context** the reader cannot derive from the code:

- A hidden constraint or invariant.
- A workaround for a specific bug or platform quirk.
- Behaviour that would surprise a reader.
- The reason a non-default value was chosen.

In those cases, keep the line short and factual; if the explanation needs paragraphs, the symbol or surrounding code likely deserves a refactor instead.

## Examples (canonical)

```ts
// server
const app = new Hono<{ Bindings: CloudflareBindings }>()

// global middleware
app.use('*', serverConfig.logger, serverConfig.cors, serverConfig.timeout)

// health check
app.get('/', (c) => c.text('Server is running...'))

// routes
app.route('/v1', serverRoutes)
```

```ts
// <module> module
const <module>Module = new Hono<{ Bindings: CloudflareBindings }>().basePath('/<module>')

// GET /<module>
<module>Module.get('/', cache({ /* … */ }), (ctx) => <module>Service.getAll(ctx))

// POST /<module>
<module>Module.post('/', zValidator('json', SCreate<Module>Req), async (ctx) => { /* … */ })
```

```ts
// <module> service
export const <module>Service = {
  // get all
  getAll: async (ctx: Context) => { /* … */ },

  // get one
  getOne: async (ctx: Context) => { /* … */ },
}
```

```ts
// <entity> response schema
export const S<Entity>Res = z.object({ /* … */ })
```

### Stretched comments — when complexity earns more words

```ts
// <symbol>
// triggers a side effect not visible from the signature
const <symbol> = (...) => { /* … */ }
```

```ts
// <symbol>
// non-default config: <one-clause reason>
const <symbol> = createThing({ /* … */ })
```

```ts
// must run before <other symbol> — <one-clause reason>
const <symbol> = (...) => { /* … */ }
```

The expanded line names the **reason**. After reading it, the reader stops needing to ask why.

## Anti-patterns

```ts
// This function gets all the records from the database, parses them with Zod
// and returns them as a JSON response with a meta block.   ← prose, too long
getAll: async (ctx) => { /* … */ }

const x = 1 // assign one to x   ← inline, restates the code

/**
 * @param ctx Hono context
 * @returns the response                                     ← JSDoc, redundant with types
 */
function handler(ctx: Context) { /* … */ }
```

## Stub barrels

Empty placeholder folders carry exactly one line that names the segment:

```ts
// shared utils
```

The line acts as both documentation and a marker that the folder is intentional, not abandoned.
