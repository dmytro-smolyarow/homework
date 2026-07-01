// Server-safe pkg barrel. (Client code imports "@/pkg/auth/auth-client" directly.)
export * from "./db";
export { auth, getSession, type Session } from "./auth";
