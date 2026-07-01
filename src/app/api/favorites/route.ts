import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/queries";

// GET /api/favorites -> current user's favorites (with joined item data)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listFavorites(session.user.id);
  return NextResponse.json(rows);
}

// POST /api/favorites { itemId } -> add to favorites
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const itemId = body?.itemId;
  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  const created = await addFavorite(session.user.id, itemId);
  return NextResponse.json({ ok: true, favorite: created }, { status: 201 });
}

// DELETE /api/favorites?itemId=... -> remove from favorites
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemId = request.nextUrl.searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  await removeFavorite(session.user.id, itemId);
  return NextResponse.json({ ok: true });
}
