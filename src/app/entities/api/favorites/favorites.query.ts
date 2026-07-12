import { queryOptions } from '@tanstack/react-query'

import { EEntityKey } from '@/app/shared/interfaces'

import { fetchFavoriteIds, fetchFavorites } from './favorites.api'

// favorites query options
export const favoritesQueryOptions = () =>
  queryOptions({
    queryKey: [EEntityKey.QUERY_FAVORITES],
    queryFn: fetchFavorites,
  })

// favorite ids query options
export const favoriteIdsQueryOptions = () =>
  queryOptions({
    queryKey: [EEntityKey.QUERY_FAVORITE_IDS],
    queryFn: fetchFavoriteIds,
  })
