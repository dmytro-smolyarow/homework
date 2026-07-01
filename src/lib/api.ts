import type { Item } from "@/db/schema";

export type ItemsResponse = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ItemDetail = Item & { favoriteCount: number };

export type FavoriteRow = {
  favoriteId: string;
  createdAt: string;
  item: Item;
};

export const queryKeys = {
  items: (search: string, page: number) => ["items", { search, page }] as const,
  item: (id: string) => ["item", id] as const,
  favorites: ["favorites"] as const,
  favoriteIds: ["favorite-ids"] as const,
};

export async function fetchItems(
  search: string,
  page: number,
): Promise<ItemsResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  const res = await fetch(`/api/items?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load items");
  return res.json();
}

export async function fetchItem(id: string): Promise<ItemDetail> {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) throw new Error("Failed to load item");
  return res.json();
}

export async function fetchFavorites(): Promise<FavoriteRow[]> {
  const res = await fetch("/api/favorites");
  if (!res.ok) throw new Error("Failed to load favorites");
  return res.json();
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const res = await fetch("/api/favorites/ids");
  if (!res.ok) throw new Error("Failed to load favorite ids");
  return res.json();
}

export async function addFavoriteRequest(itemId: string): Promise<void> {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
}

export async function removeFavoriteRequest(itemId: string): Promise<void> {
  const res = await fetch(`/api/favorites?itemId=${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}
