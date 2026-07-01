import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Server-side session lookup (verifies against the DB). Use in server
// components and route handlers.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
