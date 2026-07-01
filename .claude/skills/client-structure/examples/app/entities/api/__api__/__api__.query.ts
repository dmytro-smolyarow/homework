import { queryOptions } from '@tanstack/react-query'

import { <api>QueryApi } from '@/app/entities/api/<api>/<api>.api'
import { I<Api>Params } from '@/app/entities/models/<api>.model'
import { EEntityKey } from '@/app/shared/interfaces/entities.interface'

// <api> query options
export const <api>QueryOptions = (queryParams: I<Api>Params) => {
  return queryOptions({
    queryKey: [EEntityKey.QUERY_<API>, queryParams.id],
    queryFn: (params) => <api>QueryApi(params, queryParams),
    enabled: Boolean(queryParams.id),
  })
}
