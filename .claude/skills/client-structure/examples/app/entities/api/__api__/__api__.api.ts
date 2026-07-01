import { QueryFunctionContext } from '@tanstack/react-query'

import { I<Api>Body, I<Api>Params, I<Api>Res } from '@/app/entities/models/<api>.model'
import { <restClient> } from '@/pkg/<rest-api>'

// <api> create
export const <api>CreateApi = async (body: I<Api>Body): Promise<I<Api>Res> => {
  const response = await <restClient>.post<I<Api>Res>('<api>', { json: body })
  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as { message?: string })?.message ?? 'Failed to create <api>')
  }

  return data
}

// <api> get
export const <api>QueryApi = async (
  opt: QueryFunctionContext,
  queryParams: I<Api>Params,
): Promise<I<Api>Res> => {
  const data = await <restClient>
    .get<I<Api>Res>(`<api>/${queryParams.id}`, { signal: opt.signal })
    .json()

  return data
}
