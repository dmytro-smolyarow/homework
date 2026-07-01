import { <featureA>Service } from '../../features/<featureA>'
import { <featureB>Service } from '../../features/<featureB>'
import type { I<Widget>Input, I<Widget>Result } from './<widget>.interface'

// <widget> service — composes multiple features/entities behind one coordinator, pure logic, no Fastify routing
export const <widget>Service = {
  // run
  run: async (input: I<Widget>Input): Promise<I<Widget>Result> => {
    // compose features — features stay pure; the widget orders them
    const a = await <featureA>Service.<verb>(input.payload)
    const b = await <featureB>Service.<verb>(a)

    return { ok: true, result: b }
  },
}
