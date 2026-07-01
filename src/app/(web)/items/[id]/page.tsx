import { notFound } from "next/navigation";
import { getFavoriteCount, getItemById } from "@/pkg/db";
import { ItemDetailsModule } from "@/app/modules/item-details";

// Always read fresh data from Supabase on each request.
export const dynamic = "force-dynamic";

// Thin page: server-side fetch via Drizzle, presentation lives in the module.
export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  const favoriteCount = await getFavoriteCount(id);
  const initialData = JSON.parse(JSON.stringify({ ...item, favoriteCount }));

  return <ItemDetailsModule initialData={initialData} />;
}
