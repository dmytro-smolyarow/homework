import { z } from 'zod'

// bad request response schema
export const SBadRequestRes = z.object({
  error: z.string(),
  message: z.string().optional(),
})

// unauthorized response schema
export const SUnauthorizedRes = z.object({
  error: z.string(),
  message: z.string().optional(),
})

// not found response schema
export const SNotFoundRes = z.object({
  error: z.string(),
  message: z.string().optional(),
})

// internal error response schema
export const SInternalErrorRes = z.object({
  error: z.string(),
})
