import type { I<Feature>Input, I<Feature>Output } from './<feature>.interface'

// <feature> service — single reusable capability, pure logic, no Fastify routing
export const <feature>Service = {
  // <verb>
  <verb>: async (input: I<Feature>Input): Promise<I<Feature>Output> => {
    // … domain work; may read from pkg/* clients or entities/models
    const output: I<Feature>Output = { /* … */ } as I<Feature>Output
    return output
  },
}
