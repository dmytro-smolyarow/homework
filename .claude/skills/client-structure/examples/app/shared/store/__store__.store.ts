import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { DEVTOOLS_ENABLED } from '@/app/shared/constants/devtools.constant'
import { STORAGE_KEY } from '@/app/shared/constants/storage-key.constant'

// interface
interface I<Store>State {
  <field>: string | null
  set<Field>: (value: string | null) => void
  reset: () => void
}

// store
export const use<Store>Store = create<I<Store>State>()(
  persist(
    devtools(
      (set) => ({
        <field>: null,
        set<Field>: (value) => set({ <field>: value }),
        reset: () => set({ <field>: null }),
      }),
      { enabled: DEVTOOLS_ENABLED },
    ),
    {
      name: STORAGE_KEY.<store>,
      version: 1,
      partialize: (state) => ({ <field>: state.<field> }),
    },
  ),
)
