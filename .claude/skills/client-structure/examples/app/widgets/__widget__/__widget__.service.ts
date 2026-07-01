import { I<Widget>Content } from '@/app/widgets/<widget>/<widget>.interface'

// build content
export const build<Widget>Content = (input: { <field>: string }): I<Widget>Content => {
  return {
    <items>: [],
  }
}
