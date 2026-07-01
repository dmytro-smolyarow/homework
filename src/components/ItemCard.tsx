import Link from "next/link";
import type { Item } from "@/db/schema";

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`} className="card">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cover" src={item.imageUrl} alt={item.title} />
      ) : (
        <div className="cover" />
      )}
      <div className="body">
        <div className="title">{item.title}</div>
        {item.description && <div className="desc">{item.description}</div>}
      </div>
    </Link>
  );
}
