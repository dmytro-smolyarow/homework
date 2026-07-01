import { NextResponse } from "next/server";

import { getSession } from "@/pkg/auth";
import { listFavoriteItemIds } from "@/pkg/db";

// GET /api/favorites/ids
// item ids the current user favorited — drives toggle state on list/detail
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([], { status: 200 });
  }

  const ids = await listFavoriteItemIds(session.user.id);
  return NextResponse.json(ids);
}
