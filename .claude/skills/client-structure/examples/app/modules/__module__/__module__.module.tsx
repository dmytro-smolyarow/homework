'use client'

import { type FC, useEffect } from 'react'

import { use<Api>Mutation } from '@/app/entities/api/<api>'
import { <Element>Component } from '@/app/modules/<module>/elements/<element>'
import { use<Module>Store } from '@/app/modules/<module>/<module>.store'
import { <Container>Component } from '@/app/shared/components/<container>'
import { <Widget>Component } from '@/app/widgets/<widget>'
import { <analytics>Client } from '@/pkg/<analytics>'

// interface
interface IProps {
  <param>: string
}

// component
const <Module>Module: FC<Readonly<IProps>> = (props) => {
  const { <param> } = props

  const <state> = use<Module>Store((state) => state.<state>)
  const { mutateAsync: <action> } = use<Api>Mutation()

  useEffect(() => {
    <analytics>Client.track('PageViewed', { page: '<module>' })
  }, [])

  // return
  return (
    <<Container>Component>
      <<Widget>Component />
      <<Element>Component />
    </<Container>Component>
  )
}

export default <Module>Module
