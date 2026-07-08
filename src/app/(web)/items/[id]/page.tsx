import { type NextPage } from "next";
import { notFound } from "next/navigation";

import { getFavoriteCount, getItemById } from "@/app/shared/services";
import { ItemDetailsModule } from "@/app/modules/item-details";

// isr — favoriteCount is a cross-user aggregate, 60s staleness is acceptable
export const revalidate = 60;

// interface
interface IProps {
  params: Promise<{ id: string }>;
}

// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { params } = props;
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  const favoriteCount = await getFavoriteCount(id);
  const initialData = JSON.parse(JSON.stringify({ ...item, favoriteCount }));

  // return
  return <ItemDetailsModule initialData={initialData} />;
};

export default Page;
