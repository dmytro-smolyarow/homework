"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FavoriteRow } from "@/app/entities/models";
import {
  addFavoriteRequest,
  removeFavoriteRequest,
} from "./favorites.api";
import { favoritesKeys } from "./favorites.query";

// Toggle a favorite by item id, with optimistic update + rollback on the
// "favorite ids" cache (used by list/detail toggle buttons).
export function useToggleFavoriteMutation(itemId: string, isFavorite: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      isFavorite ? removeFavoriteRequest(itemId) : addFavoriteRequest(itemId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.ids });
      const previous =
        queryClient.getQueryData<string[]>(favoritesKeys.ids) ?? [];
      const next = isFavorite
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId];
      queryClient.setQueryData(favoritesKeys.ids, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoritesKeys.ids, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.ids });
      queryClient.invalidateQueries({ queryKey: favoritesKeys.list });
    },
  });
}

// Remove a favorite from the favorites list, with optimistic update + rollback.
export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeFavoriteRequest(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.list });
      const previous =
        queryClient.getQueryData<FavoriteRow[]>(favoritesKeys.list) ?? [];
      queryClient.setQueryData<FavoriteRow[]>(
        favoritesKeys.list,
        previous.filter((f) => f.item.id !== itemId),
      );
      return { previous };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoritesKeys.list, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.list });
      queryClient.invalidateQueries({ queryKey: favoritesKeys.ids });
    },
  });
}
