import { type NextPage } from 'next'

import { <Module>Module } from '@/app/modules/<module>'

// interface
interface IProps {
  params: Promise<{ <param>: string }>
}

// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { params } = props
  const { <param> } = await params

  // return
  return <<Module>Module <param>={<param>} />
}

export default Page
