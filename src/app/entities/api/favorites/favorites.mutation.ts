"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { IFavoriteRow } from "@/app/entities/models";
import {
  addFavoriteRequest,
  removeFavoriteRequest,
} from "./favorites.api";
import { favoriteIdsQueryOptions, favoritesQueryOptions } from "./favorites.query";

const idsKey = favoriteIdsQueryOptions().queryKey;
const listKey = favoritesQueryOptions().queryKey;

// favorite toggle hook
// optimistic update on the ids cache, rollback on error
export function useToggleFavoriteMutation(itemId: string, isFavorite: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      isFavorite ? removeFavoriteRequest(itemId) : addFavoriteRequest(itemId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: idsKey });
      const previous = queryClient.getQueryData<string[]>(idsKey) ?? [];
      const next = isFavorite
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId];
      queryClient.setQueryData(idsKey, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(idsKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: idsKey });
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

// favorite remove hook
// optimistic update on the favorites list, rollback on error
export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeFavoriteRequest(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous =
        queryClient.getQueryData<IFavoriteRow[]>(listKey) ?? [];
      queryClient.setQueryData<IFavoriteRow[]>(
        listKey,
        previous.filter((f) => f.item.id !== itemId),
      );
      return { previous };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
      queryClient.invalidateQueries({ queryKey: idsKey });
    },
  });
}
