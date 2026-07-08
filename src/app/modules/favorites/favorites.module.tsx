"use client";

import { type FC } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  favoritesQueryOptions,
  useRemoveFavoriteMutation,
} from "@/app/entities/api/favorites";
import { FavoriteCard } from "./elements/favorite-card";

// component
const FavoritesModule: FC = () => {
  const { data: favorites = [], isLoading } = useQuery(favoritesQueryOptions());
  const removeMutation = useRemoveFavoriteMutation();

  if (isLoading) {
    // return
    return (
      <div className="grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton cover" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <p className="muted">
        No favorites yet. Browse the <Link href="/">catalog</Link> and add some.
      </p>
    );
  }

  // return
  return (
    <div className="grid">
      {favorites.map((fav) => (
        <FavoriteCard
          key={fav.favoriteId}
          favorite={fav}
          onRemove={removeMutation.mutate}
          removing={removeMutation.isPending}
        />
      ))}
    </div>
  );
};

export default FavoritesModule;
