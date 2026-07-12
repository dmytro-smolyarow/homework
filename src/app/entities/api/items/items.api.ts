import type { IItemDetail, IItemsResponse } from '@/app/entities/models'
import { fetcher } from '@/pkg/fetcher'

// items list
export async function fetchItems(search: string, page: number): Promise<IItemsResponse> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', String(page))
  return fetcher<IItemsResponse>(`/api/items?${params.toString()}`)
}

// item
export async function fetchItem(id: string): Promise<IItemDetail> {
  return fetcher<IItemDetail>(`/api/items/${id}`)
}
