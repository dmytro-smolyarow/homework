import type { Item } from "./item.model";

export interface FavoriteRow {
  favoriteId: string;
  createdAt: string;
  item: Item;
}
