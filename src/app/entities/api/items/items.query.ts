import { queryOptions } from "@tanstack/react-query";

import { EEntityKey } from "@/app/shared/interfaces";
import { fetchItem, fetchItems } from "./items.api";

// items query options
export const itemsQueryOptions = (search: string, page: number) =>
  queryOptions({
    queryKey: [EEntityKey.QUERY_ITEMS, { search, page }],
    queryFn: () => fetchItems(search, page),
  });

// item query options
export const itemQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [EEntityKey.QUERY_ITEM, id],
    queryFn: () => fetchItem(id),
  });
