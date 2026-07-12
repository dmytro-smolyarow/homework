import { type NextPage } from 'next'
import { redirect } from 'next/navigation'

import { FavoritesModule } from '@/app/modules/favorites'
import { getSession } from '@/pkg/auth'

// page
// protected — proxy.ts gates the cookie, this re-verifies the session server-side
const Page: NextPage = async () => {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirect=/favorites')
  }

  // return
  return (
    <div>
      <h1>Your favorites</h1>
      <p className='muted'>Saved by {session.user.email}</p>
      <FavoritesModule />
    </div>
  )
}

export default Page
