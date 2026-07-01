// <widget> service
// composes multiple features/entities behind one coordinator
// pure logic — no Hono routing, no DO class. DO classes live in entities/models/.

import { <featureA>Service } from '../../features/<featureA>'
import { <featureB>Service } from '../../features/<featureB>'
import { <entity> } from '../../entities/models'
import type { I<Widget>Input, I<Widget>Result } from './<widget>.interface'

// <widget> service
export const <widget>Service = {
  // run
  run: async (
    env: Cloudflare<Entry>Bindings,
    input: I<Widget>Input,
  ): Promise<I<Widget>Result> => {
    // resolve the per-key DO instance via the entity accessor (lives in entities/models/)
    const stub = <entity>(env, input.partitionKey)

    // compose features — features stay pure; the widget orders them
    const a = await <featureA>Service.<verb>(env, input.payload)
    const b = await <featureB>Service.<verb>(env, a)

    // hand off to the DO for any per-key persisted work
    const persisted = await stub.apply(b)

    return { ok: true, persisted }
  },
}
