import { redirect } from "next/navigation";
import { getSession } from "@/pkg/auth";
import { FavoritesModule } from "@/app/modules/favorites";

// Protected route. proxy.ts already redirects unauthenticated users, but we
// also verify the session on the server here (defense in depth).
export default async function FavoritesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/favorites");
  }

  return (
    <div>
      <h1>Your favorites</h1>
      <p className="muted">Saved by {session.user.email}</p>
      <FavoritesModule />
    </div>
  );
}
