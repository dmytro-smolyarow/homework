import { type NextPage } from 'next'

import { CatalogModule } from '@/app/modules/catalog'
import { listItems } from '@/app/shared/services'

// isr — cache the rendered list, revalidate every 5 min
// public data, no per-user state; the client refetches via tanstack for freshness
export const revalidate = 300

// page
const Page: NextPage = async () => {
  const initialData = await listItems()

  // return
  return (
    <div>
      <h1>Catalog</h1>
      <p className='muted'>A tiny catalog of programming books — browse, open details, and save your favorites.</p>
      <CatalogModule initialData={JSON.parse(JSON.stringify(initialData))} />
    </div>
  )
}

export default Page
