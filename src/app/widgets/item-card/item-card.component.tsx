import Link from 'next/link'
import { type FC } from 'react'

import type { IItem } from '@/app/entities/models'
import { CoverImage } from '@/app/shared/components'

// interface
interface IProps {
  item: IItem
}

// component
const ItemCard: FC<Readonly<IProps>> = (props) => {
  const { item } = props

  // return
  return (
    <Link href={`/items/${item.id}`} className='card'>
      <CoverImage src={item.imageUrl} alt={item.title} />
      <div className='body'>
        <div className='title'>{item.title}</div>
        {item.description && <div className='desc'>{item.description}</div>}
      </div>
    </Link>
  )
}

export default ItemCard
