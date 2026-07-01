"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import {
  addFavoriteRequest,
  fetchFavoriteIds,
  queryKeys,
  removeFavoriteRequest,
} from "@/lib/api";

export function FavoriteButton({ itemId }: { itemId: string }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: queryKeys.favoriteIds,
    queryFn: fetchFavoriteIds,
    enabled: !!session, // only fetch when logged in
  });

  const isFavorite = favoriteIds.includes(itemId);

  const mutation = useMutation({
    mutationFn: () =>
      isFavorite ? removeFavoriteRequest(itemId) : addFavoriteRequest(itemId),
    // Optimistic update with rollback on error (bonus)
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favoriteIds });
      const previous =
        queryClient.getQueryData<string[]>(queryKeys.favoriteIds) ?? [];
      const next = isFavorite
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId];
      queryClient.setQueryData(queryKeys.favoriteIds, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favoriteIds, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favoriteIds });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });

  // Not logged in -> send to login (favorites are auth-only)
  if (!session) {
    return (
      <button
        className="btn fav"
        disabled={isPending}
        onClick={() => router.push("/login?redirect=/favorites")}
      >
        ☆ Log in to favorite
      </button>
    );
  }

  return (
    <button
      className={`btn fav ${isFavorite ? "active" : ""}`}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {isFavorite ? "★ In favorites" : "☆ Add to favorites"}
    </button>
  );
}
