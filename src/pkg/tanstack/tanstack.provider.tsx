'use client'

import { type FC, type ReactNode, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// interface
interface IProps {
  children: ReactNode
}

// component
const QueryProvider: FC<Readonly<IProps>> = (props) => {
  const { children } = props

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  // return
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default QueryProvider
