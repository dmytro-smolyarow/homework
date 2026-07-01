"use client";

import { type FC } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/pkg/auth/auth-client";
import {
  favoriteIdsQueryOptions,
  useToggleFavoriteMutation,
} from "@/app/entities/api/favorites";

// interface
interface IProps {
  itemId: string;
}

// component
const FavoriteButton: FC<Readonly<IProps>> = (props) => {
  const { itemId } = props;

  const { data: session, isPending } = useSession();
  const router = useRouter();

  // only fetched once signed in
  const { data: favoriteIds = [] } = useQuery({
    ...favoriteIdsQueryOptions(),
    enabled: !!session,
  });
  const isFavorite = favoriteIds.includes(itemId);

  const mutation = useToggleFavoriteMutation(itemId, isFavorite);

  // not logged in — send to login (favorites are auth-only)
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

  // return
  return (
    <button
      className={`btn fav ${isFavorite ? "active" : ""}`}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {isFavorite ? "★ In favorites" : "☆ Add to favorites"}
    </button>
  );
};

export default FavoriteButton;
