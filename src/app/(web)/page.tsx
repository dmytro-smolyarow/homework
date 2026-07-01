import { type NextPage } from "next";

import { listItems } from "@/pkg/db";
import { CatalogModule } from "@/app/modules/catalog";

// force dynamic — always read fresh from supabase
export const dynamic = "force-dynamic";

// page
const Page: NextPage = async () => {
  const initialData = await listItems();

  // return
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
};

export default Page;
