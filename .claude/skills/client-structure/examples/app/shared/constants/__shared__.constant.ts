// devtools
export const DEVTOOLS_ENABLED = process.env.NODE_ENV !== 'production'

// storage keys
export const STORAGE_KEY = {
  <store>: '<app>:<store>',
} as const
