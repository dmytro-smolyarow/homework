import { headers } from 'next/headers'

import { auth } from './auth'

// get session — server-side, verifies against the db
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
