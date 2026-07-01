"use client";

import { createAuthClient } from "better-auth/react";

import { envClient } from "@/config/env";

// auth client — browser-side better-auth
export const authClient = createAuthClient({
  baseURL: envClient.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
