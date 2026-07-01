import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, items } from "@/db/schema";

export const DEFAULT_PAGE_SIZE = 8;

export type ListItemsParams = {
  search?: string;
  page?: number;
  pageSize?: number;
};

// List items (public). Supports optional search + pagination.
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
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(items)
      .where(where),
  ]);

  const total = totalRow[0]?.count ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getItemById(id: string) {
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0] ?? null;
}

// Favorites of a specific user, with the joined item data.
export async function listFavorites(userId: string) {
  const rows = await db
    .select({
      favoriteId: favorites.id,
      createdAt: favorites.createdAt,
      item: items,
    })
    .from(favorites)
    .innerJoin(items, eq(favorites.itemId, items.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  return rows;
}

// Only the item ids the user has favorited (used to render toggle state).
export async function listFavoriteItemIds(userId: string) {
  const rows = await db
    .select({ itemId: favorites.itemId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return rows.map((r) => r.itemId);
}

export async function addFavorite(userId: string, itemId: string) {
  const rows = await db
    .insert(favorites)
    .values({ userId, itemId })
    .onConflictDoNothing({
      target: [favorites.userId, favorites.itemId],
    })
    .returning();
  return rows[0] ?? null;
}

export async function removeFavorite(userId: string, itemId: string) {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)));
}

// Bonus: how many times an item was favorited (across all users).
export async function getFavoriteCount(itemId: string) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(favorites)
    .where(eq(favorites.itemId, itemId));
  return rows[0]?.count ?? 0;
}
