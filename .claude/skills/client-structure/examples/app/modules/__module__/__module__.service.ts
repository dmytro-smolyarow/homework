import { I<Module>Input, I<Module>Result } from '@/app/modules/<module>/<module>.interface'

// <module> service
export const <module>Service = {
  // build payload
  buildPayload: (input: I<Module>Input): I<Module>Result => {
    return { /* … */ } as I<Module>Result
  },

  // derive next step
  deriveNextStep: (current: string): string | null => {
    // … logic …
    return null
  },
}
