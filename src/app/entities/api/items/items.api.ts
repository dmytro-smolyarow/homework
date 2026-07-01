import type { IItemsResponse, IItemDetail } from "@/app/entities/models";

// items list
export async function fetchItems(
  search: string,
  page: number,
): Promise<IItemsResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  const res = await fetch(`/api/items?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load items");
  return res.json();
}

// item
export async function fetchItem(id: string): Promise<IItemDetail> {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) throw new Error("Failed to load item");
  return res.json();
}
