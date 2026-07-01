import type { CollectionConfig } from 'payload'

// <entity> collection
export const <Entity>Collection: CollectionConfig = {
  slug: '<entities>',
  admin: {
    defaultColumns: ['<field>', 'createdAt'],
    useAsTitle: '<field>',
    group: '<Group>',
  },
  labels: {
    singular: '<Entity>',
    plural: '<Entities>',
  },
  fields: [
    {
      type: 'text',
      name: '<field>',
      required: true,
    },
  ],
}
