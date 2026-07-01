"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/pkg/auth/auth-client";
import {
  useFavoriteIdsQuery,
  useToggleFavoriteMutation,
} from "@/app/entities/api/favorites";

export function FavoriteButton({ itemId }: { itemId: string }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { data: favoriteIds = [] } = useFavoriteIdsQuery(!!session);
  const isFavorite = favoriteIds.includes(itemId);

  const mutation = useToggleFavoriteMutation(itemId, isFavorite);

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
