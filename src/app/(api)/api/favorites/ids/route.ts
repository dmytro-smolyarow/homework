import { NextResponse } from 'next/server'

import { listFavoriteItemIds } from '@/app/shared/services'
import { getSession } from '@/pkg/auth'

// GET /api/favorites/ids
// item ids the current user favorited — drives toggle state on list/detail
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json([], { status: 200 })
  }

  const ids = await listFavoriteItemIds(session.user.id)
  return NextResponse.json(ids)
}
