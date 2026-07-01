"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchFavorites,
  queryKeys,
  removeFavoriteRequest,
  type FavoriteRow,
} from "@/lib/api";

export function FavoritesList() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: fetchFavorites,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeFavoriteRequest(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous =
        queryClient.getQueryData<FavoriteRow[]>(queryKeys.favorites) ?? [];
      queryClient.setQueryData<FavoriteRow[]>(
        queryKeys.favorites,
        previous.filter((f) => f.item.id !== itemId),
      );
      return { previous };
    },
    onError: (_e, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.favoriteIds });
    },
  });

  if (isLoading) {
    return <p className="muted">Loading…</p>;
  }

  if (favorites.length === 0) {
    return (
      <p className="muted">
        No favorites yet. Browse the <Link href="/">catalog</Link> and add some.
      </p>
    );
  }

  return (
    <div className="grid">
      {favorites.map((fav) => (
        <div key={fav.favoriteId} className="card">
          <Link href={`/items/${fav.item.id}`}>
            {fav.item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="cover"
                src={fav.item.imageUrl}
                alt={fav.item.title}
              />
            ) : (
              <div className="cover" />
            )}
          </Link>
          <div className="body">
            <Link href={`/items/${fav.item.id}`} className="title">
              {fav.item.title}
            </Link>
            <button
              className="btn"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate(fav.item.id)}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
