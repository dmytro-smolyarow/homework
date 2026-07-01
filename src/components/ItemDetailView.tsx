"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchItem, queryKeys, type ItemDetail } from "@/lib/api";
import { FavoriteButton } from "./FavoriteButton";

export function ItemDetailView({
  initialData,
}: {
  initialData: ItemDetail;
}) {
  const { data } = useQuery({
    queryKey: queryKeys.item(initialData.id),
    queryFn: () => fetchItem(initialData.id),
    initialData,
  });

  const item = data;

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
