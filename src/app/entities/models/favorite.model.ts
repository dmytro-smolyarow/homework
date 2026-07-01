import type { IItem } from "./item.model";

// favorite row — favorite joined with its item
export interface IFavoriteRow {
  favoriteId: string;
  createdAt: string;
  item: IItem;
}
