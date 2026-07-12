import { NextResponse } from 'next/server'

import { getFavoriteCount, getItemById } from '@/app/shared/services'

// GET /api/items/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getItemById(id)

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  const favoriteCount = await getFavoriteCount(id)
  return NextResponse.json({ ...item, favoriteCount })
}
