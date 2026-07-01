import { NextResponse } from "next/server";
import { getSession } from "@/pkg/auth";
import { listFavoriteItemIds } from "@/pkg/db";

// GET /api/favorites/ids -> array of item ids the current user favorited.
// Used to render toggle state on the list/detail pages.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([], { status: 200 });
  }

  const ids = await listFavoriteItemIds(session.user.id);
  return NextResponse.json(ids);
}
