import { z } from 'zod'

// shared validators — note: file is `validation.ts`, not `*.validation.ts`
export const emailSchema = z.string().email({ message: 'Invalid email' })

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(128, { message: 'Password must be at most 128 characters' })
