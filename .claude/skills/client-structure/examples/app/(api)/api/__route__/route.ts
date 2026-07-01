import { NextRequest, NextResponse } from 'next/server'

import { envServer } from '@/config/env'

// interface
interface IRequestBody {
  <field>: string
}

// POST /api/<route>
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const secret = req.headers.get('<x-header-name>')
  if (!secret || secret !== envServer.<HEADER_SECRET>) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: IRequestBody
  try {
    body = (await req.json()) as IRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // … work …

  return NextResponse.json({ ok: true })
}
