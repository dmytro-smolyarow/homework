import { type FC, type ReactNode } from 'react'

import { cn } from '@/pkg/<theme>/utils'

// interface
interface IProps {
  children: ReactNode
  className?: string
}

// component
const <Component>Component: FC<Readonly<IProps>> = (props) => {
  const { children, className } = props

  // return
  return <div className={cn('flex w-full', className)}>{children}</div>
}

export default <Component>Component
