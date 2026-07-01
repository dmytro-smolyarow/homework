"use client";

import { type FC } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  favoritesQueryOptions,
  useRemoveFavoriteMutation,
} from "@/app/entities/api/favorites";

// component
const FavoritesModule: FC = () => {
  const { data: favorites = [], isLoading } = useQuery(favoritesQueryOptions());
  const removeMutation = useRemoveFavoriteMutation();

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

  // return
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
};

export default FavoritesModule;
