import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/pkg/auth'

// GET,POST /api/auth/*
export const { GET, POST } = toNextJsHandler(auth)
