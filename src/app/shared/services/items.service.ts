import { count, desc, eq, ilike } from 'drizzle-orm'

import { db, favorites, items } from '@/pkg/db'

export const DEFAULT_PAGE_SIZE = 8

// a malformed id is definitionally "not found" — don't send it to a uuid column
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ListItemsParams = {
  search?: string
  page?: number
  pageSize?: number
}

// list items — optional search + pagination
export async function listItems({ search, page = 1, pageSize = DEFAULT_PAGE_SIZE }: ListItemsParams = {}) {
  const where = search ? ilike(items.title, `%${search}%`) : undefined
  const offset = (page - 1) * pageSize

  const [rows, totalRow] = await Promise.all([
    db.select().from(items).where(where).orderBy(desc(items.createdAt)).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(items).where(where),
  ])

  const total = totalRow[0]?.value ?? 0

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

// get item by id
export async function getItemById(id: string) {
  // guard: invalid uuid -> not found (avoids a Postgres 500 on bad URLs)
  if (!UUID_RE.test(id)) return null
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1)
  return rows[0] ?? null
}

// favorite count — how many users favorited an item
export async function getFavoriteCount(itemId: string) {
  const rows = await db.select({ value: count() }).from(favorites).where(eq(favorites.itemId, itemId))
  return rows[0]?.value ?? 0
}
