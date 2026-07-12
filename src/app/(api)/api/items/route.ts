import { type NextRequest, NextResponse } from 'next/server'

import { DEFAULT_PAGE_SIZE, listItems } from '@/app/shared/services'

// GET /api/items
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search')?.trim() || undefined
  const page = Number(searchParams.get('page')) || 1
  const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE

  const result = await listItems({ search, page, pageSize })
  return NextResponse.json(result)
}
