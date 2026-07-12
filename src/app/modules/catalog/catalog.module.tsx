'use client'

import { type FC, useState } from 'react'
import { useForm } from 'react-hook-form'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { itemsQueryOptions } from '@/app/entities/api/items'
import type { IItemsResponse } from '@/app/entities/models'
import { ItemCard } from '@/app/widgets/item-card'

interface ISearchForm {
  search: string
}

// interface
interface IProps {
  initialData: IItemsResponse
}

// component
const CatalogModule: FC<Readonly<IProps>> = (props) => {
  const { initialData } = props

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm<ISearchForm>({
    defaultValues: { search: '' },
  })

  // initialData only seeds the first, unsearched page
  const { data, isFetching } = useQuery({
    ...itemsQueryOptions(search, page),
    placeholderData: keepPreviousData,
    initialData: search === '' && page === 1 ? initialData : undefined,
  })

  const onSubmit = (values: ISearchForm) => {
    setSearch(values.search.trim())
    setPage(1)
  }

  const clearSearch = () => {
    reset({ search: '' })
    setSearch('')
    setPage(1)
  }

  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  // return
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className='row' style={{ marginBottom: 20 }}>
        <input className='input' placeholder='Search books by title…' {...register('search')} />
        <button className='btn primary' type='submit'>
          Search
        </button>
        {search && (
          <button className='btn' type='button' onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      {search && (
        <p className='muted' style={{ marginTop: 0 }}>
          Results for “{search}” — {data?.total ?? 0} found
        </p>
      )}

      {items.length === 0 ? (
        <p className='muted'>No books found.</p>
      ) : (
        <div className='grid'>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='pagination'>
          <button className='btn' disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Prev
          </button>
          <span className='muted'>
            Page {page} / {totalPages}
          </span>
          <button
            className='btn'
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default CatalogModule
