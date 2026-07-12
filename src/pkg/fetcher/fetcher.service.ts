// fetcher — thin fetch wrapper: parses JSON responses, throws on non-2xx
export async function fetcher<T = void>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }

  // only parse when the response actually carries JSON
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await res.json()) as T
  }

  return undefined as T
}
