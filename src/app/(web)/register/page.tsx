import { type NextPage } from 'next'

import { RegisterModule } from '@/app/modules/register'

// interface
interface IProps {
  searchParams: Promise<{ redirect?: string | string[] }>
}

// page
const Page: NextPage<Readonly<IProps>> = async (props) => {
  const { redirect } = await props.searchParams
  const redirectTo = typeof redirect === 'string' ? redirect : '/'

  // return
  return <RegisterModule redirectTo={redirectTo} />
}

export default Page
