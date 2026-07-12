import type { Metadata } from 'next'
import { type FC, type ReactNode } from 'react'

import { Navbar } from '@/app/widgets/navbar'
import { fontSans } from '@/config/fonts'
import { QueryProvider } from '@/pkg/tanstack'

import '@/config/styles/global.css'

// metadata
export const metadata: Metadata = {
  title: 'BookShelf — a tiny catalog',
  description: 'Next.js 16 + Drizzle + Supabase + Better Auth + TanStack Query',
}

// interface
interface IProps {
  children: ReactNode
}

// layout
const RootLayout: FC<Readonly<IProps>> = (props) => {
  const { children } = props

  // return
  return (
    <html lang='en' className={fontSans.variable}>
      <body>
        <QueryProvider>
          <Navbar />
          <main className='container'>{children}</main>
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
