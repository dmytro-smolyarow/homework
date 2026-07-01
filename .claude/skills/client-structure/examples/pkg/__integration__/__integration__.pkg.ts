import { envClient } from '@/config/env'

// <integration> client — pkg/* is self-contained: no imports from app/*, no imports from other pkg/*
export const <integration>Client = {
  init: () => {
    // … read config from envClient only …
    const baseUrl = envClient.NEXT_PUBLIC_<APP>_API_URL
    return { baseUrl }
  },

  send: (event: string, params: Record<string, unknown>) => {
    // … send …
  },
}
