import type { FavoriteRow } from "@/app/entities/models";

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
