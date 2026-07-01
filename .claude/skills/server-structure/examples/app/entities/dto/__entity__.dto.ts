import { z } from 'zod'

import { SBadRequestRes, SInternalErrorRes, SNotFoundRes, SUnauthorizedRes } from './common.dto'

// <entity> data schema
export const S<Entity>Data = z.object({
  id: z.string(),
  // …
})
export type I<Entity>Data = z.infer<typeof S<Entity>Data>

// get <entity> params schema
export const SGet<Entity>Params = z.object({
  id: z.string().nonempty({ message: 'Id is required' }),
})
export type IGet<Entity>Params = z.infer<typeof SGet<Entity>Params>

// create <entity> body schema
export const SCreate<Entity>Body = z.object({
  // …
})
export type ICreate<Entity>Body = z.infer<typeof SCreate<Entity>Body>

// update <entity> body schema
export const SUpdate<Entity>Body = z.object({
  // …
})
export type IUpdate<Entity>Body = z.infer<typeof SUpdate<Entity>Body>

// get <entity> response schema
export const SGet<Entity>Res = {
  200: S<Entity>Data,
  401: SUnauthorizedRes,
  404: SNotFoundRes,
  500: SInternalErrorRes,
}
export type IGet<Entity>Res = z.infer<typeof S<Entity>Data>

// create <entity> response schema
export const SCreate<Entity>Res = {
  200: S<Entity>Data,
  400: SBadRequestRes,
  401: SUnauthorizedRes,
  500: SInternalErrorRes,
}
export type ICreate<Entity>Res = z.infer<typeof S<Entity>Data>

// update <entity> response schema
export const SUpdate<Entity>Res = {
  200: S<Entity>Data,
  400: SBadRequestRes,
  401: SUnauthorizedRes,
  404: SNotFoundRes,
  500: SInternalErrorRes,
}
export type IUpdate<Entity>Res = z.infer<typeof S<Entity>Data>
