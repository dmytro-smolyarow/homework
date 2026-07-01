import type { Metadata } from 'next'
import { type FC, type ReactNode } from 'react'

import { <RootLayoutModule> } from '@/app/modules/<layout>'
import { envClient } from '@/config/env'
import { fontPrimary } from '@/config/fonts'
import { <Provider> } from '@/pkg/<integration>'

import '@/config/styles/global.css'

// interface
interface IProps {
  children: ReactNode
}

// metadata
export const metadata: Metadata = {
  metadataBase: new URL(envClient.<NEXT_PUBLIC_WEB_URL>),
  title: '<App name>',
  description: '<App description>',
}

// layout
const RootLayout: FC<Readonly<IProps>> = (props) => {
  const { children } = props

  // return
  return (
    <html lang='en' className={fontPrimary.variable}>
      <body>
        <<Provider>>
          <<RootLayoutModule>>{children}</<RootLayoutModule>>
        </<Provider>>
      </body>
    </html>
  )
}

export default RootLayout
