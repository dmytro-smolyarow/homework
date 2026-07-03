export { db, schema } from "./client";
export {
  DEFAULT_PAGE_SIZE,
  listItems,
  getItemById,
  getFavoriteCount,
  type ListItemsParams,
} from "./items.service";
export {
  listFavorites,
  listFavoriteItemIds,
  addFavorite,
  removeFavorite,
} from "./favorites.service";
