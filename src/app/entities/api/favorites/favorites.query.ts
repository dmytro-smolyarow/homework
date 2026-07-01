"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFavoriteIds, fetchFavorites } from "./favorites.api";

export const favoritesKeys = {
  list: ["favorites"] as const,
  ids: ["favorite-ids"] as const,
};

export function useFavoritesQuery() {
  return useQuery({
    queryKey: favoritesKeys.list,
    queryFn: fetchFavorites,
  });
}

export function useFavoriteIdsQuery(enabled: boolean) {
  return useQuery({
    queryKey: favoritesKeys.ids,
    queryFn: fetchFavoriteIds,
    enabled,
  });
}
