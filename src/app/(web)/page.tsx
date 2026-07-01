import { listItems } from "@/pkg/db";
import { CatalogModule } from "@/app/modules/catalog";

// Always read fresh data from Supabase on each request.
export const dynamic = "force-dynamic";

// Thin page: server-side initial fetch via Drizzle, business logic lives in the
// catalog module.
export default async function HomePage() {
  const initialData = await listItems();

  return (
    <div>
      <h1>Catalog</h1>
      <p className="muted">
        A tiny catalog of programming books — browse, open details, and save
        your favorites.
      </p>
      <CatalogModule initialData={JSON.parse(JSON.stringify(initialData))} />
    </div>
  );
}
