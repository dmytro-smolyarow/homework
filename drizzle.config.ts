import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.local' })

// Migrations use the direct/session connection (port 5432), not the pgbouncer
// transaction pooler, because DDL needs a real session.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!url) {
  throw new Error('DIRECT_URL (or DATABASE_URL) is not set')
}

export default defineConfig({
  schema: './src/pkg/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
})
