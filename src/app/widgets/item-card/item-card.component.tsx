import { type FC } from "react";
import Link from "next/link";

import type { IItem } from "@/app/entities/models";

// interface
interface IProps {
  item: IItem;
}

// component
const ItemCard: FC<Readonly<IProps>> = (props) => {
  const { item } = props;

  // return
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
};

export default ItemCard;
