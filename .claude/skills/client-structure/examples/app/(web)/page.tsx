import { type NextPage } from 'next'

import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { <api>QueryOptions } from '@/app/entities/api/<api>'
import { <Module>Module } from '@/app/modules/<module>'
import { getQueryClient } from '@/pkg/<rest-api>'

// cache
export const revalidate = 300

// interface
interface IProps {
  params: Promise<{ <param>: string }>
}

// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { params } = props
  const { <param> } = await params

  const clientQuery = getQueryClient()
  await clientQuery.prefetchQuery(<api>QueryOptions({ /* … */ }))

  // return
  return (
    <HydrationBoundary state={dehydrate(clientQuery)}>
      <<Module>Module <param>={<param>} />
    </HydrationBoundary>
  )
}

export default Page
