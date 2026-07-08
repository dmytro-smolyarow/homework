"use client";

import { type FC } from "react";
import Link from "next/link";

import type { IFavoriteRow } from "@/app/entities/models";
import { CoverImage } from "@/app/shared/components";

// interface
interface IProps {
  favorite: IFavoriteRow;
  onRemove: (itemId: string) => void;
  removing: boolean;
}

// component
const FavoriteCard: FC<Readonly<IProps>> = (props) => {
  const { favorite, onRemove, removing } = props;
  const { item } = favorite;

  // return
  return (
    <div className="card">
      <Link href={`/items/${item.id}`}>
        <CoverImage src={item.imageUrl} alt={item.title} />
      </Link>
      <div className="body">
        <Link href={`/items/${item.id}`} className="title">
          {item.title}
        </Link>
        <button
          className="btn"
          disabled={removing}
          onClick={() => onRemove(item.id)}
        >
          ✕ Remove
        </button>
      </div>
    </div>
  );
};

export default FavoriteCard;
