// Server-safe exports only. Client components import "./auth-client" directly
// so the server `auth` instance (which pulls in the DB driver) never ends up
// in the client bundle.
export { auth, type Session } from './auth'
export { getSession } from './session'
