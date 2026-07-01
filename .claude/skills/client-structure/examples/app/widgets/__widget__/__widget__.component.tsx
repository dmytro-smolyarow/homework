import { type FC } from 'react'

import { I<Widget>Content } from '@/app/widgets/<widget>/<widget>.interface'
import { cn } from '@/pkg/<theme>/utils'

// interface
interface IProps {
  content: I<Widget>Content
  className?: string
}

// component
const <Widget>Component: FC<Readonly<IProps>> = (props) => {
  const { content, className } = props

  // return
  return (
    <section className={cn('flex w-full flex-col gap-4', className)}>
      {content.<items>.map((item) => (
        <div key={item.id}>{item.<label>}</div>
      ))}
    </section>
  )
}

export default <Widget>Component
