import { z } from 'zod'

// create <entity> request schema
export const SCreate<Entity>Req = z.object({
  id: z.string().nonempty({ message: 'Id is required' }),
  title: z.string().nonempty({ message: 'Title is required' }),
})
export type ICreate<Entity>Req = z.infer<typeof SCreate<Entity>Req>

// update <entity> request schema
export const SUpdate<Entity>Req = z.object({
  title: z.string().nonempty({ message: 'Title is required' }),
})
export type IUpdate<Entity>Req = z.infer<typeof SUpdate<Entity>Req>

// get one <entity> params schema
export const SGetOne<Entity>Params = z.object({
  id: z.string().nonempty({ message: 'Id is required' }),
})

// delete <entity> params schema
export const SDelete<Entity>Params = z.object({
  id: z.string().nonempty({ message: 'Id is required' }),
})

// <entity> data schema
const S<Entity>Data = z.object({
  id: z.string(),
  title: z.string(),
  updated_at: z.number(),
  created_at: z.number(),
})

// <entity> response schema
export const S<Entity>Res = S<Entity>Data
export type I<Entity>Res = z.infer<typeof S<Entity>Res>

// <entities> response schema (list shape)
export const S<Entities>Res = z.object({
  data: S<Entity>Data.array(),
  meta: z.object({
    total: z.number(),
  }),
})
export type I<Entities>Res = z.infer<typeof S<Entities>Res>
