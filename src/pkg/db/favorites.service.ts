import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { favorites, items } from "./schema";

// Favorites of a specific user, with the joined item data.
export async function listFavorites(userId: string) {
  return db
    .select({
      favoriteId: favorites.id,
      createdAt: favorites.createdAt,
      item: items,
    })
    .from(favorites)
    .innerJoin(items, eq(favorites.itemId, items.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
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
