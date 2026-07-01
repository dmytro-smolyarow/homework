'use client'

import { type FC, useState } from 'react'

import { cn } from '@/pkg/<theme>/utils'

// interface
interface IProps {
  className?: string
  <field>?: string
}

// component
const <Feature>Component: FC<Readonly<IProps>> = (props) => {
  const { className, <field> } = props

  const [<state>, set<State>] = useState(false)

  // return
  return (
    <button
      type='button'
      className={cn('inline-flex items-center gap-2', className)}
      onClick={() => set<State>((v) => !v)}
    >
      {<field>}
    </button>
  )
}

export default <Feature>Component
