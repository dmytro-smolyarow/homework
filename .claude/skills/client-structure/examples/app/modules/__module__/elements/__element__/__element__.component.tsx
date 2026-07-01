import { type FC } from 'react'

import { cn } from '@/pkg/<theme>/utils'

// interface
interface IProps {
  className?: string
  <field>: string
}

// component — module-private element
const <Element>Component: FC<Readonly<IProps>> = (props) => {
  const { className, <field> } = props

  // return
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span>{<field>}</span>
    </div>
  )
}

export default <Element>Component
