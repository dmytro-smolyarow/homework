"use client";

import { type FC } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { itemQueryOptions } from "@/app/entities/api/items";
import type { IItemDetail } from "@/app/entities/models";
import { FavoriteButton } from "@/app/features/favorite-button";
import { CoverImage } from "@/app/shared/components";

// interface
interface IProps {
  initialData: IItemDetail;
}

// component
const ItemDetailsModule: FC<Readonly<IProps>> = (props) => {
  const { initialData } = props;

  const { data: item } = useQuery({
    ...itemQueryOptions(initialData.id),
    initialData,
  });

  // return
  return (
    <div>
      <Link href="/" className="muted">
        ← Back to catalog
      </Link>
      <div className="detail" style={{ marginTop: 16 }}>
        <CoverImage src={item.imageUrl} alt={item.title} />
        <div>
          <h1 style={{ marginTop: 0 }}>{item.title}</h1>
          <p>
            <span className="badge">
              ★ Favorited{" "}
              <span key={item.favoriteCount} className="fav-count">
                {item.favoriteCount}
              </span>{" "}
              {item.favoriteCount === 1 ? "time" : "times"}
            </span>
          </p>
          {item.description && <p>{item.description}</p>}
          <div style={{ marginTop: 20 }}>
            <FavoriteButton itemId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModule;
