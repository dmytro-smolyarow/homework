import { E<Module>Step } from '@/app/modules/<module>/<module>.interface'

// default step
export const DEFAULT_<MODULE>_STEP = E<Module>Step.INTRO

// step order
export const <MODULE>_STEP_ORDER: readonly E<Module>Step[] = [
  E<Module>Step.INTRO,
  E<Module>Step.DETAILS,
  E<Module>Step.DONE,
] as const
