"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ItemsResponse, ItemDetail } from "@/app/entities/models";
import { fetchItem, fetchItems } from "./items.api";

export const itemsKeys = {
  list: (search: string, page: number) =>
    ["items", { search, page }] as const,
  detail: (id: string) => ["item", id] as const,
};

export function useItemsQuery(
  search: string,
  page: number,
  initialData?: ItemsResponse,
) {
  return useQuery({
    queryKey: itemsKeys.list(search, page),
    queryFn: () => fetchItems(search, page),
    placeholderData: keepPreviousData,
    initialData: search === "" && page === 1 ? initialData : undefined,
  });
}

export function useItemQuery(id: string, initialData: ItemDetail) {
  return useQuery({
    queryKey: itemsKeys.detail(id),
    queryFn: () => fetchItem(id),
    initialData,
  });
}
