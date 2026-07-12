import type { IFavoriteRow } from '@/app/entities/models'
import { fetcher } from '@/pkg/fetcher'

// favorites list
export async function fetchFavorites(): Promise<IFavoriteRow[]> {
  return fetcher<IFavoriteRow[]>('/api/favorites')
}

// favorite ids
export async function fetchFavoriteIds(): Promise<string[]> {
  return fetcher<string[]>('/api/favorites/ids')
}

// add favorite
export async function addFavoriteRequest(itemId: string): Promise<void> {
  await fetcher('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
}

// remove favorite
export async function removeFavoriteRequest(itemId: string): Promise<void> {
  await fetcher(`/api/favorites?itemId=${itemId}`, {
    method: 'DELETE',
  })
}
