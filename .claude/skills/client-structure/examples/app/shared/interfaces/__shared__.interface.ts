// cookie keys
export enum ECookieKey {
  SESSION_ID = 'session_id',
  <KEY> = '<value>',
}

// query param keys
export enum EQueryParamKey {
  <KEY> = '<value>',
}

// entity keys — TanStack queryKey enum
export enum EEntityKey {
  QUERY_<API> = 'query-<api>',
}

// client routes
export enum E<Route> {
  BASE = '/',
  SIGN_IN = '/sign-in',
  PRIVATE = '/<private>',
}
