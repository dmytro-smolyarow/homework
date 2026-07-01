# Comments style

Short label-style comments above named symbols. Comments orient the reader by **expanding on the identifier name** in 1–5 words; they do not explain the implementation.

## Hard rules

- Use `//` line comments only. No JSDoc, no `/* */` blocks. JSX comments (`{/* */}`) are allowed inside markup when truly needed.
- Place the comment **above** the symbol, never inline at end of line, never below.
- **Default length: 1–5 words.** Longer is allowed only when complexity demands it (see below).
- Lowercase. No trailing punctuation on short labels; full sentences may use punctuation when the comment is genuinely sentence-length.
- One blank line between the previous block and the comment; the comment immediately precedes the symbol.

## When a longer comment is justified

The 1–5 word rule applies to ~95% of comments. Stretch beyond it only when **the symbol's behaviour is non-obvious from its name and signature** and a future reader would otherwise need to trace the code to understand intent. Concretely:

- Multi-step or branching logic where a one-line summary saves the reader from reconstructing the flow.
- A non-default config choice that affects callers (e.g. cache TTL, `revalidate` value, query `enabled` predicate).
- Side effects that are not visible from the function signature (analytics event, cache prefetch, cookie write).
- A workaround for a platform quirk, hydration mismatch, or third-party SDK bug — name the cause.
- Ordering constraints (`// must run before <X> — <reason>`).
- A non-obvious `'use client'` decision (e.g. why a widget needs the client runtime).

Even then, prefer **two short lines or one sentence under 15 words** over a paragraph. If a paragraph is needed, the symbol is probably doing too much and should be split.

## What earns a comment

- Top-level exports (`// <name>` above `export const <name> = ...`).
- Section markers inside a page/layout/middleware file (`// metadata`, `// cache`, `// interface`, `// component`, `// return`, `// config`).
- Page / route handler files — use `// page`, `// layout`, `// metadata` for Next.js conventions; route handlers use HTTP shorthand `// VERB /path` (e.g. `// GET /api/<route>`, `// POST /api/<route>/:id`).
- Module/component/widget/feature exports — single label of the role (`// component`, `// module`, `// widget`).
- TanStack hooks — name the action (`// <api> create hook`, `// <api> query options`).
- Service/store actions — single-verb label (`// get all`, `// create`, `// reset`).
- Empty stub barrels — single line declaring purpose (`// shared utils`).

## What does not earn a comment

- Local variables.
- Trivial expressions.
- Self-evident names (do not write `// add two numbers` above `add(a, b)`).
- Restating types (the type system already says it).
- `'use client'` directive — it's a directive, not a symbol.

## When to expand beyond the identifier

A comment becomes worth more than its name when it captures **non-obvious context** the reader cannot derive from the code:

- A hidden constraint or invariant (e.g. `// must run before hydration`).
- A workaround for a specific bug or platform quirk.
- Behaviour that would surprise a reader (e.g. `// silently swallows on lookup failure — UI falls back to default`).
- The reason a non-default value was chosen (e.g. `// cache 5 min — upstream rate limit is 12/min`).

In those cases, keep the line short and factual; if the explanation needs paragraphs, the symbol or surrounding code likely deserves a refactor instead.

## Examples (canonical)

```tsx
// metadata
export const metadata: Metadata = { /* … */ }

// interface
interface IProps {
  children: ReactNode
}

// component
const <Component>: FC<Readonly<IProps>> = (props) => {
  const { children } = props

  // return
  return <div>{children}</div>
}

export default <Component>
```

```tsx
// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { params } = props
  const { locale } = await params

  // cache
  // … prefetch …

  return <<Module>Module locale={locale} />
}
```

```ts
// <api> query options
export const <api>QueryOptions = (queryParams: I<Api>Params) => {
  return queryOptions({ /* … */ })
}

// <api> create hook
export const use<Api>CreateMutation = () => {
  return useMutation({ /* … */ })
}
```

```ts
// <module> service
export const <module>Service = {
  // get all
  getAll: async () => { /* … */ },

  // create
  create: async (input: I<Module>Input) => { /* … */ },
}
```

```ts
// POST /api/<route>
export const POST = async (req: NextRequest) => { /* … */ }
```

### Stretched comments — when complexity earns more words

```ts
// <symbol>
// triggers an analytics event not visible from the signature
const <symbol> = (...) => { /* … */ }
```

```ts
// <symbol>
// cache 5 min — upstream rate limit is 12/min
export const revalidate = 300
```

```ts
// must hydrate before <other symbol> — server-rendered value would otherwise flash
const <symbol> = (...) => { /* … */ }
```

The expanded line names the **reason**. After reading it, the reader stops needing to ask why.

## Anti-patterns

```ts
// This function gets all the records from the database, parses them with Zod
// and returns them as a JSON response with a meta block.   ← prose, too long
getAll: async () => { /* … */ }

const x = 1 // assign one to x   ← inline, restates the code

/**
 * @param props The component props
 * @returns the rendered element                            ← JSDoc, redundant with types
 */
function <Component>(props: IProps) { /* … */ }

// use client                                               ← directive isn't a symbol
'use client'
```

## Stub barrels

Empty placeholder folders carry exactly one line that names the segment:

```ts
// shared utils
```

The line acts as both documentation and a marker that the folder is intentional, not abandoned.
