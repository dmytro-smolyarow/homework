import { notFound } from "next/navigation";
import { getFavoriteCount, getItemById } from "@/lib/queries";
import { ItemDetailView } from "@/components/ItemDetailView";

// Always read fresh data from Supabase on each request.
export const dynamic = "force-dynamic";

// Server component: full item details rendered on the server via Drizzle.
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
  const initialData = JSON.parse(
    JSON.stringify({ ...item, favoriteCount }),
  );

  return <ItemDetailView initialData={initialData} />;
}
