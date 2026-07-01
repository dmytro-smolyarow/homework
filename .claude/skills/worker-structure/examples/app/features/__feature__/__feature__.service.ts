// <feature> service
// single reusable capability — pure logic, no Hono routing, no DO class.
// callers pass `env` and any inputs the capability needs; the feature stays unaware of HTTP/DO context.

import type { I<Feature>Input, I<Feature>Output } from './<feature>.interface'

// <feature> service
export const <feature>Service = {
  // <verb>
  <verb>: async (
    env: Cloudflare<Entry>Bindings,
    input: I<Feature>Input,
  ): Promise<I<Feature>Output> => {
    // … domain work; may delegate to entities/models or pkg/* clients
    const output: I<Feature>Output = { /* … */ } as I<Feature>Output
    return output
  },
}
