import { listItems } from "@/lib/queries";
import { ItemsBrowser } from "@/components/ItemsBrowser";

// Always read fresh data from Supabase on each request.
export const dynamic = "force-dynamic";

// Server component: initial list is rendered on the server via Drizzle,
// then handed to the client for TanStack Query to take over.
export default async function HomePage() {
  const initialData = await listItems();

  return (
    <div>
      <h1>Catalog</h1>
      <p className="muted">
        A tiny catalog of programming books — browse, open details, and save
        your favorites.
      </p>
      <ItemsBrowser initialData={JSON.parse(JSON.stringify(initialData))} />
    </div>
  );
}
