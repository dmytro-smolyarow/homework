"use client";

import Link from "next/link";
import { useItemQuery } from "@/app/entities/api/items";
import type { ItemDetail } from "@/app/entities/models";
import { FavoriteButton } from "@/app/features/favorite-button";

export function ItemDetailsModule({
  initialData,
}: {
  initialData: ItemDetail;
}) {
  const { data: item } = useItemQuery(initialData.id, initialData);

  return (
    <div>
      <Link href="/" className="muted">
        ← Back to catalog
      </Link>
      <div className="detail" style={{ marginTop: 16 }}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cover" src={item.imageUrl} alt={item.title} />
        ) : (
          <div className="cover" style={{ aspectRatio: "2/3" }} />
        )}
        <div>
          <h1 style={{ marginTop: 0 }}>{item.title}</h1>
          <p>
            <span className="badge">
              ★ Favorited {item.favoriteCount}{" "}
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
}
