import { count, desc, eq, ilike } from "drizzle-orm";
import { db } from "./client";
import { favorites, items } from "./schema";

export const DEFAULT_PAGE_SIZE = 8;

export type ListItemsParams = {
  search?: string;
  page?: number;
  pageSize?: number;
};

// list items — optional search + pagination
export async function listItems({
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: ListItemsParams = {}) {
  const where = search ? ilike(items.title, `%${search}%`) : undefined;
  const offset = (page - 1) * pageSize;

  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(items)
      .where(where)
      .orderBy(desc(items.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(items).where(where),
  ]);

  const total = totalRow[0]?.value ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// get item by id
export async function getItemById(id: string) {
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0] ?? null;
}

// favorite count — how many users favorited an item
export async function getFavoriteCount(itemId: string) {
  const rows = await db
    .select({ value: count() })
    .from(favorites)
    .where(eq(favorites.itemId, itemId));
  return rows[0]?.value ?? 0;
}
