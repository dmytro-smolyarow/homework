import { type NextRequest, NextResponse } from 'next/server'

import { addFavorite, listFavorites, removeFavorite } from '@/app/shared/services'
import { getSession } from '@/pkg/auth'

// GET /api/favorites
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await listFavorites(session.user.id)
  return NextResponse.json(rows)
}

// POST /api/favorites
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const itemId = body?.itemId
  if (typeof itemId !== 'string') {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
  }

  const created = await addFavorite(session.user.id, itemId)
  return NextResponse.json({ ok: true, favorite: created }, { status: 201 })
}

// DELETE /api/favorites
export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const itemId = request.nextUrl.searchParams.get('itemId')
  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
  }

  await removeFavorite(session.user.id, itemId)
  return NextResponse.json({ ok: true })
}
