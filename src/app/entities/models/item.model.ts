// item — serialization-safe shape, no drizzle imports (keeps client bundle clean)
export interface IItem {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  createdAt: string
}

// items response
export interface IItemsResponse {
  items: IItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// item detail
export interface IItemDetail extends IItem {
  favoriteCount: number
}
