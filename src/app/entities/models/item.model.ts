// Domain model for a catalog item (plain, serialization-friendly types — no
// server/Drizzle imports so the client bundle stays clean).
export interface Item {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ItemDetail extends Item {
  favoriteCount: number;
}
