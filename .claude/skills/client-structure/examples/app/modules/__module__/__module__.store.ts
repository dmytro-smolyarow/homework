import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { DEVTOOLS_ENABLED } from '@/app/shared/constants/devtools.constant'

// interface
interface I<Module>State {
  <field>: string | null
  set<Field>: (value: string | null) => void
  reset: () => void
}

// store
export const use<Module>Store = create<I<Module>State>()(
  devtools(
    (set) => ({
      <field>: null,
      set<Field>: (value) => set({ <field>: value }),
      reset: () => set({ <field>: null }),
    }),
    { enabled: DEVTOOLS_ENABLED },
  ),
)
