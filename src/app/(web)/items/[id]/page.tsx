import { type NextPage } from "next";
import { notFound } from "next/navigation";

import { getFavoriteCount, getItemById } from "@/pkg/db";
import { ItemDetailsModule } from "@/app/modules/item-details";

// force dynamic — always read fresh from supabase
export const dynamic = "force-dynamic";

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
