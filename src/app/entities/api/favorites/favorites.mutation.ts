'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { IFavoriteRow, IItemDetail } from '@/app/entities/models'
import { EEntityKey } from '@/app/shared/interfaces'

import { addFavoriteRequest, removeFavoriteRequest } from './favorites.api'
import { favoriteIdsQueryOptions, favoritesQueryOptions } from './favorites.query'

const idsKey = favoriteIdsQueryOptions().queryKey
const listKey = favoritesQueryOptions().queryKey

// favorite toggle hook
// optimistic update on the ids cache + the detail count, rollback on error
export function useToggleFavoriteMutation(itemId: string, isFavorite: boolean) {
  const queryClient = useQueryClient()

  // detail cache key — sourced from the shared enum to avoid importing the items slice
  const itemKey = [EEntityKey.QUERY_ITEM, itemId]
  const delta = isFavorite ? -1 : 1

  return useMutation({
    mutationFn: () => (isFavorite ? removeFavoriteRequest(itemId) : addFavoriteRequest(itemId)),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: idsKey }),
        queryClient.cancelQueries({ queryKey: itemKey }),
      ])

      const previousIds = queryClient.getQueryData<string[]>(idsKey) ?? []
      const nextIds = isFavorite ? previousIds.filter((id) => id !== itemId) : [...previousIds, itemId]
      queryClient.setQueryData(idsKey, nextIds)

      // bump the "Favorited N times" counter live (only if the detail is cached)
      const previousItem = queryClient.getQueryData<IItemDetail>(itemKey)
      if (previousItem) {
        queryClient.setQueryData<IItemDetail>(itemKey, {
          ...previousItem,
          favoriteCount: Math.max(0, previousItem.favoriteCount + delta),
        })
      }

      return { previousIds, previousItem }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(idsKey, context.previousIds)
      }
      if (context?.previousItem) {
        queryClient.setQueryData(itemKey, context.previousItem)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: idsKey })
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: itemKey })
    },
  })
}

// favorite remove hook
// optimistic update on the favorites list, rollback on error
export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => removeFavoriteRequest(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const previous = queryClient.getQueryData<IFavoriteRow[]>(listKey) ?? []
      queryClient.setQueryData<IFavoriteRow[]>(
        listKey,
        previous.filter((f) => f.item.id !== itemId),
      )
      return { previous }
    },
    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey })
      queryClient.invalidateQueries({ queryKey: idsKey })
    },
  })
}
